package com.yunyun.controller;

import com.yunyun.common.Result;
import com.yunyun.dto.resp.EpisodeDetailRespDTO;
import com.yunyun.service.VideoStreamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/video")
@RequiredArgsConstructor
public class VideoStreamController {

    private final VideoStreamService videoStreamService;

    @PostMapping("/{animeId}/{episodeNum}/start")
    public Result<EpisodeDetailRespDTO> startDownload(
            @PathVariable Long animeId,
            @PathVariable Integer episodeNum) {
        videoStreamService.startDownload(animeId, episodeNum);
        return Result.success(videoStreamService.getEpisodeStatus(animeId, episodeNum));
    }

    @GetMapping("/{animeId}/{episodeNum}/status")
    public Result<EpisodeDetailRespDTO> status(
            @PathVariable Long animeId,
            @PathVariable Integer episodeNum) {
        return Result.success(videoStreamService.getEpisodeStatus(animeId, episodeNum));
    }

    @GetMapping("/{animeId}/episodes")
    public Result<List<EpisodeDetailRespDTO>> episodes(@PathVariable Long animeId) {
        return Result.success(videoStreamService.getEpisodeList(animeId));
    }

    @GetMapping("/{animeId}/{episodeNum}")
    public ResponseEntity<byte[]> streamVideo(
            @PathVariable Long animeId,
            @PathVariable Integer episodeNum,
            @RequestHeader(value = "Range", required = false) String rangeHeader) throws IOException {

        Path filePath = videoStreamService.getVideoFilePath(animeId, episodeNum);
        if (filePath == null || !Files.exists(filePath)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        String contentType = Files.probeContentType(filePath);
        if (contentType == null) contentType = "video/mp4";

        long fileSize = Files.size(filePath);
        HttpHeaders headers = new HttpHeaders();

        if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
            String rangeValue = rangeHeader.substring(6);
            String[] parts = rangeValue.split("-");
            long start = Long.parseLong(parts[0]);
            long end = parts.length > 1 && !parts[1].isEmpty()
                    ? Long.parseLong(parts[1])
                    : fileSize - 1;

            if (start >= fileSize) {
                return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                        .header("Content-Range", "bytes */" + fileSize)
                        .build();
            }

            long contentLength = Math.min(end - start + 1, fileSize - start);
            byte[] data = new byte[(int) contentLength];

            try (RandomAccessFile raf = new RandomAccessFile(filePath.toFile(), "r")) {
                raf.seek(start);
                raf.readFully(data);
            }

            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentLength(contentLength);
            headers.set("Content-Range", "bytes " + start + "-" + (start + contentLength - 1) + "/" + fileSize);
            headers.set("Accept-Ranges", "bytes");
            headers.setCacheControl(CacheControl.noCache());

            return new ResponseEntity<>(data, headers, HttpStatus.PARTIAL_CONTENT);
        } else {
            byte[] data = Files.readAllBytes(filePath);
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentLength(fileSize);
            headers.set("Accept-Ranges", "bytes");
            headers.setCacheControl(CacheControl.noCache());
            return new ResponseEntity<>(data, headers, HttpStatus.OK);
        }
    }
}
