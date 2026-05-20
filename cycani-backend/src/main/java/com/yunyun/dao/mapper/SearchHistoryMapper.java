package com.yunyun.dao.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yunyun.dao.entity.SearchHistoryDO;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

public interface SearchHistoryMapper extends BaseMapper<SearchHistoryDO> {

    /** 热门关键词：按搜索频次聚合，取 Top N */
    @Select("SELECT query, COUNT(*) AS cnt FROM search_history " +
            "GROUP BY query ORDER BY cnt DESC LIMIT #{limit}")
    List<Map<String, Object>> selectHotKeywords(int limit);
}