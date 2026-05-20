package com.yunyun.controller;

import com.yunyun.common.Result;
import com.yunyun.dao.entity.MusicSongDO;
import com.yunyun.service.MusicSongService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/music")
@RequiredArgsConstructor
public class MusicController {

    private final MusicSongService musicSongService;

    @Value("${music.storage-path:./data/music}")
    private String storagePath;

    @GetMapping("/songs")
    public Result<List<MusicSongDO>> listSongs() {
        return Result.success(musicSongService.listAll());
    }

    /**
     * Player-compatible data format (replaces static data.json).
     * Returns the same shape the music player HTML/JS expects.
     */
    @GetMapping("/player-data")
    public List<PlayerSong> playerData() {
        return musicSongService.listAll().stream().map(s -> {
            PlayerSong ps = new PlayerSong();
            ps.title = new LangText(s.getTitle(), s.getTitle());
            ps.artist = new LangText(s.getArtist(), s.getArtist());
            ps.musicFile = "music/" + s.getMusicFile();
            ps.coverImage = s.getCoverFile() != null ? "cover/" + s.getCoverFile() : "cover/Remember.png";
            ps.isDefault = s.getIsDefault() != null && s.getIsDefault() == 1;
            ps.defaultBg = s.getDefaultBg() != null ? s.getDefaultBg() : 1;
            ps.mv = "";
            ps.subtitle = new LangText("", "");
            return ps;
        }).toList();
    }

    // Player-compatible DTOs
    public static class PlayerSong {
        public LangText title;
        public LangText artist;
        public String musicFile;
        public String coverImage;
        @com.fasterxml.jackson.annotation.JsonProperty("default")
        public boolean isDefault;
        @com.fasterxml.jackson.annotation.JsonProperty("default_bg")
        public int defaultBg;
        public String mv;
        public LangText subtitle;
    }

    public static class LangText {
        public String ja;
        public String ko;
        public LangText(String ja, String ko) { this.ja = ja; this.ko = ko; }
    }

    @PostMapping("/songs")
    public Result<MusicSongDO> createSong(
            @RequestParam("title") String title,
            @RequestParam("artist") String artist,
            @RequestParam(value = "album", required = false) String album,
            @RequestParam("musicFile") MultipartFile musicFile,
            @RequestParam(value = "coverFile", required = false) MultipartFile coverFile) {
        return Result.success(musicSongService.create(title, artist, album, musicFile, coverFile));
    }

    @DeleteMapping("/songs/{id}")
    public Result<Void> deleteSong(@PathVariable Long id) {
        musicSongService.remove(id);
        return Result.success();
    }

    @GetMapping("/stream/{fileName}")
    public void streamMusic(@PathVariable String fileName,
                            HttpServletRequest request,
                            HttpServletResponse response) {
        Path filePath = Paths.get(storagePath, "music", fileName).normalize();
        if (!Files.exists(filePath)) {
            response.setStatus(404);
            return;
        }

        try {
            long fileSize = Files.size(filePath);
            String rangeHeader = request.getHeader("Range");

            if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
                // Parse range: "bytes=0-1023"
                String rangeValue = rangeHeader.substring(6);
                String[] parts = rangeValue.split("-");
                long start = Long.parseLong(parts[0]);
                long end = parts.length > 1 && !parts[1].isEmpty()
                        ? Long.parseLong(parts[1])
                        : fileSize - 1;
                if (end >= fileSize) end = fileSize - 1;

                long contentLength = end - start + 1;
                response.setStatus(206);
                response.setHeader("Content-Range", "bytes " + start + "-" + end + "/" + fileSize);
                response.setHeader("Accept-Ranges", "bytes");
                response.setContentLengthLong(contentLength);
                response.setContentType("audio/mpeg");

                try (RandomAccessFile raf = new RandomAccessFile(filePath.toFile(), "r")) {
                    raf.seek(start);
                    byte[] buffer = new byte[8192];
                    long remaining = contentLength;
                    OutputStream out = response.getOutputStream();
                    while (remaining > 0) {
                        int read = raf.read(buffer, 0, (int) Math.min(buffer.length, remaining));
                        if (read == -1) break;
                        out.write(buffer, 0, read);
                        remaining -= read;
                    }
                    out.flush();
                }
            } else {
                response.setContentType("audio/mpeg");
                response.setContentLengthLong(fileSize);
                response.setHeader("Accept-Ranges", "bytes");
                Files.copy(filePath, response.getOutputStream());
                response.getOutputStream().flush();
            }
        } catch (IOException e) {
            log.error("Stream music error: {}", fileName, e);
            response.setStatus(500);
        }
    }

    @GetMapping("/cover/{fileName}")
    public void serveCover(@PathVariable String fileName, HttpServletResponse response) {
        Path filePath = Paths.get(storagePath, "cover", fileName).normalize();
        if (!Files.exists(filePath)) {
            response.setStatus(404);
            return;
        }
        try {
            String contentType = Files.probeContentType(filePath);
            response.setContentType(contentType != null ? contentType : "image/jpeg");
            response.setHeader("Cache-Control", "public, max-age=86400");
            Files.copy(filePath, response.getOutputStream());
            response.getOutputStream().flush();
        } catch (IOException e) {
            log.error("Serve cover error: {}", fileName, e);
            response.setStatus(500);
        }
    }
}
