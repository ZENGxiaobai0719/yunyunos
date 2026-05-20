package com.yunyun.service.console.commands;

import com.yunyun.dto.resp.ConsoleExecRespDTO;
import com.yunyun.dto.resp.ConsoleExecRespDTO.ConsoleLineDTO;
import com.yunyun.service.console.ConsoleCommand;
import org.springframework.stereotype.Component;

@Component
public class CloseCommand implements ConsoleCommand {

    @Override
    public String name() { return "close"; }

    @Override
    public ConsoleExecRespDTO execute(String[] args) {
        ConsoleExecRespDTO result = new ConsoleExecRespDTO();
        if (args.length == 0) {
            result.getLines().add(ConsoleLineDTO.of("用法: close <module>", "error"));
            return result;
        }
        String target = args[0].toLowerCase();
        result.getLines().add(ConsoleLineDTO.of("正在关闭 " + target + "...", "success"));
        result.getSideEffects().add("close:" + target);
        return result;
    }
}
