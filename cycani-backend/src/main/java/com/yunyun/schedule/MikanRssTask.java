package com.yunyun.schedule;

import com.yunyun.service.MikanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MikanRssTask {

    private final MikanService mikanService;

    /** 每30分钟抓一次蜜柑RSS，匹配连载番剧 */
    @Scheduled(cron = "0 */30 * * * *")
    public void syncMikanRss() {
        log.info("蜜柑RSS定时同步开始");
        int count = mikanService.syncFromClassicRss();
        if (count > 0) {
            log.info("蜜柑RSS定时同步结束，新入库 {} 集", count);
        }
    }
}
