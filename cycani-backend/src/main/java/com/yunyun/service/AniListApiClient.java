package com.yunyun.service;

import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Slf4j
@Component
public class AniListApiClient {

    private static final String API_URL = "https://graphql.anilist.co";

    private static final HttpClient HTTP = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    private long lastCall = 0;

    /** 全量 GraphQL 查询 */
    private static final String QUERY = """
        query ($season: MediaSeason, $year: Int, $format: MediaFormat, $page: Int) {
          Page(page: $page, perPage: 50) {
            pageInfo { hasNextPage total }
            media(season: $season, seasonYear: $year, format: $format, sort: POPULARITY_DESC) {
              id
              idMal
              title { romaji english native }
              startDate { year month day }
              endDate { year month day }
              status
              season
              format
              episodes
              duration
              source
              countryOfOrigin
              hashtag
              siteUrl
              description(asHtml: false)
              bannerImage
              isAdult
              coverImage { extraLarge color }
              trailer { id site thumbnail }
              genres
              synonyms
              averageScore
              popularity
              studios { nodes { name siteUrl } }
              externalLinks { site icon color url }
              rankings { rank type season allTime }
              relations { edges { relationType node { id title { romaji english native } siteUrl } } }
              airingSchedule { edges { node { episode airingAt } } }
            }
          }
        }
        """;

    /**
     * 拉取指定季节+格式的番剧（支持分页）
     */
    public JSONObject fetchSeasonal(String season, int year, String format, int page) {
        // 速率控制: 每请求间隔 ~800ms (AniList 限制 ~90/min)
        long now = System.currentTimeMillis();
        long gap = now - lastCall;
        if (gap < 800 && lastCall > 0) {
            try { Thread.sleep(800 - gap); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        }
        lastCall = System.currentTimeMillis();

        JSONObject variables = new JSONObject();
        variables.set("season", season);
        variables.set("year", year);
        variables.set("format", format);
        variables.set("page", page);

        return graphql(variables);
    }

    private JSONObject graphql(JSONObject variables) {
        try {
            JSONObject body = new JSONObject();
            body.set("query", QUERY);
            body.set("variables", variables);

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .timeout(Duration.ofSeconds(45))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
                    .build();

            HttpResponse<String> resp = HTTP.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) {
                log.error("AniList API status {} body: {}", resp.statusCode(), resp.body().substring(0, Math.min(200, resp.body().length())));
                return null;
            }
            JSONObject json = JSONUtil.parseObj(resp.body());
            if (json.containsKey("errors")) {
                log.error("AniList GraphQL errors: {}", json.getJSONArray("errors"));
                return null;
            }
            return json.getJSONObject("data").getJSONObject("Page");
        } catch (Exception e) {
            log.error("AniList API request failed: {}", e.getMessage());
            return null;
        }
    }
}
