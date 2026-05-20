package com.yunyun.config;

import com.yunyun.service.Aria2cService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class Aria2StartupListener {
    private final Aria2cService aria2cService;

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        try {
            aria2cService.ensureDaemonRunning();
        } catch (Exception e) {
            log.warn("aria2c daemon not available: {}", e.getMessage());
        }
    }
}
