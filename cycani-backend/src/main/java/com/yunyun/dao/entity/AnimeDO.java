package com.yunyun.dao.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("anime")
public class AnimeDO {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** AniList ID */
    private Integer aniId;
    /** MyAnimeList ID */
    private Integer malId;

    // 多语言标题
    private String titleRomaji;
    private String titleNative;
    private String titleEnglish;
    private String titleChinese;

    // 核心
    private String format;
    private String status;
    private String season;
    private Integer seasonYear;

    // 日期
    private Integer startDateYear;
    private Integer startDateMonth;
    private Integer startDateDay;
    private Integer endDateYear;
    private Integer endDateMonth;
    private Integer endDateDay;

    // 数值
    private Integer episodes;
    private Integer duration;
    private Integer popularity;
    private Integer averageScore;

    // 文本
    private String source;
    private String countryOfOrigin;
    private String hashtag;
    private String siteUrl;
    private String description;
    private String bannerImage;

    // 封面
    private String coverImageUrl;
    private String coverImageColor;

    // 预告片
    private String trailerId;
    private String trailerSite;
    private String trailerThumbnail;

    // 标记
    private Integer isAdult;

    // JSON 字段 (存储为 String, 用 Hutool JSONUtil 读写)
    private String genres;
    private String synonyms;
    private String studios;
    private String externalLinks;
    private String rankings;
    private String relations;
    private String airingSchedule;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
