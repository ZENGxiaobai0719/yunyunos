package com.yunyun.service.console.commands;

import com.yunyun.dto.resp.ConsoleExecRespDTO;
import com.yunyun.dto.resp.ConsoleExecRespDTO.ConsoleLineDTO;
import com.yunyun.service.console.ConsoleCommand;
import org.springframework.stereotype.Component;

@Component
public class RebootCommand implements ConsoleCommand {

    @Override
    public String name() { return "reboot"; }

    @Override
    public ConsoleExecRespDTO execute(String[] args) {
        ConsoleExecRespDTO result = new ConsoleExecRespDTO();
        result.getLines().add(ConsoleLineDTO.of("正在重启...", "muted"));
        result.getSideEffects().add("reboot");
        return result;
    }
}
