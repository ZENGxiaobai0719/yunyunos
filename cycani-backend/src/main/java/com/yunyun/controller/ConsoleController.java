package com.yunyun.controller;

import com.yunyun.common.Result;
import com.yunyun.dto.req.ConsoleExecReqDTO;
import com.yunyun.dto.resp.ConsoleExecRespDTO;
import com.yunyun.service.console.ConsoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/console")
public class ConsoleController {

    private final ConsoleService consoleService;

    @PostMapping("/exec")
    public Result<ConsoleExecRespDTO> exec(@Valid @RequestBody ConsoleExecReqDTO req) {
        return Result.success(consoleService.execute(req.getCommand()));
    }
}
