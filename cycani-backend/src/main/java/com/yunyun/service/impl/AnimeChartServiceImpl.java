package com.yunyun.service.impl;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.yunyun.dao.entity.AnimeDO;
import com.yunyun.dao.entity.EpisodeDO;
import com.yunyun.dao.mapper.AnimeMapper;
import com.yunyun.dao.mapper.EpisodeMapper;
import com.yunyun.dto.resp.*;
import com.yunyun.service.AniListApiClient;
import com.yunyun.service.AnimeChartService;
import com.yunyun.service.MikanService;
import com.yunyun.service.VideoStreamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnimeChartServiceImpl extends ServiceImpl<AnimeMapper, AnimeDO> implements AnimeChartService {

    private final AniListApiClient aniApi;
    private final EpisodeMapper episodeMapper;
    private final VideoStreamService videoStreamService;
    private final MikanService mikanService;

    private static final String[] SEASONS = {"WINTER", "SPRING", "SUMMER", "FALL"};
    private static final String[] FORMATS = {"TV", "TV_SHORT", "MOVIE"};

    // ────────── Query ──────────

    @Override
    public SeasonalChartRespDTO getSeasonal(String season, int year, String format, int page) {
        LambdaQueryWrapper<AnimeDO> q = new LambdaQueryWrapper<AnimeDO>()
                .eq(AnimeDO::getSeason, season)
                .eq(AnimeDO::getSeasonYear, year);
        if (StrUtil.isNotBlank(format)) {
            q.eq(AnimeDO::getFormat, format);
        }
        q.orderByDesc(AnimeDO::getPopularity);

        Page<AnimeDO> pg = page(new Page<>(page, 24), q);
        List<AniMediaRespDTO> list = pg.getRecords().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return new SeasonalChartRespDTO(
                new PageInfoDTO(pg.getPages() > page, (int) pg.getTotal()),
                list);
    }

    @Override
    public AiringScheduleRespDTO getAiring(long start, long end, int page) {
        // 查当前季 RELEASING 且有 airing_schedule 的 anime
        LambdaQueryWrapper<AnimeDO> q = new LambdaQueryWrapper<AnimeDO>()
                .eq(AnimeDO::getStatus, "RELEASING")
                .isNotNull(AnimeDO::getAiringSchedule);
        q.orderByDesc(AnimeDO::getPopularity);

        List<AnimeDO> all = list(q);
        List<AiringScheduleRespDTO.AiringScheduleItem> items = new ArrayList<>();

        for (AnimeDO a : all) {
            if (StrUtil.isBlank(a.getAiringSchedule())) continue;
            JSONArray nodes = parseArray(a.getAiringSchedule());
            if (nodes == null) continue;

            for (int i = 0; i < nodes.size(); i++) {
                JSONObject node = nodes.getJSONObject(i);
                Long airingAt = node.getLong("airingAt");
                if (airingAt != null && airingAt >= start && airingAt <= end) {
                    items.add(new AiringScheduleRespDTO.AiringScheduleItem(
                            a.getAniId(), node.getInt("episode"), airingAt, toDTO(a)));
                }
            }
        }

        // sort by airing time
        items.sort(Comparator.comparing(AiringScheduleRespDTO.AiringScheduleItem::getAiringAt));

        // paginate
        int total = items.size();
        int from = (page - 1) * 24;
        int to = Math.min(from + 24, total);
        List<AiringScheduleRespDTO.AiringScheduleItem> paged = from < total ? items.subList(from, to) : List.of();

        return new AiringScheduleRespDTO(
                new PageInfoDTO(to < total, total), paged);
    }

    @Override
    public SeasonalChartRespDTO getArchive(Integer year, int page) {
        LambdaQueryWrapper<AnimeDO> q = new LambdaQueryWrapper<AnimeDO>();
        if (year != null) {
            q.eq(AnimeDO::getSeasonYear, year);
        }
        q.orderByDesc(AnimeDO::getSeasonYear)
         .orderByAsc(AnimeDO::getSeason)
         .orderByDesc(AnimeDO::getPopularity);

        Page<AnimeDO> pg = page(new Page<>(page, 24), q);
        List<AniMediaRespDTO> list = pg.getRecords().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return new SeasonalChartRespDTO(
                new PageInfoDTO(pg.getPages() > page, (int) pg.getTotal()),
                list);
    }

    @Override
    public SeasonalChartRespDTO getTba(int page) {
        LambdaQueryWrapper<AnimeDO> q = new LambdaQueryWrapper<AnimeDO>()
                .eq(AnimeDO::getStatus, "NOT_YET_RELEASED")
                .orderByDesc(AnimeDO::getPopularity);

        Page<AnimeDO> pg = page(new Page<>(page, 24), q);
        List<AniMediaRespDTO> list = pg.getRecords().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return new SeasonalChartRespDTO(
                new PageInfoDTO(pg.getPages() > page, (int) pg.getTotal()),
                list);
    }

    @Override
    public Map<Integer, Map<String, SeasonStatDTO>> getArchiveStats() {
        List<AnimeDO> all = lambdaQuery()
                .select(AnimeDO::getSeasonYear, AnimeDO::getSeason,
                        AnimeDO::getCoverImageUrl, AnimeDO::getTitleRomaji, AnimeDO::getPopularity)
                .isNotNull(AnimeDO::getSeasonYear)
                .isNotNull(AnimeDO::getSeason)
                .orderByDesc(AnimeDO::getPopularity)
                .list();

        Map<Integer, Map<String, SeasonStatDTO>> stats = new TreeMap<>(Comparator.reverseOrder());
        Map<Integer, Map<String, Boolean>> topFound = new HashMap<>();

        for (AnimeDO a : all) {
            Integer y = a.getSeasonYear();
            String s = a.getSeason();
            if (y == null || s == null) continue;

            stats.computeIfAbsent(y, k -> new LinkedHashMap<>());
            topFound.computeIfAbsent(y, k -> new HashMap<>());

            Map<String, SeasonStatDTO> seasonMap = stats.get(y);
            Map<String, Boolean> foundMap = topFound.get(y);

            SeasonStatDTO dto = seasonMap.get(s);
            if (dto == null) {
                dto = new SeasonStatDTO(1, a.getCoverImageUrl(), a.getTitleRomaji());
                seasonMap.put(s, dto);
                foundMap.put(s, true);
            } else {
                dto.setCount(dto.getCount() + 1);
                // already captured top (first by popularity), skip
            }
        }
        return stats;
    }

    @Override
    public Long resolveInternalId(Long aniId) {
        AnimeDO a = lambdaQuery().eq(AnimeDO::getAniId, aniId).select(AnimeDO::getId).one();
        return a != null ? a.getId() : null;
    }

    @Override
    public AniMediaRespDTO getDetail(Long aniId) {
        AnimeDO a = lambdaQuery().eq(AnimeDO::getAniId, aniId).one();
        if (a == null) return null;
        AniMediaRespDTO dto = toDTO(a);

        List<EpisodeDO> episodes = episodeMapper.selectList(
                new LambdaQueryWrapper<EpisodeDO>()
                        .eq(EpisodeDO::getAnimeId, a.getId())
                        .orderByAsc(EpisodeDO::getNumber));

        // 自动从蜜柑搜索填充剧集
        if (CollUtil.isEmpty(episodes)) {
            try {
                mikanService.searchAndFillEpisodes(a.getId());
                episodes = episodeMapper.selectList(
                        new LambdaQueryWrapper<EpisodeDO>()
                                .eq(EpisodeDO::getAnimeId, a.getId())
                                .orderByAsc(EpisodeDO::getNumber));
            } catch (Exception e) {
                log.warn("蜜柑搜索失败: {}", e.getMessage());
            }
        }

        List<EpisodeDetailRespDTO> epDTOs = new ArrayList<>();
        for (EpisodeDO ep : episodes) {
            EpisodeDetailRespDTO ed = videoStreamService.getEpisodeStatus(a.getId(), ep.getNumber());
            if (ed.getNumber() == null) ed.setNumber(ep.getNumber());
            if (ed.getTitle() == null) ed.setTitle(ep.getTitle());
            if (ed.getUrl() == null) ed.setUrl(ep.getUrl());
            epDTOs.add(ed);
        }
        dto.setEpisodeList(epDTOs);
        return dto;
    }

    // ────────── Sync ──────────

    @Override
    public int syncAllSeasons(int fromYear, int toYear) {
        int total = 0;
        for (int y = toYear; y >= fromYear; y--) {
            for (String s : SEASONS) {
                total += syncSeason(s, y);
            }
        }
        log.info("全量同步完成: {}-{} 共 {} 部", fromYear, toYear, total);
        return total;
    }

    @Override
    public int syncSeason(String season, int year) {
        int count = 0;
        for (String format : FORMATS) {
            int page = 1;
            while (true) {
                JSONObject pg = aniApi.fetchSeasonal(season, year, format, page);
                if (pg == null) break;
                JSONArray mediaList = pg.getJSONArray("media");
                if (CollUtil.isEmpty(mediaList)) break;

                for (int i = 0; i < mediaList.size(); i++) {
                    try {
                        saveFromAniList(mediaList.getJSONObject(i), season, year);
                        count++;
                    } catch (Exception e) {
                        log.warn("入库失败: {}", e.getMessage());
                    }
                }

                JSONObject pi = pg.getJSONObject("pageInfo");
                if (pi == null || !pi.getBool("hasNextPage", false)) break;
                page++;
            }
        }
        log.info("同步完成: {} {} → {} 部", year, season, count);
        return count;
    }

    // ────────── AniList JSON → DB ──────────

    private void saveFromAniList(JSONObject m, String season, int year) {
        Integer aniId = m.getInt("id");
        if (aniId == null) return;

        AnimeDO fresh = buildFromAniList(m, season, year);

        // 已存在则更新
        AnimeDO existing = lambdaQuery().eq(AnimeDO::getAniId, aniId).one();
        if (existing != null) {
            fresh.setId(existing.getId());
            fresh.setCreatedAt(existing.getCreatedAt());
            fresh.setUpdatedAt(LocalDateTime.now());
            updateById(fresh);
            return;
        }

        save(fresh);
    }

    private AnimeDO buildFromAniList(JSONObject m, String season, int year) {
        AnimeDO a = new AnimeDO();
        a.setAniId(m.getInt("id"));
        a.setMalId(m.getInt("idMal"));

        // titles
        JSONObject titleObj = m.getJSONObject("title");
        if (titleObj != null) {
            a.setTitleRomaji(titleObj.getStr("romaji"));
            a.setTitleNative(titleObj.getStr("native"));
            a.setTitleEnglish(titleObj.getStr("english"));
            if (StrUtil.isNotBlank(a.getTitleRomaji()) && containsChinese(a.getTitleRomaji())) {
                a.setTitleChinese(a.getTitleRomaji());
            }
        }
        JSONArray syns = m.getJSONArray("synonyms");
        if (CollUtil.isNotEmpty(syns) && StrUtil.isBlank(a.getTitleChinese())) {
            for (int i = 0; i < syns.size(); i++) {
                String syn = syns.getStr(i);
                if (syn != null && containsChinese(syn)) {
                    a.setTitleChinese(syn);
                    break;
                }
            }
        }

        a.setFormat(m.getStr("format", "TV"));
        a.setStatus(m.getStr("status", "NOT_YET_RELEASED"));
        // 优先使用 AniList 返回的 season/year
        String alSeason = m.getStr("season");
        Integer alYear = m.getByPath("startDate.year", Integer.class);
        a.setSeason(StrUtil.isNotBlank(alSeason) ? alSeason : season);
        a.setSeasonYear(alYear != null ? alYear : year);

        // dates
        JSONObject sd = m.getJSONObject("startDate");
        if (sd != null) { a.setStartDateYear(sd.getInt("year")); a.setStartDateMonth(sd.getInt("month")); a.setStartDateDay(sd.getInt("day")); }
        JSONObject ed = m.getJSONObject("endDate");
        if (ed != null) { a.setEndDateYear(ed.getInt("year")); a.setEndDateMonth(ed.getInt("month")); a.setEndDateDay(ed.getInt("day")); }

        a.setEpisodes(m.getInt("episodes"));
        a.setDuration(m.getInt("duration"));
        a.setPopularity(m.getInt("popularity", 0));
        a.setAverageScore(m.getInt("averageScore"));
        a.setSource(m.getStr("source"));
        a.setCountryOfOrigin(m.getStr("countryOfOrigin", "JP"));
        a.setHashtag(m.getStr("hashtag"));
        a.setSiteUrl(m.getStr("siteUrl"));
        a.setDescription(m.getStr("description"));
        a.setBannerImage(m.getStr("bannerImage"));
        a.setIsAdult(m.getBool("isAdult", false) ? 1 : 0);

        // cover
        JSONObject cover = m.getJSONObject("coverImage");
        if (cover != null) {
            a.setCoverImageUrl(cover.getStr("extraLarge"));
            a.setCoverImageColor(cover.getStr("color"));
        }

        // trailer
        JSONObject trailer = m.getJSONObject("trailer");
        if (trailer != null) {
            a.setTrailerId(trailer.getStr("id"));
            a.setTrailerSite(trailer.getStr("site"));
            a.setTrailerThumbnail(trailer.getStr("thumbnail"));
        }

        // JSON arrays → String
        a.setGenres(toJsonStr(m.getJSONArray("genres")));
        a.setSynonyms(toJsonStr(m.getJSONArray("synonyms")));
        a.setStudios(toStudiosJson(m.getJSONObject("studios")));
        a.setExternalLinks(toJsonStr(m.getJSONArray("externalLinks")));
        a.setRankings(toJsonStr(m.getJSONArray("rankings")));
        a.setRelations(toRelationsJson(m.getJSONObject("relations")));
        a.setAiringSchedule(toAiringJson(m.getJSONObject("airingSchedule")));

        a.setCreatedAt(LocalDateTime.now());
        a.setUpdatedAt(LocalDateTime.now());
        return a;
    }

    // ────────── DB → DTO ──────────

    private AniMediaRespDTO toDTO(AnimeDO a) {
        AniMediaRespDTO dto = new AniMediaRespDTO();
        dto.setId(a.getAniId());
        dto.setIdMal(a.getMalId());

        AniMediaRespDTO.Title title = new AniMediaRespDTO.Title();
        title.setRomaji(a.getTitleRomaji());
        title.setEnglish(a.getTitleEnglish());
        title.setNative(a.getTitleNative());
        dto.setTitle(title);

        if (a.getStartDateYear() != null) {
            AniMediaRespDTO.Date sd = new AniMediaRespDTO.Date();
            sd.setYear(a.getStartDateYear()); sd.setMonth(a.getStartDateMonth()); sd.setDay(a.getStartDateDay());
            dto.setStartDate(sd);
        }
        if (a.getEndDateYear() != null) {
            AniMediaRespDTO.Date ed = new AniMediaRespDTO.Date();
            ed.setYear(a.getEndDateYear()); ed.setMonth(a.getEndDateMonth()); ed.setDay(a.getEndDateDay());
            dto.setEndDate(ed);
        }

        dto.setStatus(a.getStatus());
        dto.setSeason(a.getSeason());
        dto.setFormat(a.getFormat());
        dto.setEpisodes(a.getEpisodes());
        dto.setDuration(a.getDuration());
        dto.setGenres(parseStrList(a.getGenres()));
        dto.setSynonyms(parseStrList(a.getSynonyms()));
        dto.setSource(a.getSource());
        dto.setCountryOfOrigin(a.getCountryOfOrigin());
        dto.setHashtag(a.getHashtag());
        dto.setPopularity(a.getPopularity());
        dto.setAverageScore(a.getAverageScore());
        dto.setSiteUrl(a.getSiteUrl());
        dto.setDescription(a.getDescription());
        dto.setBannerImage(a.getBannerImage());
        dto.setIsAdult(a.getIsAdult() != null && a.getIsAdult() == 1);

        if (StrUtil.isNotBlank(a.getCoverImageUrl())) {
            AniMediaRespDTO.CoverImage ci = new AniMediaRespDTO.CoverImage();
            ci.setExtraLarge(a.getCoverImageUrl());
            ci.setColor(a.getCoverImageColor());
            dto.setCoverImage(ci);
        }

        if (StrUtil.isNotBlank(a.getTrailerId())) {
            AniMediaRespDTO.Trailer tr = new AniMediaRespDTO.Trailer();
            tr.setId(a.getTrailerId()); tr.setSite(a.getTrailerSite()); tr.setThumbnail(a.getTrailerThumbnail());
            dto.setTrailer(tr);
        }

        dto.setExternalLinks(parseList(a.getExternalLinks(), AniMediaRespDTO.ExternalLink.class));
        dto.setRankings(parseList(a.getRankings(), AniMediaRespDTO.Ranking.class));

        if (StrUtil.isNotBlank(a.getStudios())) {
            List<AniMediaRespDTO.StudioNode> nodes = parseList(a.getStudios(), AniMediaRespDTO.StudioNode.class);
            if (CollUtil.isNotEmpty(nodes)) {
                AniMediaRespDTO.Studios studios = new AniMediaRespDTO.Studios();
                studios.setNodes(nodes);
                dto.setStudios(studios);
            }
        }

        if (StrUtil.isNotBlank(a.getRelations())) {
            List<AniMediaRespDTO.RelationNode> edges = parseList(a.getRelations(), AniMediaRespDTO.RelationNode.class);
            if (CollUtil.isNotEmpty(edges)) {
                AniMediaRespDTO.Relations relations = new AniMediaRespDTO.Relations();
                relations.setEdges(edges);
                dto.setRelations(relations);
            }
        }

        if (StrUtil.isNotBlank(a.getAiringSchedule())) {
            List<AniMediaRespDTO.AiringNode> nodes = parseList(a.getAiringSchedule(), AniMediaRespDTO.AiringNode.class);
            if (CollUtil.isNotEmpty(nodes)) {
                AniMediaRespDTO.AiringSchedule as = new AniMediaRespDTO.AiringSchedule();
                as.setNodes(nodes);
                dto.setAiringSchedule(as);
            }
        }

        return dto;
    }

    // ────────── JSON Helpers ──────────

    private static boolean containsChinese(String s) {
        return s != null && s.codePoints().anyMatch(cp -> cp >= 0x4E00 && cp <= 0x9FFF);
    }

    private String toJsonStr(JSONArray arr) {
        return CollUtil.isEmpty(arr) ? null : arr.toString();
    }

    private String toStudiosJson(JSONObject studios) {
        if (studios == null) return null;
        JSONArray nodes = studios.getJSONArray("nodes");
        if (CollUtil.isEmpty(nodes)) return null;
        JSONArray simplified = new JSONArray();
        for (int i = 0; i < nodes.size(); i++) {
            JSONObject n = nodes.getJSONObject(i);
            JSONObject item = new JSONObject();
            item.set("name", n.getStr("name"));
            item.set("siteUrl", n.getStr("siteUrl"));
            simplified.add(item);
        }
        return simplified.toString();
    }

    private String toRelationsJson(JSONObject relations) {
        if (relations == null) return null;
        JSONArray edges = relations.getJSONArray("edges");
        if (CollUtil.isEmpty(edges)) return null;
        return edges.toString();
    }

    private String toAiringJson(JSONObject airingSchedule) {
        if (airingSchedule == null) return null;
        JSONArray edges = airingSchedule.getJSONArray("edges");
        if (CollUtil.isEmpty(edges)) return null;
        JSONArray nodes = new JSONArray();
        for (int i = 0; i < edges.size(); i++) {
            nodes.add(edges.getJSONObject(i).getJSONObject("node"));
        }
        return nodes.toString();
    }

    private JSONArray parseArray(String json) {
        if (StrUtil.isBlank(json)) return null;
        try { return JSONUtil.parseArray(json); } catch (Exception e) { return null; }
    }

    private List<String> parseStrList(String json) {
        JSONArray arr = parseArray(json);
        if (CollUtil.isEmpty(arr)) return List.of();
        return arr.toList(String.class);
    }

    private <T> List<T> parseList(String json, Class<T> clazz) {
        if (StrUtil.isBlank(json)) return List.of();
        try { return JSONUtil.toList(JSONUtil.parseArray(json), clazz); } catch (Exception e) {
            log.warn("JSON parse error: {}", e.getMessage());
            return List.of();
        }
    }
}
