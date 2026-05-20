package com.yunyun.service.impl;


import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.yunyun.common.PageResult;
import com.yunyun.dao.entity.AnimeDO;
import com.yunyun.dao.entity.SearchHistoryDO;
import com.yunyun.dao.mapper.AnimeMapper;
import com.yunyun.dao.mapper.SearchHistoryMapper;
import com.yunyun.dto.req.SearchReqDTO;
import com.yunyun.dto.resp.SearchKeyRespDTO;
import com.yunyun.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl extends ServiceImpl<SearchHistoryMapper, SearchHistoryDO> implements SearchService {

    private final AnimeMapper animeMapper;
    private final SearchHistoryMapper searchHistoryMapper;
    private final CacheManager cacheManager;

    @Override
    public PageResult<SearchKeyRespDTO> search(SearchReqDTO params) {
        // 1. 分页模糊搜索 (多标题字段)
        Page<AnimeDO> page = Page.of(params.getPage(), params.getPageSize());
        LambdaQueryWrapper<AnimeDO> wrapper = new LambdaQueryWrapper<>();
        String q = params.getQ();
        wrapper.and(w -> w
            .like(AnimeDO::getTitleChinese, q).or()
            .like(AnimeDO::getTitleRomaji, q).or()
            .like(AnimeDO::getTitleNative, q).or()
            .like(AnimeDO::getTitleEnglish, q));
        Page<AnimeDO> result = animeMapper.selectPage(page, wrapper);

        // 2. DO → DTO
        List<SearchKeyRespDTO> list = result.getRecords().stream()
                .map(a -> {
                    SearchKeyRespDTO dto = new SearchKeyRespDTO();
                    dto.setId(a.getId());
                    dto.setTitle(StrUtil.isNotBlank(a.getTitleChinese()) ? a.getTitleChinese()
                            : StrUtil.isNotBlank(a.getTitleRomaji()) ? a.getTitleRomaji()
                            : a.getTitleNative());
                    dto.setType(a.getFormat());
                    dto.setCoverUrl(a.getCoverImageUrl());
                    return dto;
                })
                .toList();

        // 3. 异步记录搜索历史，同时清除热词缓存
        saveSearchHistory(params.getQ());
        var hotCache = cacheManager.getCache("hot_keywords");
        if (hotCache != null) hotCache.clear();

        return new PageResult<>(list, result.getTotal(), params.getPage(), params.getPageSize());
    }

    @Override
    @Cacheable(value = "hot_keywords", unless = "#result == null || #result.isEmpty()")
    public List<String> hotKeywords() {
        // SQL GROUP BY 聚合，数据库侧完成排序
        List<Map<String, Object>> rows = searchHistoryMapper.selectHotKeywords(10);
        return rows.stream()
                .map(row -> (String) row.get("query"))
                .toList();
    }

    @Override
    @CacheEvict(value = "hot_keywords", allEntries = true)
    public void clearHistory() {
        searchHistoryMapper.delete(null);
    }

    @Override
    @Async
    public void saveSearchHistory(String q) {
        SearchHistoryDO history = new SearchHistoryDO();
        history.setQuery(q);
        history.setCreatedAt(LocalDateTime.now());
        searchHistoryMapper.insert(history);
    }
}