// ── Types ──────────────────────────────────────────────────────────────────────
export interface ContentItem {
  id: string;
  title: string;
  type: string;           // "Movie" | "TV Series" | "Short TV" | "Anime" | …
  type_code: number;      // 1=Movie, 2=TV Series, 7=Short TV
  description: string | null;
  release_date: string;
  duration_seconds: number | null;
  duration_formatted: string | null;
  genres: string[];
  country: string;
  poster: string;
  stream_url: string;
  download_url: string;
  source: string;
}

export interface HomeSection {
  section: string;
  type: string;           // "SUBJECTS_MOVIE" | "BANNER" | "APPOINTMENT_LIST"
  items: ContentItem[];
}

export interface HomeResult {
  platforms: { name: string; uploaded_by: string }[];
  sections: HomeSection[];
}

export interface DetailResult {
  subject_id: string;
  stream_url: string;
  tv_stream_url: string;
  download_url: string;
  embed_hint: string;
  related: ContentItem[];
  source: string;
}

export interface StreamResult {
  subject_id: string;
  type: string;
  stream_url: string;
  download_url: string;
  all_providers: { name: string; url: string }[];
  note: string;
  source: string;
}

export interface ListResult {
  results: ContentItem[];
  page: number;
  has_more: boolean;
  total?: number;
}

export interface SearchResult extends ListResult {
  keyword: string;
  per_page?: number;
}

export interface FilterResult extends ListResult {
  filters?: Record<string, any>;
}

// ── Item cache (persist data across navigation) ────────────────────────────────
export function cacheItem(item: ContentItem) {
  try { sessionStorage.setItem(`item_${item.id}`, JSON.stringify(item)); } catch {}
}

export function getCachedItem(id: string): ContentItem | null {
  try {
    const raw = sessionStorage.getItem(`item_${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ── Core fetcher ───────────────────────────────────────────────────────────────
async function get<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.result as T;
}

// ── API functions ──────────────────────────────────────────────────────────────
export const getHome       = ()                         => get<HomeResult>('/stream/home');
export const getTrending   = (page = 1)                 => get<ListResult>(`/stream/trending?page=${page}`);
export const getMovies     = (page = 1)                 => get<ListResult>(`/stream/movies?page=${page}`);
export const getSeries     = (page = 1)                 => get<ListResult>(`/stream/series?page=${page}`);
export const searchContent = (query: string, page = 1) => get<SearchResult>(`/stream/search?query=${encodeURIComponent(query)}&page=${page}`);
export const getDetail     = (id: string)               => get<DetailResult>(`/stream/detail?id=${id}`);
export const getStream     = (id: string, type: 'movie' | 'tv') => get<StreamResult>(`/stream/stream?id=${id}&type=${type}`);

export function filterContent(params: Record<string, string | number>) {
  const qs = new URLSearchParams(params as any).toString();
  return get<FilterResult>(`/stream/filter?${qs}`);
}

// ── Helpers ────────────────────────────────────────────────────────────────────
export function isMovie(item: Pick<ContentItem, 'type_code' | 'type'>) {
  return item.type_code === 1 || item.type?.toLowerCase() === 'movie';
}

export function getYear(item: Pick<ContentItem, 'release_date'>) {
  return item.release_date?.slice(0, 4) || '';
}

export function getTypeLabel(item: Pick<ContentItem, 'type' | 'type_code'>) {
  if (item.type_code === 7) return 'Short';
  return item.type || 'Movie';
}
