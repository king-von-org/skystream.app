import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  Play, Plus, Check, Download, ChevronLeft,
  Calendar, Clock, Globe, Film, X, ExternalLink
} from "lucide-react";
import {
  getDetail, getStream, getCachedItem, cacheItem,
  type ContentItem, type DetailResult, type StreamResult,
  getYear, getTypeLabel, isMovie
} from "@/lib/api";

async function lookupItem(id: string): Promise<ContentItem> {
  const res = await fetch(`/stream/lookup?id=${id}`);
  if (!res.ok) throw new Error('not found');
  const json = await res.json();
  return json.result as ContentItem;
}
import { addToMyList, removeFromMyList, isInMyList } from "@/lib/mylist";
import ContentRow from "@/components/ContentRow";

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const [location, navigate] = useLocation();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [inList, setInList] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showProviders, setShowProviders] = useState(false);

  useEffect(() => {
    if (location.includes('play=1') || window.location.search.includes('play=1')) {
      setPlayerOpen(true);
    }
  }, [location]);

  useEffect(() => {
    if (!id) return;
    const cached = getCachedItem(id);
    if (cached) setItem(cached);
  }, [id]);

  useEffect(() => {
    if (item) setInList(isInMyList(item.id, item.type));
  }, [item]);

  const { data: detail, isLoading: detailLoading, isError: detailError } = useQuery<DetailResult>({
    queryKey: ['/stream/detail', id],
    queryFn: () => getDetail(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { data: streamData } = useQuery<StreamResult>({
    queryKey: ['/stream/stream', id],
    queryFn: () => getStream(id!, item && !isMovie(item) ? 'tv' : 'movie'),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { data: lookedUpItem } = useQuery<ContentItem>({
    queryKey: ['/stream/lookup', id],
    queryFn: () => lookupItem(id!),
    enabled: !!id && !item,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (lookedUpItem && !item) {
      setItem(lookedUpItem);
      cacheItem(lookedUpItem);
    }
  }, [lookedUpItem, item]);

  useEffect(() => {
    if (detail?.related && !item) {
      const match = detail.related.find(r => r.id === id);
      if (match) { setItem(match); cacheItem(match); }
    }
  }, [detail, item, id]);

  function toggleList() {
    if (!item) return;
    if (inList) {
      removeFromMyList(item.id, item.type);
      setInList(false);
    } else {
      addToMyList({
        id: item.id, title: item.title,
        posterPath: item.poster, year: getYear(item),
        type: item.type, overview: item.description || undefined,
      });
      setInList(true);
    }
  }

  const streamUrl = detail
    ? (item && !isMovie(item) ? detail.tv_stream_url : detail.stream_url)
    : (item?.stream_url || streamData?.stream_url);

  const downloadUrl = detail?.download_url || item?.download_url || streamData?.download_url;
  const providers = streamData?.all_providers || [];

  function handleDownload() {
    if (!downloadUrl) return;
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  }

  if (detailLoading || (!item && !detail && !detailError)) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const streamOnlyUrl = detail?.stream_url || streamData?.stream_url;

  if (!item && !streamOnlyUrl) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Film className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg mb-4">Content not found</p>
          <button onClick={() => navigate('/')} className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const label = item ? getTypeLabel(item) : '';

  return (
    <div className="min-h-screen bg-[#0A0F1C]">
      {/* ── Fullscreen Player Modal ── */}
      {playerOpen && streamUrl && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-black/80 border-b border-white/10">
            <button onClick={() => setPlayerOpen(false)} className="text-white hover:text-gray-300 flex items-center gap-2">
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
            <p className="text-white font-medium text-sm truncate max-w-xs">{item?.title}</p>
            <button onClick={() => setPlayerOpen(false)} className="text-white hover:text-gray-300 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 relative">
            <iframe
              src={streamUrl}
              className="w-full h-full border-0"
              allowFullScreen
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              referrerPolicy="no-referrer"
              title={item?.title}
            />
          </div>
        </div>
      )}

      {/* ── Hero Backdrop ── */}
      <div className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden bg-[#0A0F1C]">
        {item?.poster && (
          <img
            src={item.poster}
            alt={item.title}
            onLoad={() => setImgLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 scale-105 ${imgLoaded ? 'opacity-60' : 'opacity-0'}`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0F1C] via-[#0A0F1C]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] via-transparent to-[#0A0F1C]/40" />

        <button
          onClick={() => navigate(-1 as any)}
          className="absolute top-20 left-4 md:left-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-black/30 hover:bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm"
          data-testid="back-btn"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* ── Content ── */}
      <div className="px-4 md:px-8 lg:px-12 -mt-24 md:-mt-32 relative z-10 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 w-40 md:w-56 lg:w-64 mx-auto md:mx-0">
            {item?.poster ? (
              <img
                src={item.poster}
                alt={item?.title}
                className="w-full rounded-xl shadow-2xl shadow-black/60 border border-white/10"
              />
            ) : (
              <div className="w-full aspect-[2/3] rounded-xl bg-[#1E2433] border border-white/10 flex items-center justify-center">
                <Film className="w-12 h-12 text-gray-600" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Type + year */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {label && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/20 border border-primary/30 text-blue-300 uppercase tracking-wider">
                  {label === 'TV Series' ? 'Series' : label}
                </span>
              )}
              {item && getYear(item) && (
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <Calendar className="w-3.5 h-3.5" /> {getYear(item)}
                </span>
              )}
              {item?.duration_formatted && (
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <Clock className="w-3.5 h-3.5" /> {item.duration_formatted}
                </span>
              )}
              {item?.country && (
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <Globe className="w-3.5 h-3.5" /> {item.country}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-3 leading-tight">
              {item?.title ?? <span className="skeleton-shimmer inline-block w-64 h-9 rounded" />}
            </h1>

            {/* Genres */}
            {item?.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {item.genres.map(g => (
                  <span key={g} className="text-xs px-2.5 py-1 rounded-full bg-white/8 border border-white/12 text-gray-300">
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {item?.description && (
              <p className="text-gray-300 leading-relaxed mb-6 max-w-2xl text-sm md:text-base">
                {item.description}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <button
                onClick={() => setPlayerOpen(true)}
                disabled={!streamUrl}
                data-testid="watch-btn"
                className="flex items-center gap-2.5 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5 fill-black" />
                {detailLoading ? 'Loading...' : 'Watch Now'}
              </button>

              <button
                onClick={toggleList}
                data-testid="mylist-btn"
                className="flex items-center gap-2.5 px-5 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
              >
                {inList ? <Check className="w-5 h-5 text-green-400" /> : <Plus className="w-5 h-5" />}
                {inList ? 'In My List' : 'My List'}
              </button>

              {downloadUrl && (
                <button
                  onClick={handleDownload}
                  data-testid="download-btn"
                  className="flex items-center gap-2 px-5 py-3 bg-green-600/20 text-green-400 font-semibold rounded-xl border border-green-500/30 hover:bg-green-600/30 transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
              )}

              {providers.length > 0 && (
                <button
                  onClick={() => setShowProviders(p => !p)}
                  className="flex items-center gap-2 px-4 py-3 bg-white/10 text-white/70 font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  {showProviders ? 'Hide' : 'More'} Providers
                </button>
              )}
            </div>

            {/* Providers list */}
            {showProviders && providers.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">Available on</p>
                <div className="flex flex-col gap-2">
                  {providers.map((p, i) => (
                    <a
                      key={i}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                    >
                      <span className="text-white text-sm font-medium">{p.name}</span>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                    </a>
                  ))}
                  {downloadUrl && (
                    <button
                      onClick={handleDownload}
                      className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-green-600/10 hover:bg-green-600/20 border border-green-500/20 transition-all group"
                    >
                      <span className="text-green-400 text-sm font-medium flex items-center gap-2">
                        <Download className="w-4 h-4" /> Download Page
                      </span>
                      <ExternalLink className="w-4 h-4 text-green-400/60 group-hover:text-green-400 transition-colors" />
                    </button>
                  )}
                </div>
                {streamData?.note && (
                  <p className="text-xs text-gray-500 mt-3">{streamData.note}</p>
                )}
              </div>
            )}

            {/* Inline player (mobile) */}
            {playerOpen && streamUrl && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl mb-6 md:hidden">
                <iframe
                  src={streamUrl}
                  className="w-full h-full border-0"
                  allowFullScreen
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  referrerPolicy="no-referrer"
                  title={item?.title}
                />
              </div>
            )}

            {/* Source info */}
            {detail && (
              <p className="text-xs text-gray-600 mt-2">
                Powered by {detail.source} · Stream with any provided player
              </p>
            )}
          </div>
        </div>

        {/* Desktop inline player */}
        {playerOpen && streamUrl && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl mt-8 hidden md:block">
            <iframe
              src={streamUrl}
              className="w-full h-full border-0"
              allowFullScreen
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              referrerPolicy="no-referrer"
              title={item?.title}
            />
            <button
              onClick={() => setPlayerOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 bg-black/60 hover:bg-black/90 border border-white/20 rounded-full flex items-center justify-center text-white transition-all z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Related content */}
        {detail?.related && detail.related.filter(i => i.poster).length > 0 && (
          <div className="mt-12 pb-16">
            <ContentRow
              title="You May Also Like"
              emoji="🎯"
              items={detail.related}
            />
          </div>
        )}

        {!detail?.related && <div className="pb-16" />}
      </div>
    </div>
  );
}
