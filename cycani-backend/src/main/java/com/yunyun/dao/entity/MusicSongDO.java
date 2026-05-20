package com.yunyun.dao.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("music_song")
public class MusicSongDO {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String artist;
    private String album;
    private String musicFile;
    private String coverFile;
    private Integer duration;
    private String lyrics;
    private Integer sortOrder;
    private Integer isDefault;
    private Integer defaultBg;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
