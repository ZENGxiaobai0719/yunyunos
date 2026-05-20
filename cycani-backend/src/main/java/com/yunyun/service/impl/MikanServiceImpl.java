package com.yunyun.service.impl;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.yunyun.dao.entity.AnimeDO;
import com.yunyun.dao.entity.EpisodeDO;
import com.yunyun.dao.mapper.AnimeMapper;
import com.yunyun.dao.mapper.EpisodeMapper;
import com.yunyun.service.MikanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class MikanServiceImpl extends ServiceImpl<AnimeMapper, AnimeDO> implements MikanService {

    private final EpisodeMapper episodeMapper;

    @Value("${mikan.api-base:https://mikanani.me}")
    private String mikanBase;

    @Value("${mikan.proxy-host:}")
    private String proxyHost;

    @Value("${mikan.proxy-port:0}")
    private int proxyPort;

    @Override
    public int syncFromClassicRss() {
        String xml = fetchUrl(mikanBase + "/RSS/Classic", 10);
        if (StrUtil.isBlank(xml)) return 0;

        List<RssItem> items = parseRssXml(xml);
        if (CollUtil.isEmpty(items)) return 0;

        int count = 0;
        for (RssItem item : items) {
            try {
                String animeName = extractAnimeName(item.title);
                Integer epNum = extractEpisodeNum(item.title);
                if (animeName == null || epNum == null) continue;

                AnimeDO anime = matchAnime(animeName);
                if (anime == null) continue;

                if (saveEpisode(anime, epNum, item)) {
                    count++;
                    updateLatestEpisode(anime, epNum);
                }
            } catch (Exception e) {
                log.debug("单条RSS处理失败: {}", e.getMessage());
            }
        }
        return count;
    }

    @Override
    public int searchAndFillEpisodes(Long animeId) {
        AnimeDO anime = getById(animeId);
        if (anime == null) return 0;

        // 分别用中文名和日文名搜索
        String title = StrUtil.isNotBlank(anime.getTitleChinese()) ? anime.getTitleChinese() : anime.getTitleRomaji();
        int count = searchAndSave(anime, title);
        if (count == 0 && StrUtil.isNotBlank(anime.getTitleNative())) {
            count = searchAndSave(anime, anime.getTitleNative());
        }

        if (count > 0) {
            updateById(anime);
        }
        return count;
    }

    private int searchAndSave(AnimeDO anime, String keyword) {
        String encoded = URLEncoder.encode(keyword, StandardCharsets.UTF_8);
        String xml = fetchUrl(mikanBase + "/RSS/Search?searchstr=" + encoded, 8);
        if (StrUtil.isBlank(xml)) return 0;

        // 搜索结果同样是RSS XML格式
        List<RssItem> items = parseRssXml(xml);
        if (CollUtil.isEmpty(items)) return 0;

        int count = 0;
        for (RssItem item : items) {
            Integer epNum = extractEpisodeNum(item.title);
            if (epNum == null) continue;
            if (saveEpisode(anime, epNum, item)) {
                count++;
                updateLatestEpisode(anime, epNum);
            }
        }
        return count;
    }

    private String fetchUrl(String url, int timeoutSeconds) {
        try {
            HttpURLConnection conn;
            if (StrUtil.isNotBlank(proxyHost) && proxyPort > 0) {
                Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress(proxyHost, proxyPort));
                conn = (HttpURLConnection) URI.create(url).toURL().openConnection(proxy);
            } else {
                conn = (HttpURLConnection) URI.create(url).toURL().openConnection();
            }
            conn.setConnectTimeout(timeoutSeconds * 1000);
            conn.setReadTimeout(timeoutSeconds * 1000);
            conn.setRequestProperty("User-Agent", "YunyunAnime/1.0");
            int code = conn.getResponseCode();
            if (code != 200) return null;
            InputStream is = conn.getInputStream();
            String result = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            is.close();
            return result;
        } catch (Exception e) {
            log.error("蜜柑请求失败: {}", e.getMessage());
            return null;
        }
    }

    /** 解析蜜柑RSS XML */
    private List<RssItem> parseRssXml(String xml) {
        try {
            Document doc = DocumentBuilderFactory.newInstance()
                    .newDocumentBuilder()
                    .parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));
            NodeList nodes = doc.getElementsByTagName("item");
            List<RssItem> items = new ArrayList<>();
            for (int i = 0; i < nodes.getLength(); i++) {
                Element el = (Element) nodes.item(i);
                RssItem item = new RssItem();
                item.title = getText(el, "title");
                item.link = getText(el, "link");

                NodeList enclosures = el.getElementsByTagName("enclosure");
                if (enclosures.getLength() > 0) {
                    item.torrentUrl = ((Element) enclosures.item(0)).getAttribute("url");
                }
                NodeList torrents = el.getElementsByTagNameNS("https://mikanani.me/0.1/", "pubDate");
                if (torrents.getLength() > 0) {
                    item.pubDate = torrents.item(0).getTextContent();
                }
                items.add(item);
            }
            return items;
        } catch (Exception e) {
            log.error("解析蜜柑RSS XML失败", e);
            return List.of();
        }
    }

    private String getText(Element parent, String tagName) {
        NodeList list = parent.getElementsByTagName(tagName);
        return list.getLength() > 0 ? list.item(0).getTextContent() : null;
    }

    /** 从RSS标题提取番剧名：去首组[字幕组]和尾部[分辨率] */
    String extractAnimeName(String title) {
        if (StrUtil.isBlank(title)) return null;
        // 去掉第一个括号内容（字幕组）
        String noGroup = title.replaceFirst("^\\[.+?]", "").trim();
        // 从末尾找" - 集数"模式
        int epIdx = noGroup.lastIndexOf(" - ");
        if (epIdx > 0) {
            noGroup = noGroup.substring(0, epIdx).trim();
        }
        // 去掉尾部括号内容
        noGroup = noGroup.replaceAll("\\[.+?]$", "").trim();
        return StrUtil.isBlank(noGroup) ? null : noGroup;
    }

    /** 从RSS标题提取集数，如" - 07"、"][06"、"E06" → 6 */
    Integer extractEpisodeNum(String title) {
        if (StrUtil.isBlank(title)) return null;
        // 匹配模式: "- 06", "][06", "E06", "第06话", " - 06 -", etc.
        Matcher m = Pattern.compile("(?:[-\\s\\[\\\\]\\s*|E|第)(\\d{1,3})(?:\\s|$|[\\[\\].vV话集 -])").matcher(title);
        if (m.find()) {
            try { return Integer.valueOf(m.group(1)); } catch (Exception ignored) {}
        }
        // fallback: match bracket-wrapped number like [06 - 总第72]
        m = Pattern.compile("\\[(\\d{1,3})\\s*[-]").matcher(title);
        if (m.find()) {
            try { return Integer.valueOf(m.group(1)); } catch (Exception ignored) {}
        }
        return null;
    }

    /** 匹配anime表：先精确匹配各标题，再模糊 */
    private AnimeDO matchAnime(String rssName) {
        String clean = rssName.replaceAll("[\\[\\]【】「」]", "").trim();
        AnimeDO anime = lambdaQuery().eq(AnimeDO::getTitleChinese, clean).one();
        if (anime != null) return anime;
        anime = lambdaQuery().eq(AnimeDO::getTitleRomaji, clean).one();
        if (anime != null) return anime;
        anime = lambdaQuery().eq(AnimeDO::getTitleNative, clean).one();
        if (anime != null) return anime;
        anime = lambdaQuery().like(AnimeDO::getTitleChinese, clean).one();
        if (anime != null) return anime;
        anime = lambdaQuery().like(AnimeDO::getTitleRomaji, clean).one();
        if (anime != null) return anime;
        return lambdaQuery().like(AnimeDO::getTitleNative, clean).one();
    }

    /** 保存episode，同anime_id+number已存在则跳过 */
    private boolean saveEpisode(AnimeDO anime, int epNum, RssItem item) {
        Long count = episodeMapper.selectCount(
                new LambdaQueryWrapper<EpisodeDO>()
                        .eq(EpisodeDO::getAnimeId, anime.getId())
                        .eq(EpisodeDO::getNumber, epNum));
        if (count > 0) return false;

        EpisodeDO ep = new EpisodeDO();
        ep.setAnimeId(anime.getId());
        ep.setNumber(epNum);
        ep.setTitle(extractEpTitle(item.title, epNum));
        ep.setUrl(item.torrentUrl);
        episodeMapper.insert(ep);

        log.info("新集入库: {} 第{}集", StrUtil.isNotBlank(anime.getTitleChinese()) ? anime.getTitleChinese() : anime.getTitleRomaji(), epNum);
        return true;
    }

    /** 尝试从标题提取话标题 */
    private String extractEpTitle(String title, int epNum) {
        String afterEp = title.replaceFirst(".*[-\\s]" + epNum + "(?:\\s|$|\\[)", "").trim();
        return StrUtil.isBlank(afterEp) || afterEp.length() > 50 ? "第" + epNum + "话" : afterEp;
    }

    /** 更新最新集数到 episodes 字段 */
    private void updateLatestEpisode(AnimeDO anime, int epNum) {
        Integer currentNum = anime.getEpisodes();
        if (currentNum == null) currentNum = 0;
        if (epNum > currentNum) {
            anime.setEpisodes(epNum);
            updateById(anime);
        }
    }

    /** RSS条目 */
    private static class RssItem {
        String title;
        String link;
        String torrentUrl;
        String pubDate;
    }
}
