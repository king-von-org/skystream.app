import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Play, Plus, Check, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { type ContentItem, cacheItem, getYear, getTypeLabel } from "@/lib/api";
import { addToMyList, removeFromMyList, isInMyList } from "@/lib/mylist";

interface HeroBannerProps {
  items: ContentItem[];
  isLoading?: boolean;
}

export default function HeroBanner({ items, isLoading = false }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [inList, setInList] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [, navigate] = useLocation();

  const item = items[current];

  useEffect(() => {
    if (item) setInList(isInMyList(item.id, item.type));
  }, [item]);

  const goTo = useCallback((index: number) => {
    if (transitioning || index === current) return;
    setTransitioning(true);
    setImgLoaded(false);
    setTimeout(() => { setCurrent(index); setTransitioning(false); }, 350);
  }, [current, transitioning]);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => goTo((current + 1) % items.length), 7000);
    return () => clearInterval(t);
  }, [items.length, current, goTo]);

  function toggleList(e: React.MouseEvent) {
    e.preventDefault();
    if (!item) return;
    if (inList) {
      removeFromMyList(item.id, item.type);
      setInList(false);
    } else {
      addToMyList({
        id: item.id, title: item.title,
        posterPath: item.poster, backdropPath: undefined,
        rating: undefined, year: getYear(item),
        type: item.type, overview: item.description || undefined,
      });
      setInList(true);
    }
  }

  function handlePlay() {
    if (!item) return;
    cacheItem(item);
    navigate(`/detail/${item.id}?play=1`);
  }

  function handleInfo() {
    if (!item) return;
    cacheItem(item);
    navigate(`/detail/${item.id}`);
  }

  if (isLoading) {
    return (
      <div className="relative w-full h-[60vh] md:h-[75vh] lg:h-[85vh] skeleton-shimmer overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#0A0F1C] to-transparent" />
      </div>
    );
  }

  if (!item) return null;

  const label = getTypeLabel(item);
  const labelClass =
    item.type_code === 1 ? 'bg-blue-600/40 text-blue-200 border-blue-500/30' :
    item.type_code === 2 ? 'bg-green-600/40 text-green-200 border-green-500/30' :
    'bg-orange-600/40 text-orange-200 border-orange-500/30';

  return (
    <div className="relative w-full h-[60vh] md:h-[75vh] lg:h-[85vh] overflow-hidden bg-[#0A0F1C]">
      {/* Background image */}
      {item.poster && (
        <img
          src={item.poster}
          alt={item.title}
          onLoad={() => setImgLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ${imgLoaded && !transitioning ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A0F1C] via-[#0A0F1C]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] via-transparent to-[#0A0F1C]/30" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0A0F1C] to-transparent" />

      {/* Content */}
      <div key={current} className="absolute inset-0 flex items-end md:items-center pb-16 md:pb-0 animate-hero-reveal">
        <div className="px-4 md:px-8 lg:px-12 xl:px-16 max-w-2xl xl:max-w-3xl">
          {/* Genres */}
          {item.genres?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {item.genres.slice(0, 3).map((g) => (
                <span key={g} className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/20 border border-primary/30 text-blue-300 backdrop-blur-sm">
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight mb-3 drop-shadow-2xl">
            {item.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-4 text-sm text-gray-300 flex-wrap">
            {getYear(item) && <span className="text-gray-400">{getYear(item)}</span>}
            {item.duration_formatted && <span className="text-gray-400">{item.duration_formatted}</span>}
            {item.country && <span className="text-gray-500">{item.country}</span>}
            <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${labelClass}`}>
              {label === 'TV Series' ? 'Series' : label}
            </span>
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-sm md:text-base text-gray-300 line-clamp-2 md:line-clamp-3 mb-6 max-w-xl leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handlePlay}
              data-testid="hero-play-btn"
              className="flex items-center gap-2.5 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
            >
              <Play className="w-5 h-5 fill-black" />
              Watch Now
            </button>
            <button
              onClick={toggleList}
              data-testid="hero-list-btn"
              className="flex items-center gap-2.5 px-5 py-3 bg-white/15 text-white font-semibold rounded-lg border border-white/25 hover:bg-white/25 transition-all backdrop-blur-sm"
            >
              {inList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {inList ? 'In My List' : 'My List'}
            </button>
            <button
              onClick={handleInfo}
              data-testid="hero-info-btn"
              className="flex items-center gap-2.5 px-5 py-3 bg-white/10 text-white font-semibold rounded-lg border border-white/15 hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              <Info className="w-5 h-5" />
              More Info
            </button>
          </div>
        </div>
      </div>

      {/* Navigation dots */}
      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {items.slice(0, 8).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              data-testid={`hero-dot-${i}`}
              className={`transition-all duration-300 rounded-full ${i === current ? 'w-8 h-2 bg-primary' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`}
            />
          ))}
        </div>
      )}

      {/* Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={() => goTo((current - 1 + items.length) % items.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all z-10"
            data-testid="hero-prev"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => goTo((current + 1) % items.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all z-10"
            data-testid="hero-next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}
