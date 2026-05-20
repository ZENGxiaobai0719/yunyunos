package com.yunyun.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.yunyun.dao.entity.MusicSongDO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MusicSongService extends IService<MusicSongDO> {

    List<MusicSongDO> listAll();

    MusicSongDO create(String title, String artist, String album,
                       MultipartFile musicFile, MultipartFile coverFile);

    void remove(Long id);
}
