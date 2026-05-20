package com.yunyun.service.console;

import com.yunyun.dto.resp.ConsoleExecRespDTO;

/**
 * A single console command.  Implementations are auto-discovered by
 * ConsoleService via Spring's List injection.
 */
public interface ConsoleCommand {

    /** Primary command name, e.g. "ls". */
    String name();

    /** Alternative names. Default empty. */
    default String[] aliases() {
        return new String[0];
    }

    /** Execute the command with the given arguments (args[0] is the first argument, NOT the command name). */
    ConsoleExecRespDTO execute(String[] args);
}
