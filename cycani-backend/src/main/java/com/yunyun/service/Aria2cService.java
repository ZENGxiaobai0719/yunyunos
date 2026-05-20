package com.yunyun.service;

public interface Aria2cService {
    record Aria2Status(String gid, String status, long totalLength,
                       long completedLength, String filePath, int progressPercent) {}

    void ensureDaemonRunning();
    String addDownload(String url, String outputDir);
    Aria2Status getStatus(String gid);
    boolean removeDownload(String gid);
    boolean isAlive();
}
