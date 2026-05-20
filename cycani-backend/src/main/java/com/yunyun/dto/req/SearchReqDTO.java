package com.yunyun.dto.req;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SearchReqDTO {
    @NotBlank(message = "关键词不能为空")
    private String q;

    @Min(1)
    private Integer page = 1;

    @Min(1)
    private Integer pageSize = 20;
}