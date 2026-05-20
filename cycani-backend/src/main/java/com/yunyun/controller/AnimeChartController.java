package com.yunyun.controller;

import com.yunyun.common.Result;
import com.yunyun.dto.resp.AiringScheduleRespDTO;
import com.yunyun.dto.resp.AniMediaRespDTO;
import com.yunyun.dto.resp.SeasonStatDTO;
import com.yunyun.dto.resp.SeasonalChartRespDTO;
import com.yunyun.service.AnimeChartService;
import com.yunyun.service.MikanService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/anime")
@RequiredArgsConstructor
public class AnimeChartController {

    private final AnimeChartService service;
    private final MikanService mikanService;

    /** 季节榜单 */
    @GetMapping("/seasonal")
    public Result<SeasonalChartRespDTO> seasonal(
            @RequestParam(defaultValue = "SPRING") String season,
            @RequestParam int year,
            @RequestParam(required = false) String format,
            @RequestParam(defaultValue = "1") int page) {
        return Result.success(service.getSeasonal(season, year, format, page));
    }

    /** 播出日程 */
    @GetMapping("/airing")
    public Result<AiringScheduleRespDTO> airing(
            @RequestParam long start,
            @RequestParam long end,
            @RequestParam(defaultValue = "1") int page) {
        return Result.success(service.getAiring(start, end, page));
    }

    /** 往季归档 */
    @GetMapping("/archive")
    public Result<SeasonalChartRespDTO> archive(
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "1") int page) {
        return Result.success(service.getArchive(year, page));
    }

    /** 未定档 */
    @GetMapping("/tba")
    public Result<SeasonalChartRespDTO> tba(
            @RequestParam(defaultValue = "1") int page) {
        return Result.success(service.getTba(page));
    }

    /** 番剧详情 */
    @GetMapping("/{id}")
    public Result<AniMediaRespDTO> detail(@PathVariable Long id) {
        AniMediaRespDTO dto = service.getDetail(id);
        if (dto == null) {
            return Result.error(404, "番剧不存在");
        }
        return Result.success(dto);
    }

    /** 归档统计 */
    @GetMapping("/archive/stats")
    public Result<Map<Integer, Map<String, SeasonStatDTO>>> archiveStats() {
        return Result.success(service.getArchiveStats());
    }

    /** 按需填充剧集 (蜜柑搜索), id 为 AniList ID */
    @PostMapping("/{id}/fill-episodes")
    public Result<Integer> fillEpisodes(@PathVariable Long id) {
        Long internalId = service.resolveInternalId(id);
        if (internalId == null) return Result.error(404, "番剧不存在");
        return Result.success(mikanService.searchAndFillEpisodes(internalId));
    }

    /** 全量历史同步 (管理接口) */
    @PostMapping("/sync")
    public Result<Integer> sync(
            @RequestParam(defaultValue = "2000") int from,
            @RequestParam(defaultValue = "2026") int to) {
        return Result.success(service.syncAllSeasons(from, to));
    }

    /** 单季同步 (管理接口) */
    @PostMapping("/sync/season")
    public Result<Integer> syncSeason(
            @RequestParam String season,
            @RequestParam int year) {
        return Result.success(service.syncSeason(season, year));
    }
}
