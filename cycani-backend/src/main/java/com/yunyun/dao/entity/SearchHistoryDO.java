package com.yunyun.dao.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 搜索历史表
 */
@Data
@TableName("search_history")
public class SearchHistoryDO {

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 搜索关键词
     */
    private String query;

    /**
     * 搜索时间
     */
    private LocalDateTime createdAt;
}