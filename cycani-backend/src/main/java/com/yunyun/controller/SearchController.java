package com.yunyun.controller;

import com.yunyun.common.PageResult;
import com.yunyun.common.Result;
import com.yunyun.dto.req.SearchReqDTO;
import com.yunyun.dto.resp.SearchKeyRespDTO;
import com.yunyun.service.SearchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    /** 搜索（分页） */
    @GetMapping
    public Result<PageResult<SearchKeyRespDTO>> search(@Valid SearchReqDTO params) {
        return Result.success(searchService.search(params));
    }

    /** 热门搜索词 Top10 */
    @GetMapping("/hot")
    public Result<List<String>> hot() {
        return Result.success(searchService.hotKeywords());
    }

    /** 清空搜索历史 */
    @DeleteMapping("/history")
    public Result<Void> clearHistory() {
        searchService.clearHistory();
        return Result.success();
    }
}