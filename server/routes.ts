import type { Express } from "express";
import { createServer, type Server } from "http";

const API = 'https://beratechapi-production.up.railway.app';

async function proxy(path: string, res: any) {
  try {
    const response = await fetch(`${API}${path}`, {
      headers: { 'User-Agent': 'SkyPlus/1.0', 'Accept': 'application/json' },
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

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  const q = (req: any) => new URLSearchParams(req.query as any).toString();

  app.get('/api/movie/home',     (req, res) => proxy('/api/movie/home', res));
  app.get('/api/movie/trending', (req, res) => proxy(`/api/movie/trending?${q(req)}`, res));
  app.get('/api/movie/movies',   (req, res) => proxy(`/api/movie/movies?${q(req)}`, res));
  app.get('/api/movie/series',   (req, res) => proxy(`/api/movie/series?${q(req)}`, res));
  app.get('/api/movie/search',   (req, res) => proxy(`/api/movie/search?${q(req)}`, res));
  app.get('/api/movie/filter',   (req, res) => proxy(`/api/movie/filter?${q(req)}`, res));
  app.get('/api/movie/detail',   (req, res) => proxy(`/api/movie/detail?${q(req)}`, res));
  app.get('/api/movie/stream',   (req, res) => proxy(`/api/movie/stream?${q(req)}`, res));
  app.get('/api/movie/download', (req, res) => proxy(`/api/movie/download?${q(req)}`, res));

  return httpServer;
}
