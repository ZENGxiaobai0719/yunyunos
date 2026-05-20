package com.yunyun.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsoleExecRespDTO {

    private List<ConsoleLineDTO> lines = new ArrayList<>();

    /**
     * Side effects that the frontend should execute.
     * e.g. "open:anime", "shutdown", "clear"
     */
    private List<String> sideEffects = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConsoleLineDTO {
        private String text;
        private String kind; // output, banner, error, success, muted, info, input

        public static ConsoleLineDTO of(String text, String kind) {
            return new ConsoleLineDTO(text, kind);
        }
    }
}
