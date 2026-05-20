package com.yunyun;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.yunyun.dao.mapper")
@EnableAsync
@EnableScheduling
public class YunyunApplication {
    public static void main(String[] args) {
        SpringApplication.run(YunyunApplication.class, args);
    }
}
