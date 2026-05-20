# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Yunyun动漫 — a full-stack anime catalog and streaming site inspired by cycani.org. **pnpm monorepo** with 4 frontend packages + 2 backend projects.

## Monorepo Structure

```
packages/
├── desktop/          → React — Yunyun OS desktop shell (:5173)
├── anime/            → Vue 3 — anime catalog site (:5174)
├── resume/           → Next.js — personal resume (:3000)
└── shortlink-ui/     → Vue 3 — shortlink admin console (:5175)
cycani-backend/       → Spring Boot — anime backend (:8080)
shortlink-main/       → Spring Boot — shortlink backend microservices
音乐播放器/            → audio source assets (served by desktop dev plugin)
```

## Build & Run

### All frontends (unified)

```bash
pnpm install          # install all workspace deps
pnpm dev              # start all 4 dev servers concurrently
pnpm build            # build all packages
```

### Individual packages

```bash
pnpm --filter @yunyun/desktop dev       # Yunyun OS on :5173
pnpm --filter @yunyun/anime dev         # anime site on :5174
pnpm --filter @yunyun/resume dev        # resume on :3000
pnpm --filter @yunyun/shortlink-ui dev  # shortlink console on :5175
```

### Backend (`cycani-backend/`)

Requires **JDK 17** (`C:/Program Files/Java/jdk-17`). The system default is Java 11 which will fail.

```bash
cd cycani-backend
JAVA_HOME="C:/Program Files/Java/jdk-17" PATH="C:/Program Files/Java/jdk-17/bin:$PATH" mvn clean compile -DskipTests
"C:/Program Files/Java/jdk-17/bin/java" -jar target/yunyun-backend-0.0.1-SNAPSHOT.jar
```

API docs at http://localhost:8080/doc.html (Knife4j). OpenAPI spec at `yunyun-api-doc.yaml`.

### Database

MySQL 8.0, database `yunyun`, user `root` / `123456`. DDL at `cycani-backend/src/main/resources/db/cycani.sql`, seed data at `cycani-backend/src/main/resources/db/data.sql`.

## Architecture

### Backend: Classic MVC + MyBatis-Plus

```
controller/          → REST endpoints, @Valid param validation, return Result<T>
service/             → interfaces extending IService<DO> (MyBatis-Plus base)
service/impl/        → business logic, DO↔DTO conversion via Hutool BeanUtil
dao/entity/          → @TableName DO classes (AnimeDO, EpisodeDO, SearchHistoryDO)
dao/mapper/          → BaseMapper + custom @Select/@Update
dto/req/             → request DTOs with @Min/@Max validation
dto/resp/            → response DTOs (leaner than DOs)
common/              → Result<T>, PageResult<T>, BusinessException, GlobalExceptionHandler
config/              → CorsConfig, Knife4jConfig, MybatisPlusConfig, CacheConfig
schedule/            → @Scheduled tasks (ranking snapshot reset)
```

- **Unified response**: All APIs return `Result<T> { code: 0, message: "success", data: T }`. `code=0` is success, non-zero is error. HTTP 200 with code=500 for BusinessException.
- **Caching**: Caffeine local cache. Currently used for `hot_keywords` (10m TTL). Defined in `CacheConfig.java`, applied via `@Cacheable`/`@CacheEvict` on service methods.
- **MyBatis-Plus**: `map-underscore-to-camel-case: true` means DB columns `cover_url` auto-map to Java fields `coverUrl`. Pagination uses `Page<DO>` + `PaginationInnerInterceptor`.
- **Async/ Scheduling**: `@EnableAsync` + `@EnableScheduling` on main class. Search history writes are `@Async`. `RankingSnapshotTask` uses `@Scheduled(cron=...)` for weekly/monthly view reset.

### Frontend: Vue 3 Composition API + Pinia + vue-i18n

```
stores/           → Pinia stores (anime, search, watch, toast, theme, locale)
api/              → Axios client + per-module API functions (anime.ts, search.ts)
pages/            → route-level page components, lazy-loaded
components/       → UI components by domain (home/, layout/, sidebar/, ranking/, toolbar/)
i18n/             → vue-i18n setup, zh-CN.json, zh-TW.json
composables/      → reusable composables (useScrollVisibility)
```

- **Axios interceptor** (`api/client.ts`): Automatically unwraps backend `{ code, data }` envelope — caller receives `data` directly on success, rejected Promise with message on failure.
- **State flow**: Page → `store.fetchXxx()` → `api.getXxx()` → Spring Boot. Components read reactive `store.xxx` refs.
- **Data caching in stores**: `animeStore.fetchHomeData()` skips if `carousel` already populated. `fetchDetail()` skips if same ID already loaded.
- **i18n**: `vue-i18n` with `zh-CN`/`zh-TW`, persisted to localStorage. All user-facing strings use `{{ t('key') }}` syntax.
- **Theme**: Dark/light mode via `data-theme` attribute on `<html>`, CSS custom properties in `style.css`. Toggle persisted to localStorage.
- **Route design**: 7 routes (home, show/:type, anime/:id, play/:animeId/:episode, search, ranking, 404 catch-all). All lazy-loaded. `scrollBehavior` returns top on navigation.

### API Endpoints (7 total)

| Method | Path | Auth | Cache |
|--------|------|------|-------|
| GET | `/api/anime/carousel` | No | none |
| GET | `/api/anime` | No | none (list queries vary) |
| GET | `/api/anime/{id}` | No | none |
| GET | `/api/search?q=&page=&pageSize=` | No | none |
| GET | `/api/search/hot` | No | 10m |
| DELETE | `/api/search/history` | No | evicts hot cache |
| GET | `/api/ranking?type=` | No | none |

## Key Conventions

- **Monorepo**: pnpm workspace — `pnpm install` at root installs all packages. Use `pnpm --filter <name> <cmd>` to target a single package.
- **Iframe URLs**: Desktop `WindowContent.tsx` reads `VITE_*_URL` env vars. `.env` = dev (localhost), `.env.production` = prod (relative paths for Nginx).

- **Naming**: DB `snake_case` ↔ Java `camelCase` ↔ TypeScript `camelCase`. Backend package `com.yunyun`, DB name `yunyun`.
- **Search is paginated**: `GET /api/search?q=xxx&page=1&pageSize=20` returns `PageResult<SearchKeyRespDTO>`. Frontend `Search.vue` has full pagination controls.
- **Ranking**: Single endpoint returns `weekList`, `monthList`, `totalList`. Phase 1 all three use `views` column; Phase 2 will use `weekly_views`/`monthly_views` with scheduled reset task.
- **No auth**: No user system. Watch history and search history sidebar are localStorage-only. Search history is also persisted to backend `search_history` table for hot keyword aggregation.
- **Port 8080 conflicts**: Kill with `cmd //c "taskkill /PID <pid> /F"`. Find PID with `cmd //c "netstat -ano | findstr :8080 | findstr LISTENING"`.
- **Maven wrapper not used**: Use system `mvn` with explicit JAVA_HOME pointing to JDK 17.

### Desktop App (Yunyun OS)

```
packages/desktop/src/
  DesktopApp.tsx            → React root: boot → login → desktop
  components/
    desktop/Desktop.tsx      → Icon grid + wallpaper
    desktop/DesktopIcon.tsx  → Desktop icon (opens window on click)
    windows/WindowManager.tsx → Renders all open windows
    windows/WindowContent.tsx → iframeSrc() maps appId → URL (env-based)
    windows/IframeWindow.tsx → iframe wrapper for external apps
    taskbar/Taskbar.tsx      → Bottom taskbar with app switcher
  stores/useWindowStore.ts   → Window lifecycle (open/close/minimize/focus)
  data/desktop-icons.ts      → Desktop icon definitions
```

**Desktop apps** (iframes — dev URLs from `.env`, prod from `.env.production`):
| App ID | Window Title | Dev URL | Prod URL | Backend |
|--------|-------------|---------|----------|---------|
| user | USER | http://localhost:3000 | /resume/ | Next.js |
| anime | ANIME | http://localhost:5174 | /anime/ | cycani-backend :8080 |
| link | LINK | http://localhost:5175 | /link/ | shortlink gateway :8009 |
| console | CONSOLE | (intro) | (intro) | N/A |

**Music player**: iframe wallpaper at `/music-player/index.html`, served by `serveMusicPlayerLocal` Vite plugin from `音乐播放器/` directory.

### Shortlink (`shortlink-main/`)

SaaS short-link system integrated as the LINK desktop app. Spring Boot 3.0.7 + Spring Cloud + ShardingSphere. Frontend at `packages/shortlink-ui/` (Vue 3 + Vite 8).

```bash
# Backend (JDK 17)
cd shortlink-main
JAVA_HOME="C:/Program Files/Java/jdk-17" PATH="C:/Program Files/Java/jdk-17/bin:$PATH" mvn clean package -DskipTests
# Start gateway (port 8009), admin (8002), aggregation (8003), project (8001)

# Frontend (port 5175, proxies /api → :8009)
pnpm --filter @yunyun/shortlink-ui dev
```

Ports: gateway `8009`, project `8001`, admin `8002`, aggregation `8003`. Frontend dev on `5175`.

## Docs

- `yunyun-api-doc.yaml` — OpenAPI 3.0 spec (Apifox-compatible)
