package com.yunyun.service.impl;

import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.yunyun.config.Aria2Config;
import com.yunyun.service.Aria2cService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class Aria2cServiceImpl implements Aria2cService {

    private final Aria2Config config;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();
    private final AtomicInteger rpcId = new AtomicInteger(1);

    @Override
    public void ensureDaemonRunning() {
        if (isAlive()) {
            log.info("aria2c RPC already running at {}", config.getRpcUrl());
            return;
        }
        try {
            String exePath = config.getExePath();
            String downloadDir = config.getDownloadDir();
            ProcessBuilder pb = new ProcessBuilder(
                    exePath,
                    "--enable-rpc",
                    "--rpc-listen-port=6800",
                    "--dir=" + downloadDir,
                    "--seed-time=0",
                    "--max-concurrent-downloads=" + config.getMaxConcurrent(),
                    "--quiet"
            );
            pb.redirectErrorStream(true);
            pb.start();
            Thread.sleep(1000);
            if (isAlive()) {
                log.info("aria2c daemon started successfully");
            } else {
                log.warn("aria2c daemon started but not responding yet");
            }
        } catch (Exception e) {
            log.warn("Failed to start aria2c: {}. Please start manually: aria2c --enable-rpc", e.getMessage());
        }
    }

    @Override
    public String addDownload(String url, String outputDir) {
        JSONObject params = JSONUtil.createObj();
        JSONArray uris = JSONUtil.createArray();
        uris.add(url);
        params.set("dir", outputDir);
        JSONObject result = call("aria2.addUri", uris, params);
        return result != null ? result.getStr("result") : null;
    }

    @Override
    public Aria2Status getStatus(String gid) {
        JSONArray params = JSONUtil.createArray();
        params.add(gid);
        JSONArray keys = JSONUtil.createArray();
        keys.add("gid");
        keys.add("status");
        keys.add("totalLength");
        keys.add("completedLength");
        keys.add("files");
        params.add(keys);
        JSONObject result = call("aria2.tellStatus", params);
        if (result == null) return null;

        JSONObject res = result.getJSONObject("result");
        if (res == null) return null;

        String filePath = null;
        JSONArray files = res.getJSONArray("files");
        if (files != null && !files.isEmpty()) {
            filePath = files.getJSONObject(0).getStr("path");
        }

        long total = res.getLong("totalLength", 0L);
        long completed = res.getLong("completedLength", 0L);
        int pct = total > 0 ? (int) (completed * 100 / total) : 0;

        return new Aria2Status(
                res.getStr("gid"),
                res.getStr("status"),
                total,
                completed,
                filePath,
                pct
        );
    }

    @Override
    public boolean removeDownload(String gid) {
        JSONArray params = JSONUtil.createArray();
        params.add(gid);
        JSONObject result = call("aria2.remove", params);
        return result != null && result.getStr("result") != null;
    }

    @Override
    public boolean isAlive() {
        try {
            JSONObject result = call("aria2.getVersion", JSONUtil.createArray());
            return result != null && result.containsKey("result");
        } catch (Exception e) {
            return false;
        }
    }

    private JSONObject call(String method, Object... params) {
        try {
            JSONObject body = JSONUtil.createObj();
            body.set("jsonrpc", "2.0");
            body.set("id", String.valueOf(rpcId.getAndIncrement()));
            body.set("method", method);
            JSONArray paramArray = JSONUtil.createArray();
            for (Object p : params) {
                paramArray.add(p);
            }
            body.set("params", paramArray);

            String json = body.toString();
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(config.getRpcUrl()))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                    .timeout(Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() == 200) {
                return JSONUtil.parseObj(resp.body());
            }
            log.warn("aria2 RPC returned HTTP {}", resp.statusCode());
        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) Thread.currentThread().interrupt();
            log.debug("aria2 RPC call failed: {}", e.getMessage());
        }
        return null;
    }
}
