package com.yunyun.service.console;

import com.yunyun.dto.resp.ConsoleExecRespDTO;
import com.yunyun.dto.resp.ConsoleExecRespDTO.ConsoleLineDTO;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ConsoleService {

    private final Map<String, ConsoleCommand> registry = new LinkedHashMap<>();

    public ConsoleService(List<ConsoleCommand> commands) {
        for (ConsoleCommand cmd : commands) {
            registry.put(cmd.name(), cmd);
            for (String alias : cmd.aliases()) {
                registry.putIfAbsent(alias, cmd);
            }
        }
    }

    public ConsoleExecRespDTO execute(String input) {
        String trimmed = input.trim();
        if (trimmed.isEmpty()) {
            return new ConsoleExecRespDTO();
        }

        String[] parts = trimmed.split("\\s+");
        String name = parts[0].toLowerCase();
        String[] args = Arrays.copyOfRange(parts, 1, parts.length);

        ConsoleCommand cmd = registry.get(name);
        if (cmd == null) {
            return unknownCommand(name);
        }

        try {
            return cmd.execute(args);
        } catch (Exception e) {
            ConsoleExecRespDTO result = new ConsoleExecRespDTO();
            result.getLines().add(ConsoleLineDTO.of("执行错误: " + e.getMessage(), "error"));
            return result;
        }
    }

    /** All registered command names (for autocomplete / help listing). */
    public Set<String> commandNames() {
        Set<String> names = new LinkedHashSet<>();
        for (ConsoleCommand cmd : registry.values()) {
            names.add(cmd.name());
        }
        return names;
    }

    public Collection<ConsoleCommand> allCommands() {
        return new ArrayList<>(new LinkedHashSet<>(registry.values()));
    }

    private ConsoleExecRespDTO unknownCommand(String name) {
        ConsoleExecRespDTO result = new ConsoleExecRespDTO();
        result.getLines().add(ConsoleLineDTO.of("命令未找到: " + name + "。输入 help 查看可用命令。", "error"));
        return result;
    }
}
