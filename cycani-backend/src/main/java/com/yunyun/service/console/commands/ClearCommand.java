package com.yunyun.service.console.commands;

import com.yunyun.dto.resp.ConsoleExecRespDTO;
import com.yunyun.service.console.ConsoleCommand;
import org.springframework.stereotype.Component;

@Component
public class ClearCommand implements ConsoleCommand {

    @Override
    public String name() { return "clear"; }

    @Override
    public ConsoleExecRespDTO execute(String[] args) {
        ConsoleExecRespDTO result = new ConsoleExecRespDTO();
        result.getSideEffects().add("clear");
        return result;
    }
}
