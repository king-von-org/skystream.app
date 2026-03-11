import { useState } from "react";
import { useLocation } from "wouter";
import { Play, Plus, Check, Star, Info } from "lucide-react";
import { type ContentItem, cacheItem, getYear, getTypeLabel, isMovie } from "@/lib/api";
import { addToMyList, removeFromMyList, isInMyList } from "@/lib/mylist";

interface ContentCardProps {
  item: ContentItem;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-[130px] md:w-[150px]',
  md: 'w-[160px] md:w-[185px]',
  lg: 'w-[200px] md:w-[220px]',
};

const typeBadgeClass: Record<string, string> = {
  Movie:     'bg-blue-600/80 text-blue-100',
  'TV Series':'bg-green-600/80 text-green-100',
  'Short TV': 'bg-orange-600/80 text-orange-100',
};

export default function ContentCard({ item, size = 'md' }: ContentCardProps) {
  const [inList, setInList] = useState(() => isInMyList(item.id, item.type));
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [, navigate] = useLocation();

  function handleCardClick() {
    cacheItem(item);
    navigate(`/detail/${item.id}`);
  }

  function handlePlay(e: React.MouseEvent) {
    e.stopPropagation();
    cacheItem(item);
    navigate(`/detail/${item.id}?play=1`);
  }

  function handleInfo(e: React.MouseEvent) {
    e.stopPropagation();
    cacheItem(item);
    navigate(`/detail/${item.id}`);
  }

  function toggleList(e: React.MouseEvent) {
    e.stopPropagation();
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

  const imageUrl = !imgError && item.poster ? item.poster : '';
  const label = getTypeLabel(item);

  return (
    <div
      className={`${sizeClasses[size]} flex-shrink-0 group cursor-pointer`}
      data-testid={`card-${item.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleCardClick}
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="relative rounded-lg overflow-hidden bg-[#1E2433] transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black/60">
        {/* Poster */}
        <div className="aspect-[2/3] w-full relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#1E2433] text-gray-600 p-3">
              <Play className="w-8 h-8 opacity-30 mb-2" />
              <p className="text-xs opacity-40 text-center line-clamp-3">{item.title}</p>
            </div>
          )}

          {/* Hover gradient */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`} />

          {/* Hover actions */}
          <div className={`absolute inset-0 flex flex-col justify-end p-2.5 transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <button
                onClick={handlePlay}
                data-testid={`play-${item.id}`}
                className="w-9 h-9 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"
              >
                <Play className="w-4 h-4 fill-black" />
              </button>
              <button
                onClick={toggleList}
                data-testid={`list-${item.id}`}
                className="w-9 h-9 bg-white/20 text-white border border-white/40 rounded-full flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"
              >
                {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
              <button
                onClick={handleInfo}
                data-testid={`info-${item.id}`}
                className="w-9 h-9 bg-white/20 text-white border border-white/40 rounded-full flex items-center justify-center hover:scale-110 transition-transform ml-auto flex-shrink-0"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            {item.description && (
              <p className="text-[10px] text-gray-300 line-clamp-2 hidden md:block">{item.description}</p>
            )}
          </div>

          {/* Type badge */}
          <div className={`absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${typeBadgeClass[label] || 'bg-gray-600/80 text-gray-100'}`}>
            {label === 'TV Series' ? 'Series' : label}
          </div>

          {/* Duration badge */}
          {item.duration_formatted && (
            <div className="absolute bottom-2 right-2 text-[9px] bg-black/70 text-gray-300 px-1.5 py-0.5 rounded">
              {item.duration_formatted}
            </div>
          )}
        </div>
      </div>

      {/* Title + meta */}
      <div className="mt-2 px-0.5">
        <p className="text-sm font-medium text-white line-clamp-1 group-hover:text-blue-300 transition-colors">
          {item.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {getYear(item) && <span className="text-xs text-gray-500">{getYear(item)}</span>}
          {item.country && <span className="text-xs text-gray-600">{item.country}</span>}
          {item.genres?.[0] && <span className="text-xs text-gray-600 line-clamp-1">{item.genres[0]}</span>}
        </div>
      </div>
    </div>
  );
}

export function SkeletonCard({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={`${sizeClasses[size]} flex-shrink-0`} style={{ scrollSnapAlign: 'start' }}>
      <div className="aspect-[2/3] w-full rounded-lg skeleton-shimmer" />
      <div className="mt-2 space-y-1.5">
        <div className="h-3.5 w-3/4 rounded skeleton-shimmer" />
        <div className="h-3 w-1/2 rounded skeleton-shimmer" />
      </div>
    </div>
  );
}
