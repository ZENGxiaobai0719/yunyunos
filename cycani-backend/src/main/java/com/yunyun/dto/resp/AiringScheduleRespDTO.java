package com.yunyun.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class AiringScheduleRespDTO {
    private PageInfoDTO pageInfo;
    private List<AiringScheduleItem> airingSchedules;

    @Data
    @AllArgsConstructor
    public static class AiringScheduleItem {
        private Integer id;
        private Integer episode;
        private Long airingAt;
        private AniMediaRespDTO media;
    }
}
