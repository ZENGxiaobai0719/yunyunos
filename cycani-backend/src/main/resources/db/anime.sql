CREATE DATABASE IF NOT EXISTS yunyun DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE yunyun;

-- ============================================================
-- 番剧表 (AniList data model)
-- ============================================================
CREATE TABLE anime (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ani_id INT UNIQUE NOT NULL COMMENT 'AniList ID',
    mal_id INT COMMENT 'MyAnimeList ID',

    -- 多语言标题
    title_romaji VARCHAR(255) COMMENT '罗马音标题',
    title_native VARCHAR(255) COMMENT '日文标题',
    title_english VARCHAR(255) COMMENT '英文标题',
    title_chinese VARCHAR(255) COMMENT '中文标题 (anilist-chinese注入)',

    -- 核心字段
    format VARCHAR(32) NOT NULL COMMENT 'TV/TV_SHORT/MOVIE/OVA/ONA/SPECIAL/MUSIC',
    status VARCHAR(32) NOT NULL COMMENT 'RELEASING/FINISHED/NOT_YET_RELEASED/CANCELLED',
    season VARCHAR(16) COMMENT 'WINTER/SPRING/SUMMER/FALL',
    season_year INT COMMENT '播出年份',

    -- 日期 (FuzzyDate)
    start_date_year INT,
    start_date_month INT,
    start_date_day INT,
    end_date_year INT,
    end_date_month INT,
    end_date_day INT,

    -- 数值
    episodes INT COMMENT '总集数',
    duration INT COMMENT '每集时长(分钟)',
    popularity INT DEFAULT 0 COMMENT 'AniList热度',
    average_score INT COMMENT 'AniList评分 0-100',

    -- 文本
    source VARCHAR(32) COMMENT '原著: MANGA/LIGHT_NOVEL/ORIGINAL/GAME/NOVEL/OTHER',
    country_of_origin VARCHAR(8) DEFAULT 'JP',
    hashtag VARCHAR(128),
    site_url VARCHAR(256),
    description TEXT COMMENT '剧情简介',
    banner_image VARCHAR(512),

    -- 封面
    cover_image_url VARCHAR(512),
    cover_image_color VARCHAR(16),

    -- 预告片
    trailer_id VARCHAR(128),
    trailer_site VARCHAR(32),
    trailer_thumbnail VARCHAR(512),

    -- 标记
    is_adult TINYINT DEFAULT 0,

    -- JSON 嵌套数据
    genres JSON COMMENT '["Action","Comedy"]',
    synonyms JSON COMMENT '["别名1","别名2"]',
    studios JSON COMMENT '[{"name":"A-1","siteUrl":"..."}]',
    external_links JSON COMMENT '[{"site":"Crunchyroll","icon":"...","color":"...","url":"..."}]',
    rankings JSON COMMENT '[{"rank":1,"type":"POPULAR","season":"SPRING"}]',
    relations JSON COMMENT '[{"relationType":"PREQUEL","node":{...}}]',
    airing_schedule JSON COMMENT '[{"episode":7,"airingAt":1747000000}]',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_season (season, season_year),
    INDEX idx_format (format),
    INDEX idx_status (status),
    INDEX idx_popularity (popularity DESC),
    INDEX idx_avg_score (average_score DESC),
    INDEX idx_ani_id (ani_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 分集表
-- ============================================================
CREATE TABLE episode (
    id       BIGINT PRIMARY KEY AUTO_INCREMENT,
    anime_id BIGINT NOT NULL,
    number   INT NOT NULL,
    title    VARCHAR(255),
    url      VARCHAR(512),

    FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_anime_ep (anime_id, number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 搜索历史表
-- ============================================================
-- ============================================================
-- 音乐播放器 - 歌曲表
-- ============================================================
CREATE TABLE music_song (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    title       VARCHAR(255) NOT NULL COMMENT '歌曲名',
    artist      VARCHAR(255) NOT NULL COMMENT '歌手',
    album       VARCHAR(255) COMMENT '专辑',
    music_file  VARCHAR(500) NOT NULL COMMENT '音乐文件存储路径',
    cover_file  VARCHAR(500) COMMENT '封面文件存储路径',
    duration    INT DEFAULT 0 COMMENT '时长(秒)',
    lyrics      TEXT COMMENT '歌词',
    sort_order  INT DEFAULT 0 COMMENT '排序',
    is_default  TINYINT DEFAULT 0 COMMENT '是否默认展示',
    default_bg  INT DEFAULT 1 COMMENT '默认背景编号',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE search_history (
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    query      VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
