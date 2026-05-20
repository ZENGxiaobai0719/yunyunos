package com.yunyun.service.console.commands;

import com.yunyun.dto.resp.ConsoleExecRespDTO;
import com.yunyun.dto.resp.ConsoleExecRespDTO.ConsoleLineDTO;
import com.yunyun.service.console.ConsoleCommand;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

@Component
public class OpenCommand implements ConsoleCommand {

    private static final Map<String, String> ALIASES = Map.of(
        "user", "user",
        "personal", "user",
        "anime", "anime",
        "console", "console",
        "terminal", "console",
        "intro", "console"
    );

    private static final Set<String> VALID = Set.of("anime", "user", "console");

    @Override
    public String name() { return "open"; }

    @Override
    public String[] aliases() { return new String[]{"start", "launch"}; }

    @Override
    public ConsoleExecRespDTO execute(String[] args) {
        ConsoleExecRespDTO result = new ConsoleExecRespDTO();
        if (args.length == 0) {
            result.getLines().add(ConsoleLineDTO.of("用法: open <module>", "error"));
            result.getLines().add(ConsoleLineDTO.of("可用模块: anime, user, console", "muted"));
            return result;
        }
        String target = ALIASES.getOrDefault(args[0].toLowerCase(), args[0].toLowerCase());
        if (!VALID.contains(target)) {
            result.getLines().add(ConsoleLineDTO.of("未知模块: " + args[0], "error"));
            return result;
        }
        result.getLines().add(ConsoleLineDTO.of("正在打开 " + target + "...", "success"));
        result.getSideEffects().add("open:" + target);
        return result;
    }
}
