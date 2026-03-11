import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Film, Tv, Grid3X3, ChevronDown, SlidersHorizontal } from "lucide-react";
import { getMovies, getSeries, getTrending, filterContent, type ContentItem } from "@/lib/api";
import ContentCard from "@/components/ContentCard";
import { SkeletonCard } from "@/components/ContentCard";

type TabType = 'trending' | 'movies' | 'series';

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Crime', 'Drama',
  'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi',
  'Thriller', 'Animation', 'Anime', 'Documentary',
];

const TABS: { label: string; value: TabType; icon: any }[] = [
  { label: 'Trending', value: 'trending', icon: Grid3X3 },
  { label: 'Movies', value: 'movies', icon: Film },
  { label: 'Series', value: 'series', icon: Tv },
];

export default function Category() {
  const [tab, setTab] = useState<TabType>('trending');
  const [genre, setGenre] = useState('');
  const [page, setPage] = useState(1);

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['/api/movie/trending', page],
    queryFn: () => getTrending(page),
    enabled: tab === 'trending' && !genre,
    staleTime: 3 * 60 * 1000,
  });

  const { data: moviesData, isLoading: moviesLoading } = useQuery({
    queryKey: ['/api/movie/movies', page],
    queryFn: () => getMovies(page),
    enabled: tab === 'movies' && !genre,
    staleTime: 3 * 60 * 1000,
  });

  const { data: seriesData, isLoading: seriesLoading } = useQuery({
    queryKey: ['/api/movie/series', page],
    queryFn: () => getSeries(page),
    enabled: tab === 'series' && !genre,
    staleTime: 3 * 60 * 1000,
  });

  const { data: filteredData, isLoading: filterLoading } = useQuery({
    queryKey: ['/api/movie/filter', genre, tab, page],
    queryFn: () => filterContent({
      genre,
      type: tab === 'movies' ? 1 : tab === 'series' ? 2 : '',
      page,
    }),
    enabled: !!genre,
    staleTime: 3 * 60 * 1000,
  });

  const activeData = genre ? filteredData : tab === 'trending' ? trendingData : tab === 'movies' ? moviesData : seriesData;
  const isLoading = genre ? filterLoading : tab === 'trending' ? trendingLoading : tab === 'movies' ? moviesLoading : seriesLoading;
  const items: ContentItem[] = (activeData?.results ?? []).filter(i => i.poster);
  const hasMore = activeData?.has_more ?? false;

  function switchTab(t: TabType) {
    setTab(t);
    setPage(1);
  }

  function switchGenre(g: string) {
    setGenre(prev => prev === g ? '' : g);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] pt-24 pb-16 px-4 md:px-8 lg:px-12">
      <div className="max-w-[1400px] mx-auto">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => switchTab(t.value)}
              data-testid={`tab-${t.value}`}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex-shrink-0 ${
                tab === t.value
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-white/8 text-gray-300 hover:bg-white/12 hover:text-white border border-white/10'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Genre filter chips */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {GENRES.map(g => (
            <button
              key={g}
              onClick={() => switchGenre(g)}
              data-testid={`genre-${g}`}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex-shrink-0 ${
                genre === g
                  ? 'bg-primary text-white'
                  : 'bg-white/8 text-gray-400 hover:bg-white/12 hover:text-white border border-white/10'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              {genre ? `${genre} — ` : ''}{TABS.find(t => t.value === tab)?.label}
            </h1>
            {activeData?.total && (
              <p className="text-sm text-gray-500 mt-0.5">{activeData.total.toLocaleString()} titles</p>
            )}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-fade-in">
            {items.map(item => <ContentCard key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-400">
            <Film className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No results found. Try a different filter.</p>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && (items.length > 0 || page > 1) && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              data-testid="prev-page"
              className="px-5 py-2.5 bg-white/8 border border-white/10 text-white rounded-xl disabled:opacity-30 hover:bg-white/12 transition-all font-medium text-sm"
            >
              Previous
            </button>
            <span className="text-gray-400 text-sm">Page {page}</span>
            <button
              disabled={!hasMore}
              onClick={() => setPage(p => p + 1)}
              data-testid="next-page"
              className="px-5 py-2.5 bg-white/8 border border-white/10 text-white rounded-xl disabled:opacity-30 hover:bg-white/12 transition-all font-medium text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
