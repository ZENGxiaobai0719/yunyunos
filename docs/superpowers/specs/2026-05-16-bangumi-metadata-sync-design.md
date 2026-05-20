# Bangumi 番剧元数据自动同步 — 设计文档

> 版本：v1.0 | 日期：2026-05-16

## 目标

通过 Bangumi API 自动拉取当季番剧元数据，存入 `anime` 表，实现番剧信息的自动化填充。

## 技术选型

- **API 源**：Bangumi Open API (`https://api.bgm.tv/calendar`)，无需认证
- **HTTP 客户端**：Hutool `HttpUtil`（已有依赖）
- **JSON 解析**：Hutool `JSONUtil`（已有依赖）
- **调度**：Spring `@Scheduled`，遵循现有 `RankingSnapshotTask` 模式
- **去重**：`anime` 表新增 `bgm_id` 字段，用 Bangumi 自增 ID 判重

## 数据库变更

```sql
ALTER TABLE anime ADD COLUMN bgm_id BIGINT DEFAULT NULL COMMENT 'Bangumi ID';
ALTER TABLE anime ADD INDEX idx_bgm_id (bgm_id);
```

## 新建文件清单（6 个）

| # | 文件 | 作用 |
|---|------|------|
| 1 | `dto/resp/BangumiCalendarRespDTO.java` | 日历 API 响应 DTO |
| 2 | `service/BangumiService.java` | 接口 |
| 3 | `service/impl/BangumiServiceImpl.java` | API 调用 + 入库逻辑 |
| 4 | `schedule/BangumiSyncTask.java` | 定时任务 |
| 5 | `config/BangumiConfig.java` | 配置类（base-url） |
| - | `application.yaml` | 追加 bangumi 配置 |

## API 响应结构

GET `https://api.bgm.tv/calendar` → JSON 数组，每元素包含 `weekday` + `items[]`，每个 item 含 `id`, `name`, `name_cn`, `summary`, `images.large`, `rating.score`, `total_episodes`, `air_date`, `tags`。

## 字段映射

| Bangumi 字段 | anime 字段 | 备注 |
|-------------|-----------|------|
| id | bgm_id | 去重依据 |
| name_cn ?? name | title | 优先中文 |
| name | alt_title | 日文原名 |
| summary | description | |
| images.large | cover_url | |
| rating.score | rating | |
| total_episodes | episode_count | |
| air_date → 年份 | year | |
| air_date → 季度 | season | |
| tags[].name 拼接 | tags | 逗号分隔 |

## 去重逻辑

1. 检查 `bgm_id` 是否已存在 → 存在则跳过
2. 不存在 → INSERT 新记录
3. 不更新已有记录（避免覆盖人工修改）

## 定时策略

每周一凌晨 2:00 执行，避免与 Bangumi 高峰期冲突：

```java
@Scheduled(cron = "0 0 2 * * MON")
```

后期可调为每日一次（`0 0 2 * * *`），对 Bangumi 服务器温和。

## 错误处理

- API 超时/网络异常 → 日志记录，跳过本次执行，下周期重试
- 单条入库失败 → 跳过该条继续，不影响其他数据
- Bangumi 返回空 → 正常结束，不报错
