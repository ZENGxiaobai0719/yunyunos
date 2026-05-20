package com.yunyun.service.console.commands;

import com.yunyun.dto.resp.ConsoleExecRespDTO;
import com.yunyun.dto.resp.ConsoleExecRespDTO.ConsoleLineDTO;
import com.yunyun.service.console.ConsoleCommand;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.LinkedHashMap;

@Component
public class LsCommand implements ConsoleCommand {

    private static final Map<String, String> MODULES = new LinkedHashMap<>();

    static {
        MODULES.put("anime",   "动漫番剧浏览器");
        MODULES.put("user",    "用户个人页");
        MODULES.put("console", "系统控制台 (当前窗口)");
    }

    @Override
    public String name() { return "ls"; }

    @Override
    public String[] aliases() { return new String[]{"dir"}; }

    @Override
    public ConsoleExecRespDTO execute(String[] args) {
        ConsoleExecRespDTO result = new ConsoleExecRespDTO();
        result.getLines().add(ConsoleLineDTO.of("可用模块:", "muted"));
        for (Map.Entry<String, String> entry : MODULES.entrySet()) {
            result.getLines().add(ConsoleLineDTO.of(
                String.format("  %-10s — %s", entry.getKey(), entry.getValue()), "output"));
        }
        return result;
    }
}
