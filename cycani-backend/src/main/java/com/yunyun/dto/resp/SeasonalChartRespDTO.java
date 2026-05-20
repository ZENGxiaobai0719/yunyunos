package com.yunyun.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class SeasonalChartRespDTO {
    private PageInfoDTO pageInfo;
    private List<AniMediaRespDTO> media;
}
