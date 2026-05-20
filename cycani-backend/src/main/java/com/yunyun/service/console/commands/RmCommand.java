package com.yunyun.service.console.commands;

import com.yunyun.dto.resp.ConsoleExecRespDTO;
import com.yunyun.dto.resp.ConsoleExecRespDTO.ConsoleLineDTO;
import com.yunyun.service.console.ConsoleCommand;
import org.springframework.stereotype.Component;

@Component
public class RmCommand implements ConsoleCommand {

    @Override
    public String name() { return "rm"; }

    @Override
    public ConsoleExecRespDTO execute(String[] args) {
        ConsoleExecRespDTO result = new ConsoleExecRespDTO();
        if (args.length == 0) {
            result.getLines().add(ConsoleLineDTO.of("用法: rm <path>", "error"));
            return result;
        }
        // Easter egg: rm -rf / triggers crash
        boolean hasRf = false;
        boolean hasRoot = false;
        for (String arg : args) {
            if (arg.startsWith("-") && arg.contains("r") && arg.contains("f")) hasRf = true;
            if ("/".equals(arg) || "/*".equals(arg)) hasRoot = true;
        }
        if (hasRf && hasRoot) {
            result.getLines().add(ConsoleLineDTO.of("rm: recursive delete started on /", "error"));
            result.getLines().add(ConsoleLineDTO.of("Segmentation fault (core dumped)", "error"));
            result.getSideEffects().add("crash");
        } else {
            result.getLines().add(ConsoleLineDTO.of("rm: 权限不足 (试试 rm -rf / ?)", "muted"));
        }
        return result;
    }
}
