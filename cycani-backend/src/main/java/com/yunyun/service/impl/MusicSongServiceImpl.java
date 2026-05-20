package com.yunyun.service.impl;

import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.yunyun.common.BusinessException;
import com.yunyun.dao.entity.MusicSongDO;
import com.yunyun.dao.mapper.MusicSongMapper;
import com.yunyun.service.MusicSongService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class MusicSongServiceImpl extends ServiceImpl<MusicSongMapper, MusicSongDO> implements MusicSongService {

    @Value("${music.storage-path:./data/music}")
    private String storagePath;

    @Override
    public List<MusicSongDO> listAll() {
        return lambdaQuery().orderByAsc(MusicSongDO::getSortOrder).list();
    }

    @Override
    public MusicSongDO create(String title, String artist, String album,
                              MultipartFile musicFile, MultipartFile coverFile) {
        if (StringUtils.isBlank(title)) throw new BusinessException("歌曲名不能为空");
        if (StringUtils.isBlank(artist)) throw new BusinessException("歌手不能为空");
        if (musicFile == null || musicFile.isEmpty()) throw new BusinessException("音乐文件不能为空");

        try {
            Path musicDir = Paths.get(storagePath, "music");
            Path coverDir = Paths.get(storagePath, "cover");
            Files.createDirectories(musicDir);
            Files.createDirectories(coverDir);

            // Save music file
            String musicExt = getExt(musicFile.getOriginalFilename());
            String musicFileName = UUID.randomUUID() + musicExt;
            musicFile.transferTo(musicDir.resolve(musicFileName).toFile());

            // Save cover file (optional)
            String coverFileName = null;
            if (coverFile != null && !coverFile.isEmpty()) {
                String coverExt = getExt(coverFile.getOriginalFilename());
                coverFileName = UUID.randomUUID() + coverExt;
                coverFile.transferTo(coverDir.resolve(coverFileName).toFile());
            }

            MusicSongDO song = new MusicSongDO();
            song.setTitle(title);
            song.setArtist(artist);
            song.setAlbum(album);
            song.setMusicFile(musicFileName);
            song.setCoverFile(coverFileName);
            song.setDuration(0);
            song.setSortOrder((int) (System.currentTimeMillis() / 1000));
            song.setIsDefault(0);
            song.setDefaultBg(1);
            save(song);

            log.info("Music song created: {} - {} (file: {})", artist, title, musicFileName);
            return song;

        } catch (IOException e) {
            log.error("Failed to save music file", e);
            throw new BusinessException("文件存储失败: " + e.getMessage());
        }
    }

    @Override
    public void remove(Long id) {
        MusicSongDO song = getById(id);
        if (song == null) throw new BusinessException("歌曲不存在");

        try {
            if (StringUtils.isNotBlank(song.getMusicFile())) {
                Files.deleteIfExists(Paths.get(storagePath, "music", song.getMusicFile()));
            }
            if (StringUtils.isNotBlank(song.getCoverFile())) {
                Files.deleteIfExists(Paths.get(storagePath, "cover", song.getCoverFile()));
            }
        } catch (IOException e) {
            log.warn("Failed to delete music files", e);
        }

        removeById(id);
        log.info("Music song deleted: id={}", id);
    }

    private String getExt(String filename) {
        if (filename == null) return ".mp3";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : ".mp3";
    }
}
