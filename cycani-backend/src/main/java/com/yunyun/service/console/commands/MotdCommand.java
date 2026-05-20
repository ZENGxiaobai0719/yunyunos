package com.yunyun.service.console.commands;

import com.yunyun.dto.resp.ConsoleExecRespDTO;
import com.yunyun.dto.resp.ConsoleExecRespDTO.ConsoleLineDTO;
import com.yunyun.service.console.ConsoleCommand;
import org.springframework.stereotype.Component;

@Component
public class MotdCommand implements ConsoleCommand {

    @Override
    public String name() { return "motd"; }

    @Override
    public ConsoleExecRespDTO execute(String[] args) {
        ConsoleExecRespDTO result = new ConsoleExecRespDTO();
        result.getLines().add(ConsoleLineDTO.of("  __  __  __  __  __  __  __  _   _", "banner"));
        result.getLines().add(ConsoleLineDTO.of("  \\ \\/ / | | | \\ | | | | | \\ | | \\ / |", "banner"));
        result.getLines().add(ConsoleLineDTO.of("   \\  /  | | |  \\| | | | |  \\| |  |  |", "banner"));
        result.getLines().add(ConsoleLineDTO.of("   /  \\  |_| |_|\\__| |_| |_|\\__|  |__|", "banner"));
        result.getLines().add(ConsoleLineDTO.of("", "output"));
        result.getLines().add(ConsoleLineDTO.of("  YUNYUN OS  v1.0.0", "success"));
        result.getLines().add(ConsoleLineDTO.of("", "output"));
        result.getLines().add(ConsoleLineDTO.of("  User: guest   Mode: guest   UID: 0   Modules: 3", "muted"));
        result.getLines().add(ConsoleLineDTO.of("", "output"));
        result.getLines().add(ConsoleLineDTO.of("  Try: help | ls modules | open <anime|user|console>", "muted"));
        return result;
    }
}
