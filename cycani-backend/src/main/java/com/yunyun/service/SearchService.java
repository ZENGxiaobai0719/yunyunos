package com.yunyun.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.yunyun.common.PageResult;
import com.yunyun.dao.entity.SearchHistoryDO;
import com.yunyun.dto.req.SearchReqDTO;
import com.yunyun.dto.resp.SearchKeyRespDTO;

import java.util.List;

public interface SearchService extends IService<SearchHistoryDO> {

    /** 模糊搜索番剧标题（分页） */
    PageResult<SearchKeyRespDTO> search(SearchReqDTO params);

    /** 热门搜索词 Top10 */
    List<String> hotKeywords();

    /** 清空搜索历史 */
    void clearHistory();

    /** 异步保存搜索记录 */
    void saveSearchHistory(String q);
}