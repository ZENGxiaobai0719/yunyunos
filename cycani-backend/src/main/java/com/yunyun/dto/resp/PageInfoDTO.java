package com.yunyun.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageInfoDTO {
    private Boolean hasNextPage;
    private Integer total;
}
