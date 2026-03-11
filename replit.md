# SkyPlus+ Streaming Website

A premium streaming website modeled after Disney+, featuring movies, TV shows, anime, and dramas with a deep navy dark theme and smooth animations.

## Overview

SkyPlus+ is a fully responsive streaming discovery platform that integrates with the `beratech-api.replit.app` external API to fetch and display content.

## Architecture

- **Frontend**: React + TypeScript + Vite + TanStack Query
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: Wouter
- **State**: TanStack Query for server state, localStorage for My List
- **Backend**: Express (minimal, serves frontend)

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Home.tsx` | Hero banner + 10+ content rows |
| `/movie/:id` | `MovieDetails.tsx` | Movie details with cast, trailers, streams |
| `/tv/:id` | `TVDetails.tsx` | TV show details with seasons & episodes |
| `/anime/:id` | `AnimeDetails.tsx` | Anime details via AniList API |
| `/drama/:id` | `DramaDetails.tsx` | Drama details with episode list |
| `/watch/:type/:id` | `Watch.tsx` | Video player with source selection |
| `/search` | `Search.tsx` | Debounced search across all content types |
| `/mylist` | `MyList.tsx` | Saved titles (localStorage) |
| `/category/:type` | `Category.tsx` | Browse by category with filters & pagination |

## Key Components

- `Navbar.tsx` — Fixed top nav with glass morphism, mobile menu
- `HeroBanner.tsx` — Auto-rotating hero with gradient overlays, play/list/info actions
- `ContentRow.tsx` — Horizontally scrollable row with arrow navigation
- `ContentCard.tsx` — Poster card with hover overlay, add to list

## API Endpoints Used

All requests go to `https://beratech-api.replit.app`:

- `/api/movie/trending`, `/api/movie/popular`, `/api/movie/top-rated`, `/api/movie/now-playing`
- `/api/movie/info`, `/api/movie/stream`, `/api/movie/providers`
- `/api/movie/search`, `/api/movie/discover`, `/api/movie/genres`
- `/api/movie/free` (free classic movies)
- `/api/anime/spotlight`, `/api/anime/airing`, `/api/anime/popular`, `/api/anime/recent`
- `/api/anime/anilist/trending`, `/api/anime/anilist/info`, `/api/anime/anilist/search`
- `/api/drama/trending`, `/api/drama/info`, `/api/drama/season`, `/api/drama/search`

## Color Scheme

- Primary Background: `#0A0F1C`
- Secondary Background: `#1A1F2E`
- Card: `#1E2433` / hover `#2A3142`
- Accent: `#3B82F6` (blue)
- Text: white/`#9CA3AF`

## Features

- Responsive design (mobile 2-col, tablet 3-4, desktop 5-6)
- Skeleton loaders on all content
- In-memory API response caching (5 min TTL)
- My List persisted in localStorage
- Debounced search with type filtering
- Category browsing with genre chips and sort options
- Video streaming via embed iframes
- Auto-rotating hero banner with dot indicators
