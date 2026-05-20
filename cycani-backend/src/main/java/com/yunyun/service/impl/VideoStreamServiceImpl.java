package com.yunyun.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.yunyun.config.Aria2Config;
import com.yunyun.dao.entity.EpisodeDO;
import com.yunyun.dao.mapper.EpisodeMapper;
import com.yunyun.dto.resp.EpisodeDetailRespDTO;
import com.yunyun.service.Aria2cService;
import com.yunyun.service.VideoStreamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class VideoStreamServiceImpl implements VideoStreamService {

    private final Aria2cService aria2cService;
    private final Aria2Config config;
    private final EpisodeMapper episodeMapper;

    private final ConcurrentHashMap<String, DownloadTask> tasks = new ConcurrentHashMap<>();

    private static class DownloadTask {
        String gid;
        String status;   // NOT_STARTED, DOWNLOADING, COMPLETED, FAILED
        int progress;
        String filePath;
        long startedAt;

        DownloadTask(String gid, String status, int progress, String filePath) {
            this.gid = gid;
            this.status = status;
            this.progress = progress;
            this.filePath = filePath;
            this.startedAt = System.currentTimeMillis();
        }
    }

    private String key(Long animeId, Integer episodeNum) {
        return animeId + "-" + episodeNum;
    }

    @Override
    public String startDownload(Long animeId, Integer episodeNum) {
        String k = key(animeId, episodeNum);

        return tasks.compute(k, (key, existing) -> {
            if (existing != null) {
                if ("COMPLETED".equals(existing.status) && existing.filePath != null) {
                    if (Files.exists(Paths.get(existing.filePath))) {
                        return existing;
                    }
                }
                if ("DOWNLOADING".equals(existing.status)) {
                    return existing;
                }
            }

            EpisodeDO ep = episodeMapper.selectOne(new LambdaQueryWrapper<EpisodeDO>()
                    .eq(EpisodeDO::getAnimeId, animeId)
                    .eq(EpisodeDO::getNumber, episodeNum));
            if (ep == null || StrUtil.isBlank(ep.getUrl())) {
                return new DownloadTask(null, "FAILED", 0, null);
            }

            String outputDir = Paths.get(config.getDownloadDir(), String.valueOf(animeId),
                    String.valueOf(episodeNum)).toString();
            try {
                Files.createDirectories(Paths.get(outputDir));
            } catch (IOException e) {
                log.error("Failed to create download dir: {}", outputDir, e);
                return new DownloadTask(null, "FAILED", 0, null);
            }

            String gid = aria2cService.addDownload(ep.getUrl(), outputDir);
            if (gid == null) {
                log.warn("aria2c addDownload returned null for episode {}-{}", animeId, episodeNum);
                return new DownloadTask(null, "FAILED", 0, null);
            }
            log.info("Started download: anime={} ep={} gid={} url={}", animeId, episodeNum, gid, ep.getUrl());
            return new DownloadTask(gid, "DOWNLOADING", 0, null);
        }).gid;
    }

    @Override
    public EpisodeDetailRespDTO getEpisodeStatus(Long animeId, Integer episodeNum) {
        EpisodeDO ep = episodeMapper.selectOne(new LambdaQueryWrapper<EpisodeDO>()
                .eq(EpisodeDO::getAnimeId, animeId)
                .eq(EpisodeDO::getNumber, episodeNum));

        EpisodeDetailRespDTO dto = new EpisodeDetailRespDTO();
        if (ep != null) {
            dto.setNumber(ep.getNumber());
            dto.setTitle(ep.getTitle());
            dto.setUrl(ep.getUrl());
        } else {
            dto.setNumber(episodeNum);
            dto.setDownloadStatus("NOT_STARTED");
            return dto;
        }

        DownloadTask task = tasks.get(key(animeId, episodeNum));
        if (task == null) {
            dto.setDownloadStatus("NOT_STARTED");
            dto.setProgress(0);
        } else {
            dto.setDownloadStatus(mapStatus(task.status));
            dto.setProgress(task.progress);
            if (task.filePath != null) {
                dto.setStreamUrl("/api/video/" + animeId + "/" + episodeNum);
            }
        }
        return dto;
    }

    @Override
    public Path getVideoFilePath(Long animeId, Integer episodeNum) {
        DownloadTask task = tasks.get(key(animeId, episodeNum));
        if (task == null || task.filePath == null) return null;
        Path p = Paths.get(task.filePath);
        return Files.exists(p) ? p : null;
    }

    @Override
    public List<EpisodeDetailRespDTO> getEpisodeList(Long animeId) {
        List<EpisodeDO> episodes = episodeMapper.selectList(
                new LambdaQueryWrapper<EpisodeDO>()
                        .eq(EpisodeDO::getAnimeId, animeId)
                        .orderByAsc(EpisodeDO::getNumber));

        List<EpisodeDetailRespDTO> result = new ArrayList<>();
        for (EpisodeDO ep : episodes) {
            EpisodeDetailRespDTO dto = new EpisodeDetailRespDTO();
            dto.setNumber(ep.getNumber());
            dto.setTitle(ep.getTitle());
            dto.setUrl(ep.getUrl());

            DownloadTask task = tasks.get(key(animeId, ep.getNumber()));
            if (task == null) {
                dto.setDownloadStatus("NOT_STARTED");
                dto.setProgress(0);
            } else {
                dto.setDownloadStatus(mapStatus(task.status));
                dto.setProgress(task.progress);
                if (task.filePath != null) {
                    dto.setStreamUrl("/api/video/" + animeId + "/" + ep.getNumber());
                }
            }
            result.add(dto);
        }
        return result;
    }

    @Scheduled(fixedDelayString = "${aria2.poll-interval-ms:2000}")
    public void pollDownloads() {
        for (var entry : tasks.entrySet()) {
            DownloadTask task = entry.getValue();
            if (!"DOWNLOADING".equals(task.status) || task.gid == null) continue;

            try {
                Aria2cService.Aria2Status s = aria2cService.getStatus(task.gid);
                if (s == null) continue;

                task.progress = s.progressPercent();
                switch (s.status()) {
                    case "complete" -> {
                        task.status = "COMPLETED";
                        task.progress = 100;
                        task.filePath = s.filePath();
                        log.info("Download complete: {} → {}", entry.getKey(), s.filePath());
                    }
                    case "error", "removed" -> {
                        task.status = "FAILED";
                        log.warn("Download failed: {} (aria2 status: {})", entry.getKey(), s.status());
                    }
                    case "active", "waiting", "paused" -> task.status = "DOWNLOADING";
                }
            } catch (Exception e) {
                log.debug("Poll error for {}: {}", entry.getKey(), e.getMessage());
            }
        }
    }

    private String mapStatus(String aria2Status) {
        return switch (aria2Status) {
            case "COMPLETED" -> "COMPLETED";
            case "DOWNLOADING", "active", "waiting", "paused" -> "DOWNLOADING";
            case "FAILED", "error", "removed" -> "FAILED";
            default -> "NOT_STARTED";
        };
    }
}
