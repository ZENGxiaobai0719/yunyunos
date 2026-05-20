package com.yunyun.dto.resp;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AniMediaRespDTO {
    private Integer id;
    private Integer idMal;

    private Title title;
    private Date startDate;
    private Date endDate;

    private String status;
    private String season;
    private String format;
    private Integer episodes;
    private Integer duration;

    private List<String> genres;
    private List<String> synonyms;
    private String source;
    private String countryOfOrigin;
    private String hashtag;

    private Integer popularity;
    private Integer averageScore;
    private String siteUrl;
    private String description;
    private String bannerImage;
    private Boolean isAdult;

    private CoverImage coverImage;
    private Trailer trailer;

    private List<ExternalLink> externalLinks;
    private List<Ranking> rankings;
    private Studios studios;
    private Relations relations;
    private AiringSchedule airingSchedule;

    private List<EpisodeDetailRespDTO> episodeList;

    // ---- inner types ----

    @Data
    public static class Title {
        private String romaji;
        private String english;
        private String nativeTitle;

        public String getNative() { return nativeTitle; }
        public void setNative(String v) { this.nativeTitle = v; }
    }

    @Data
    public static class Date {
        private Integer year;
        private Integer month;
        private Integer day;
    }

    @Data
    public static class CoverImage {
        private String extraLarge;
        private String color;
    }

    @Data
    public static class Trailer {
        private String id;
        private String site;
        private String thumbnail;
    }

    @Data
    public static class ExternalLink {
        private String site;
        private String icon;
        private String color;
        private String url;
    }

    @Data
    public static class Ranking {
        private Integer rank;
        private String type;
        private String season;
        private Boolean allTime;
    }

    @Data
    public static class StudioNode {
        private String name;
        private String siteUrl;
    }

    @Data
    public static class Studios {
        private List<StudioNode> nodes;
    }

    @Data
    public static class RelationNode {
        private String relationType;
        private RelationMedia node;
    }

    @Data
    public static class RelationMedia {
        private Integer id;
        private Title title;
        private String siteUrl;
    }

    @Data
    public static class Relations {
        private List<RelationNode> edges;
    }

    @Data
    public static class AiringNode {
        private Integer episode;
        private Long airingAt;
    }

    @Data
    public static class AiringSchedule {
        private List<AiringNode> nodes;
    }
}
