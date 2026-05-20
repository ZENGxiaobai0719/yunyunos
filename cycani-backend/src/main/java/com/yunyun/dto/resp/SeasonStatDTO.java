package com.yunyun.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeasonStatDTO {
    private int count;
    private String coverImage;
    private String title;
}
