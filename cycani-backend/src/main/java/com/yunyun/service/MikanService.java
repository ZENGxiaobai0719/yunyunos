package com.yunyun.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.yunyun.dao.entity.AnimeDO;

public interface MikanService extends IService<AnimeDO> {

    /**
     * 定时任务：抓取蜜柑经典RSS列表，匹配当季连载番剧
     * @return 新入库的 episode 数量
     */
    int syncFromClassicRss();

    /**
     * 按需搜索：用户访问番剧详情时，搜一次蜜柑补片源
     * @param animeId 番剧ID
     * @return 新入库的 episode 数量
     */
    int searchAndFillEpisodes(Long animeId);
}
