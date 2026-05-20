package com.yunyun.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResult <T>{
    /**
     * 当前页数据
     */
    private List<T> list;

    /**
     * 总数
     */
    private long total;

    /**
     * 当前页码
     */
    private int page;

    /**
     * 每页数量
     */
    private int pageSize;
}
