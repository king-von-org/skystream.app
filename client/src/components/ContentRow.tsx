import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ContentCard, { SkeletonCard } from "./ContentCard";
import { type ContentItem } from "@/lib/api";

interface ContentRowProps {
  title: string;
  items: ContentItem[];
  isLoading?: boolean;
  viewAllHref?: string;
  cardSize?: 'sm' | 'md' | 'lg';
  emoji?: string;
}

export default function ContentRow({ title, items, isLoading = false, viewAllHref, cardSize = 'md', emoji }: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [hovered, setHovered] = useState(false);

  function sync() {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setCanLeft(scrollLeft > 0);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 10);
  }

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    return () => el.removeEventListener('scroll', sync);
  }, [items]);

  function scroll(dir: 'left' | 'right') {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: dir === 'left' ? -rowRef.current.clientWidth * 0.8 : rowRef.current.clientWidth * 0.8, behavior: 'smooth' });
  }

  const validItems = items.filter(i => i.id && i.poster);

  return (
    <div
      className="relative mb-8 md:mb-12"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 md:mb-4 px-4 md:px-8 lg:px-12">
        <h2 className="text-base md:text-lg lg:text-xl font-bold text-white tracking-wide">
          {emoji && <span className="mr-1.5">{emoji}</span>}{title}
        </h2>
        {viewAllHref && (
          <a href={viewAllHref} className="text-xs md:text-sm text-primary hover:text-blue-300 font-medium transition-colors flex items-center gap-1">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Left arrow */}
      {canLeft && hovered && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-1 z-20 w-10 h-10 bg-black/60 hover:bg-black/90 border border-white/20 rounded-full flex items-center justify-center text-white transition-all"
          style={{ top: 'calc(50% + 1.5rem)', transform: 'translateY(-50%)' }}
          data-testid="scroll-left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Right arrow */}
      {canRight && hovered && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-1 z-20 w-10 h-10 bg-black/60 hover:bg-black/90 border border-white/20 rounded-full flex items-center justify-center text-white transition-all"
          style={{ top: 'calc(50% + 1.5rem)', transform: 'translateY(-50%)' }}
          data-testid="scroll-right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Cards */}
      <div
        ref={rowRef}
        className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide px-4 md:px-8 lg:px-12 pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} size={cardSize} />)
          : validItems.map((item) => (
              <ContentCard key={item.id} item={item} size={cardSize} />
            ))
        }
      </div>
    </div>
  );
}
