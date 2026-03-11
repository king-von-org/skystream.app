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
    const title = req.query.title as string;
    const year  = req.query.year  as string;
    const type  = req.query.type  as string;
    if (!id) return res.status(400).send('Missing id');

    let embedUrl = '';
    try {
      if (title) {
        const t = type === 'tv' ? 'series' : 'movie';
        const omdbUrl = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&y=${year||''}&type=${t}&apikey=trilogy`;
        const omdbRes = await fetch(omdbUrl, { signal: AbortSignal.timeout(8000) });
        const omdb = await omdbRes.json();
        if (omdb.Response === 'True' && omdb.imdbID) {
          embedUrl = t === 'series'
            ? `https://multiembed.mov/?video_id=${omdb.imdbID}&tmdb=0&s=1&e=1`
            : `https://vidlink.pro/movie/${omdb.imdbID}`;
        }
      }
    } catch {}

    if (!embedUrl) {
      embedUrl = type === 'tv'
        ? `https://123movienow.cc/tv/${id}/1/1`
        : `https://123movienow.cc/movie/${id}`;
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title || 'Watch Now'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
    iframe { width: 100%; height: 100%; border: none; display: block; }
  </style>
</head>
<body>
  <iframe src="${embedUrl}"
    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
    allowfullscreen
    referrerpolicy="no-referrer-when-downgrade">
  </iframe>
</body>
</html>`);
  });

  app.get('/stream/embed', async (req: any, res: any) => {
    const title = req.query.title as string;
    const year  = req.query.year  as string;
    const type  = req.query.type  as string;
    if (!title) return res.status(400).json({ error: 'Missing title' });
    try {
      const t = type === 'tv' ? 'series' : 'movie';
      const omdbUrl = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&y=${year||''}&type=${t}&apikey=trilogy`;
      const omdbRes = await fetch(omdbUrl, { signal: AbortSignal.timeout(10000) });
      const omdb = await omdbRes.json();
      if (omdb.Response === 'True' && omdb.imdbID) {
        const imdbId = omdb.imdbID;
        const embedUrl = t === 'series'
          ? `https://multiembed.mov/?video_id=${imdbId}&tmdb=0&s=1&e=1`
          : `https://vidlink.pro/movie/${imdbId}`;
        const source = t === 'series' ? 'multiembed.mov' : 'vidlink.pro';
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.json({ result: { embedUrl, imdbId, source } });
      }
      return res.status(404).json({ error: 'IMDB ID not found' });
    } catch (err: any) {
      return res.status(502).json({ error: err.message });
    }
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
