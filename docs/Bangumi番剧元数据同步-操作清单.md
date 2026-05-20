# Bangumi 番剧元数据自动同步 — 操作清单

> 日期：2026-05-16

## 目标

通过 Bangumi API 自动拉取当季番剧元数据，存入 `anime` 表。

---

## 第一步：数据库变更

在 MySQL 中执行：

```sql
ALTER TABLE anime ADD COLUMN bgm_id BIGINT DEFAULT NULL COMMENT 'Bangumi ID';
CREATE INDEX idx_bgm_id ON anime (bgm_id);
```

验证：

```sql
DESC anime;
SHOW INDEX FROM anime WHERE Key_name = 'idx_bgm_id';
```

---

## 第二步：修改 AnimeDO 实体类

在 `cycani-backend/src/main/java/com/yunyun/dao/entity/AnimeDO.java` 末尾追加：

```java
/**
 * Bangumi ID，用于同步去重
 */
private Long bgmId;
```

> DTO 类（AnimePageRespDTO、AnimeDetailRespDTO 等）不需要改，bgmId 是内部去重字段，前端不会用到。

---

## 第三步：新建 API 响应 DTO

**文件** `cycani-backend/src/main/java/com/yunyun/dto/resp/BangumiCalendarRespDTO.java`：

```java
package com.yunyun.dto.resp;

import lombok.Data;
import java.util.List;

@Data
public class BangumiCalendarRespDTO {
    private Weekday weekday;
    private List<Subject> items;

    @Data
    public static class Weekday {
        private String cn;
    }

    @Data
    public static class Subject {
        private Long id;
        private String name;
        private String name_cn;
        private String summary;
        private Images images;
        private Rating rating;
        private Integer total_episodes;
        private String air_date;
        private List<Tag> tags;
    }

    @Data
    public static class Images {
        private String large;
    }

    @Data
    public static class Rating {
        private Double score;
    }

    @Data
    public static class Tag {
        private String name;
    }
}
```

---

## 第四步：新建 Service 接口

**文件** `cycani-backend/src/main/java/com/yunyun/service/BangumiService.java`：

```java
package com.yunyun.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.yunyun.dao.entity.AnimeDO;

public interface BangumiService extends IService<AnimeDO> {

    /**
     * 从 Bangumi 日历 API 同步当季番剧元数据到 anime 表
     * @return 新入库的番剧数量
     */
    int syncCalendar();

    /**
     * 从 Bangumi 批量导入历史番剧（按年份范围遍历所有季度）
     * @param startYear 起始年份（含）
     * @param endYear   结束年份（含）
     * @return 新入库的番剧数量
     */
    int syncHistory(int startYear, int endYear);
}
```

---

## 第五步：新建 Service 实现（核心逻辑）

**文件** `cycani-backend/src/main/java/com/yunyun/service/impl/BangumiServiceImpl.java`：

```java
package com.yunyun.service.impl;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.yunyun.dao.entity.AnimeDO;
import com.yunyun.dao.mapper.AnimeMapper;
import com.yunyun.service.BangumiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class BangumiServiceImpl extends ServiceImpl<AnimeMapper, AnimeDO> implements BangumiService {

    @Value("${bangumi.api-base:https://api.bgm.tv}")
    private String apiBase;

    private static final HttpClient HTTP = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Override
    public int syncCalendar() {
        String body = fetchCalendar();
        if (StrUtil.isBlank(body)) return 0;

        JSONArray calendar = JSONUtil.parseArray(body);
        int count = 0;

        for (int i = 0; i < calendar.size(); i++) {
            JSONArray items = calendar.getJSONObject(i).getJSONArray("items");
            if (CollUtil.isEmpty(items)) continue;

            for (int j = 0; j < items.size(); j++) {
                try {
                    if (saveSubject(items.getJSONObject(j), true)) count++;
                } catch (Exception e) {
                    log.warn("单条番剧入库失败: {}", e.getMessage());
                }
            }
        }

        log.info("Bangumi 同步完成，新入库 {} 部番剧", count);

        // 把已过季但还标着 ongoing 的旧番剧改成 completed
        int updated = updateCompletedStatus();
        log.info("状态刷新：{} 部番剧标记为完结", updated);

        return count;
    }

    @Override
    public int syncHistory(int startYear, int endYear) {
        int[] months = {1, 4, 7, 10}; // 冬春夏秋
        int total = 0;

        for (int year = startYear; year <= endYear; year++) {
            for (int month : months) {
                int offset = 0;
                while (true) {
                    String body = fetchSubjects(year, month, offset);
                    if (StrUtil.isBlank(body)) break;

                    JSONObject page = JSONUtil.parseObj(body);
                    JSONArray data = page.getJSONArray("data");
                    if (CollUtil.isEmpty(data)) break;

                    for (int i = 0; i < data.size(); i++) {
                        try {
                            if (saveSubject(data.getJSONObject(i), false)) total++;
                        } catch (Exception e) {
                            log.warn("历史番剧入库失败: {}", e.getMessage());
                        }
                    }

                    // Bangumi 每页最多 100 条，不够 100 说明最后一页
                    if (data.size() < 100) break;
                    offset += 100;
                }

                // Bangumi 未认证限流约 1 req/s，避免被拒
                try { Thread.sleep(1000); } catch (InterruptedException ignored) {}
            }
        }

        log.info("历史同步完成：{}-{} 年共入库 {} 部番剧", startYear, endYear, total);
        return total;
    }

    private String fetchCalendar() {
        try {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(apiBase + "/calendar"))
                    .timeout(Duration.ofSeconds(15))
                    .header("User-Agent", "YunyunAnime/1.0")
                    .GET()
                    .build();
            HttpResponse<String> resp = HTTP.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) {
                log.error("Bangumi API 返回非 200: {}", resp.statusCode());
                return null;
            }
            return resp.body();
        } catch (Exception e) {
            log.error("调用 Bangumi API 失败", e);
            return null;
        }
    }

    private String fetchSubjects(int year, int month, int offset) {
        try {
            String url = apiBase + "/v0/subjects?type=2&year=" + year
                    + "&season_month=" + month + "&limit=100&offset=" + offset;
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(15))
                    .header("User-Agent", "YunyunAnime/1.0")
                    .GET()
                    .build();
            HttpResponse<String> resp = HTTP.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) {
                log.error("Bangumi subjects API 返回非 200: {}", resp.statusCode());
                return null;
            }
            return resp.body();
        } catch (Exception e) {
            log.error("调用 Bangumi subjects API 失败", e);
            return null;
        }
    }

    private boolean saveSubject(JSONObject item, boolean fromCalendar) {
        Long bgmId = item.getLong("id");

        if (lambdaQuery().eq(AnimeDO::getBgmId, bgmId).count() > 0) {
            return false;
        }

        String title = StrUtil.isNotBlank(item.getStr("name_cn"))
                ? item.getStr("name_cn")
                : item.getStr("name");

        AnimeDO anime = new AnimeDO();
        anime.setBgmId(bgmId);
        anime.setTitle(title);
        anime.setAltTitle(item.getStr("name"));
        anime.setDescription(item.getStr("summary"));
        anime.setCoverUrl(extractImage(item));
        anime.setRating(extractRating(item));
        anime.setEpisodeCount(item.getInt("total_episodes"));
        anime.setYear(extractYear(item.getStr("air_date")));
        anime.setSeason(extractSeason(item.getStr("air_date")));
        anime.setTags(extractTags(item));
        // 日历来源的一定是连载中，历史来源的按播出日期推断
        anime.setStatus(fromCalendar ? "ongoing" : determineStatus(item.getStr("air_date")));
        anime.setType("TV番组");

        save(anime);
        log.info("新番入库: {} (bgm_id={})", title, bgmId);
        return true;
    }

    private int updateCompletedStatus() {
        // 查出所有 ongoing 且有 air_date 的番剧，逐条判断是否已过季
        List<AnimeDO> ongoings = lambdaQuery()
                .eq(AnimeDO::getStatus, "ongoing")
                .isNotNull(AnimeDO::getAirDate)
                .list();

        int updated = 0;
        for (AnimeDO anime : ongoings) {
            if ("completed".equals(determineStatus(anime.getAirDate()))) {
                anime.setStatus("completed");
                updateById(anime);
                updated++;
            }
        }
        return updated;
    }

    private String determineStatus(String airDate) {
        if (StrUtil.isBlank(airDate) || airDate.length() < 7) return "ongoing";
        int year = Integer.parseInt(airDate.substring(0, 4));
        int month = Integer.parseInt(airDate.substring(5, 7));

        int animeSeason = month <= 3 ? 0 : month <= 6 ? 1 : month <= 9 ? 2 : 3;

        LocalDate now = LocalDate.now();
        int nowMonth = now.getMonthValue();
        int nowSeason = nowMonth <= 3 ? 0 : nowMonth <= 6 ? 1 : nowMonth <= 9 ? 2 : 3;

        if (year < now.getYear()) return "completed";
        if (year == now.getYear() && animeSeason < nowSeason) return "completed";
        return "ongoing";
    }

    private String extractImage(JSONObject item) {
        JSONObject images = item.getJSONObject("images");
        return images != null ? images.getStr("large") : null;
    }

    private Double extractRating(JSONObject item) {
        JSONObject rating = item.getJSONObject("rating");
        return rating != null ? rating.getDouble("score") : null;
    }

    private Integer extractYear(String airDate) {
        if (StrUtil.isBlank(airDate) || airDate.length() < 4) return null;
        return Integer.valueOf(airDate.substring(0, 4));
    }

    private String extractSeason(String airDate) {
        if (StrUtil.isBlank(airDate) || airDate.length() < 7) return null;
        int month = Integer.parseInt(airDate.substring(5, 7));
        int year = Integer.parseInt(airDate.substring(0, 4));
        if (month <= 3) return year + "冬";
        if (month <= 6) return year + "春";
        if (month <= 9) return year + "夏";
        return year + "秋";
    }

    private String extractTags(JSONObject item) {
        JSONArray tags = item.getJSONArray("tags");
        if (CollUtil.isEmpty(tags)) return null;
        return tags.stream()
                .map(t -> ((JSONObject) t).getStr("name"))
                .collect(Collectors.joining(","));
    }
}
```

---

## 第六步：新建定时任务

**文件** `cycani-backend/src/main/java/com/yunyun/schedule/BangumiSyncTask.java`：

```java
package com.yunyun.schedule;

import com.yunyun.service.BangumiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BangumiSyncTask {

    private final BangumiService bangumiService;

    @Scheduled(cron = "0 0 2 * * MON")
    public void syncBangumiCalendar() {
        log.info("Bangumi 定时同步开始");
        int count = bangumiService.syncCalendar();
        log.info("Bangumi 定时同步结束，新入库 {} 部", count);
    }
}
```

---

## 第七步：修改配置文件

在 `cycani-backend/src/main/resources/application.yaml` 末尾追加：

```yaml
bangumi:
  api-base: https://api.bgm.tv
```

---

## 第八步：编译验证

```bash
cd cycani-backend
JAVA_HOME="C:/Program Files/Java/jdk-17" PATH="C:/Program Files/Java/jdk-17/bin:$PATH" mvn clean compile -DskipTests
```

看到 `BUILD SUCCESS` 即通过。

---

## 第九步：手动触发测试（可选）

需要临时测试可以创建这个 Controller：

**文件** `cycani-backend/src/main/java/com/yunyun/controller/BangumiController.java`：

```java
package com.yunyun.controller;

import com.yunyun.common.Result;
import com.yunyun.service.BangumiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bangumi")
@RequiredArgsConstructor
public class BangumiController {

    private final BangumiService bangumiService;

    /** 同步当季正在播出的番剧 */
    @PostMapping("/sync")
    public Result<Integer> sync() {
        int count = bangumiService.syncCalendar();
        return Result.ok(count);
    }

    /** 批量导入历史番剧，传起始和结束年份 */
    @PostMapping("/sync-history")
    public Result<Integer> syncHistory(@RequestParam int startYear,
                                       @RequestParam int endYear) {
        int count = bangumiService.syncHistory(startYear, endYear);
        return Result.ok(count);
    }
}
```

启动后端后测试：

```bash
curl -X POST http://localhost:8080/api/bangumi/sync
```

验证数据库：

```sql
SELECT count(*) FROM anime WHERE bgm_id IS NOT NULL;
```

---

## 操作顺序总览

| 步骤 | 做什么 | 怎么验证 |
|------|--------|---------|
| 1 | MySQL 执行 `ALTER TABLE` + `CREATE INDEX` | `DESC anime;` 检查列和索引 |
| 2 | `AnimeDO.java` 追加 `bgmId` 字段 | 无语法报错 |
| 3 | 新建 `BangumiCalendarRespDTO.java` | 无语法报错 |
| 4 | 新建 `BangumiService.java` | 无语法报错 |
| 5 | 新建 `BangumiServiceImpl.java` | 无语法报错 |
| 6 | 新建 `BangumiSyncTask.java` | 无语法报错 |
| 7 | 修改 `application.yaml` | 重启生效 |
| 8 | `mvn clean compile` | BUILD SUCCESS |
| 9 | 新建 `BangumiController.java` 测试（可选） | POST 返回数据 |
