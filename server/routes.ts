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
