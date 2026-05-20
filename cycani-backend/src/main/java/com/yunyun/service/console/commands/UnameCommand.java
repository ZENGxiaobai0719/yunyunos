package com.yunyun.service.console.commands;

import com.yunyun.dto.resp.ConsoleExecRespDTO;
import com.yunyun.dto.resp.ConsoleExecRespDTO.ConsoleLineDTO;
import com.yunyun.service.console.ConsoleCommand;
import org.springframework.stereotype.Component;

@Component
public class UnameCommand implements ConsoleCommand {

    @Override
    public String name() { return "uname"; }

    @Override
    public ConsoleExecRespDTO execute(String[] args) {
        ConsoleExecRespDTO result = new ConsoleExecRespDTO();
        boolean all = false;
        for (String a : args) {
            if ("-a".equals(a)) { all = true; break; }
        }
        if (all) {
            result.getLines().add(ConsoleLineDTO.of("YUNYUN OS 1.0.0 | Kernel yunyun-25.0 | x86_64", "success"));
        } else {
            result.getLines().add(ConsoleLineDTO.of("YUNYUN OS", "success"));
        }
        return result;
    }
}
