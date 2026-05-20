package com.yunyun.service.console.commands;

import com.yunyun.dto.resp.ConsoleExecRespDTO;
import com.yunyun.dto.resp.ConsoleExecRespDTO.ConsoleLineDTO;
import com.yunyun.service.console.ConsoleCommand;
import org.springframework.stereotype.Component;

@Component
public class ExitCommand implements ConsoleCommand {

    @Override
    public String name() { return "exit"; }

    @Override
    public ConsoleExecRespDTO execute(String[] args) {
        ConsoleExecRespDTO result = new ConsoleExecRespDTO();
        result.getLines().add(ConsoleLineDTO.of("最小化控制台窗口...", "muted"));
        result.getSideEffects().add("minimize:console");
        return result;
    }
}
