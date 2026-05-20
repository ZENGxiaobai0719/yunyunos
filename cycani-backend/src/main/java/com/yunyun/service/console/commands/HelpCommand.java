package com.yunyun.service.console.commands;

import com.yunyun.dto.resp.ConsoleExecRespDTO;
import com.yunyun.dto.resp.ConsoleExecRespDTO.ConsoleLineDTO;
import com.yunyun.service.console.ConsoleCommand;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class HelpCommand implements ConsoleCommand {

    // Command registry with descriptions — the single source of truth for help text.
    private static final Map<String, String> HELP = new LinkedHashMap<>();
    static {
        HELP.put("help",     "Show this help message");
        HELP.put("clear",    "Clear the terminal screen");
        HELP.put("echo",     "Print text to output");
        HELP.put("whoami",   "Show current user");
        HELP.put("date",     "Show local date and time");
        HELP.put("uname",    "Show system info (-a for detailed)");
        HELP.put("ls",       "List available modules");
        HELP.put("motd",     "Show login welcome banner");
        HELP.put("open",     "Open a desktop module (anime|user|console)");
        HELP.put("close",    "Close a desktop module");
        HELP.put("focus",    "Focus a desktop module");
        HELP.put("shutdown", "Power off desktop session");
        HELP.put("reboot",   "Restart desktop session");
        HELP.put("rm",       "Remove files (dangerous!)");
        HELP.put("exit",     "Minimize console window");
    }

    @Override
    public String name() { return "help"; }

    @Override
    public ConsoleExecRespDTO execute(String[] args) {
        ConsoleExecRespDTO result = new ConsoleExecRespDTO();
        String target = args.length > 0 ? args[0].toLowerCase() : "";

        if (!target.isEmpty() && HELP.containsKey(target)) {
            result.getLines().add(ConsoleLineDTO.of(
                String.format("%-10s — %s", target, HELP.get(target)), "output"));
            return result;
        }
        if (!target.isEmpty()) {
            result.getLines().add(ConsoleLineDTO.of("Unknown command: " + target, "error"));
            result.getLines().add(ConsoleLineDTO.of("Type 'help' for a list of available commands.", "muted"));
            return result;
        }

        result.getLines().add(ConsoleLineDTO.of("Available commands:", "muted"));
        result.getLines().add(ConsoleLineDTO.of("", "output"));

        int maxLen = 0;
        for (String name : HELP.keySet()) {
            if (name.length() > maxLen) maxLen = name.length();
        }
        maxLen += 2;

        for (Map.Entry<String, String> entry : HELP.entrySet()) {
            String left = "  " + entry.getKey();
            result.getLines().add(ConsoleLineDTO.of(
                String.format("%-" + maxLen + "s%s", left, entry.getValue()), "output"));
        }

        result.getLines().add(ConsoleLineDTO.of("", "output"));
        result.getLines().add(ConsoleLineDTO.of("Type 'help <command>' for details on a specific command.", "muted"));
        return result;
    }
}
