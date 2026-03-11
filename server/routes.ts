import type { Express } from "express";
import { createServer, type Server } from "http";

const API = 'https://beratechapi-production.up.railway.app';
const HEADERS = { 'User-Agent': 'SkyPlus/1.0', 'Accept': 'application/json' };

async function proxy(path: string, res: any) {
  try {
    const response = await fetch(`${API}${path}`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(15000),
    });
    const data = await response.json();
    res.setHeader('Cache-Control', 'public, max-age=180');
    return res.json(data);
  } catch (err: any) {
    console.error(`Proxy error ${path}:`, err.message);
    return res.status(502).json({ error: 'External API unavailable' });
  }
}

async function fetchJson(path: string) {
  const r = await fetch(`${API}${path}`, { headers: HEADERS, signal: AbortSignal.timeout(12000) });
  return r.json();
}

async function resolveEmbedUrl(id: string, type: string, title: string, year: string): Promise<string> {
  const isTv = type === 'tv' || type === 'series';
  try {
    if (title) {
      const t = isTv ? 'series' : 'movie';
      const omdb = await fetch(
        `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&y=${year || ''}&type=${t}&apikey=trilogy`,
        { signal: AbortSignal.timeout(8000) }
      ).then(r => r.json());
      if (omdb.Response === 'True' && omdb.imdbID) {
        return isTv
          ? `https://multiembed.mov/?video_id=${omdb.imdbID}&tmdb=0&s=1&e=1`
          : `https://vidlink.pro/movie/${omdb.imdbID}`;
      }
    }
  } catch {}
  return isTv
    ? `https://multiembed.mov/?video_id=${id}&tmdb=0&s=1&e=1`
    : `https://vidlink.pro/movie/${id}`;
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  const q = (req: any) => new URLSearchParams(req.query as any).toString();

  app.get('/stream/home',     (req, res) => proxy('/api/movie/home', res));
  app.get('/stream/trending', (req, res) => proxy(`/api/movie/trending?${q(req)}`, res));
  app.get('/stream/movies',   (req, res) => proxy(`/api/movie/movies?${q(req)}`, res));
  app.get('/stream/series',   (req, res) => proxy(`/api/movie/series?${q(req)}`, res));
  app.get('/stream/search',   (req, res) => proxy(`/api/movie/search?${q(req)}`, res));
  app.get('/stream/filter',   (req, res) => proxy(`/api/movie/filter?${q(req)}`, res));
  app.get('/stream/detail',   (req, res) => proxy(`/api/movie/detail?${q(req)}`, res));
  app.get('/stream/stream',   (req, res) => proxy(`/api/movie/stream?${q(req)}`, res));
  app.get('/stream/download', (req, res) => proxy(`/api/movie/download?${q(req)}`, res));

  app.get('/player', async (req: any, res: any) => {
    const id    = req.query.id    as string;
    const title = req.query.title as string || '';
    const year  = req.query.year  as string || '';
    const type  = req.query.type  as string || 'movie';
    if (!id) return res.status(400).send('Missing id');

    const embedUrl = await resolveEmbedUrl(id, type, title, year);
    const safeTitle = title.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle || 'Watch Now'} — SkyPlus</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; font-family: system-ui, sans-serif; }
    #bar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 10;
      display: flex; align-items: center; gap: 12px;
      padding: 10px 16px;
      background: linear-gradient(to bottom, rgba(0,0,0,.85) 0%, transparent 100%);
    }
    #bar a {
      color: #fff; text-decoration: none; font-size: 14px; font-weight: 500;
      display: flex; align-items: center; gap: 6px; opacity: .85;
    }
    #bar a:hover { opacity: 1; }
    #bar span { color: #fff; font-size: 14px; font-weight: 600; opacity: .9; }
    iframe { position: fixed; inset: 0; width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <iframe src="${embedUrl}"
    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
    allowfullscreen
    referrerpolicy="no-referrer-when-downgrade">
  </iframe>
  <div id="bar">
    <a href="javascript:history.back()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      Back
    </a>
    ${safeTitle ? `<span>${safeTitle}</span>` : ''}
  </div>
</body>
</html>`);
  });

  app.get('/stream/embed', async (req: any, res: any) => {
    const id   = req.query.id    as string;
    const title = req.query.title as string || '';
    const year  = req.query.year  as string || '';
    const type  = req.query.type  as string || 'movie';
    if (!id && !title) return res.status(400).json({ error: 'Missing id or title' });
    const embedUrl = await resolveEmbedUrl(id || title, type, title, year);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.json({ result: { embedUrl, source: embedUrl.includes('vidlink') ? 'vidlink.pro' : 'multiembed.mov' } });
  });

  app.get('/stream/lookup', async (req: any, res: any) => {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    try {
      const sources = [
        '/api/movie/home',
        '/api/movie/trending?page=1',
        '/api/movie/movies?page=1',
        '/api/movie/series?page=1',
      ];
      for (const src of sources) {
        try {
          const data = await fetchJson(src);
          const pool: any[] = src.includes('home')
            ? (data?.result?.sections ?? []).flatMap((s: any) => s.items ?? [])
            : (data?.result?.results ?? []);
          const found = pool.find((i: any) => i.id === id);
          if (found) {
            res.setHeader('Cache-Control', 'public, max-age=300');
            return res.json({ result: found });
          }
        } catch {}
      }
      return res.status(404).json({ error: 'Item not found' });
    } catch (err: any) {
      return res.status(502).json({ error: err.message });
    }
  });

  return httpServer;
}
