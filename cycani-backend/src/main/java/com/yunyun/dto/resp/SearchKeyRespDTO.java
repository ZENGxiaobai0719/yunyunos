package com.yunyun.dto.resp;

import lombok.Data;

@Data
public class SearchKeyRespDTO {
    private Long id;
    private String title;
    private String type;
    private String coverUrl;
}