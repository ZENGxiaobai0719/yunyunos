package com.yunyun.dto.resp;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EpisodeDetailRespDTO {
    private Integer number;
    private String title;
    private String url;
    private String downloadStatus;
    private Integer progress;
    private String streamUrl;
}