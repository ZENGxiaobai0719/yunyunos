package com.yunyun.service;

import com.yunyun.dto.resp.EpisodeDetailRespDTO;

import java.nio.file.Path;
import java.util.List;

public interface VideoStreamService {
    String startDownload(Long animeId, Integer episodeNum);
    EpisodeDetailRespDTO getEpisodeStatus(Long animeId, Integer episodeNum);
    Path getVideoFilePath(Long animeId, Integer episodeNum);
    List<EpisodeDetailRespDTO> getEpisodeList(Long animeId);
}
