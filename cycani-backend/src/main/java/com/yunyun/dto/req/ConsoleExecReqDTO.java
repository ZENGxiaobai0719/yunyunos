package com.yunyun.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ConsoleExecReqDTO {
    @NotBlank(message = "命令不能为空")
    private String command;
}
