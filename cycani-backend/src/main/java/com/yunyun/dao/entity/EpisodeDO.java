package com.yunyun.dao.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * 分集表
 */
@Data
@TableName("episode")
public class EpisodeDO {

    /**
     * 主键ID
     */
    @TableId
    private Long id;

    /**
     * 所属番剧ID
     */
    @TableField("anime_id")
    private Long animeId;

    /**
     * 第几话
     */
    private Integer number;

    /**
     * 话标题
     */
    private String title;

    /**
     * 播放地址
     */
    private String url;
}