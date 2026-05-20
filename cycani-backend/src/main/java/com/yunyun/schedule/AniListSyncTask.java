package com.yunyun.schedule;

import com.yunyun.service.AnimeChartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class AniListSyncTask {

    private final AnimeChartService chartService;

    /** 每周一凌晨 2 点同步当前季 */
    @Scheduled(cron = "0 0 2 * * MON")
    public void syncCurrentSeason() {
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        String season = seasonToAniList(now.getMonthValue());
        log.info("定时同步: {} {}", year, season);
        chartService.syncSeason(season, year);
    }

    private String seasonToAniList(int month) {
        if (month <= 3) return "WINTER";
        if (month <= 6) return "SPRING";
        if (month <= 9) return "SUMMER";
        return "FALL";
    }
}
