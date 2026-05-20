package com.yunyun.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "aria2")
public class Aria2Config {
    private String rpcUrl = "http://127.0.0.1:6800/jsonrpc";
    private String rpcSecret = "";
    private String downloadDir = "./downloads";
    private String exePath = "aria2c";
    private int pollIntervalMs = 2000;
    private int maxConcurrent = 3;
}
