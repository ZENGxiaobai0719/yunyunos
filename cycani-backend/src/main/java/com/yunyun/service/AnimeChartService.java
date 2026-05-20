package com.yunyun.service;

import com.yunyun.dto.resp.*;

import java.util.Map;

public interface AnimeChartService {

    SeasonalChartRespDTO getSeasonal(String season, int year, String format, int page);

    AiringScheduleRespDTO getAiring(long start, long end, int page);

    SeasonalChartRespDTO getArchive(Integer year, int page);

    SeasonalChartRespDTO getTba(int page);

    AniMediaRespDTO getDetail(Long id);

    /** AniList ID → 内部 DB 主键 */
    Long resolveInternalId(Long aniId);

    /** 归档统计: year → season → {count, coverImage, title} */
    Map<Integer, Map<String, SeasonStatDTO>> getArchiveStats();

    /** 全量历史同步 */
    int syncAllSeasons(int fromYear, int toYear);

    /** 同步单个季节 */
    int syncSeason(String season, int year);
}
