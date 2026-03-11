import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Search as SearchIcon, X, Film } from "lucide-react";
import { searchContent, type ContentItem, cacheItem } from "@/lib/api";
import ContentCard from "@/components/ContentCard";
import { SkeletonCard } from "@/components/ContentCard";

export default function Search() {
  const [location] = useLocation();
  const initialQ = new URLSearchParams(location.split('?')[1] || '').get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);
  const [results, setResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 500);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    searchContent(debouncedQuery)
      .then(data => {
        const seen = new Set<string>();
        const unique = (data?.results ?? []).filter(i => { if (seen.has(i.id)) return false; seen.add(i.id); return true; });
        setResults(unique);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  return (
    <div className="min-h-screen bg-[#0A0F1C] pt-24 pb-16 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Search bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search movies, series, anime, drama..."
              autoFocus
              data-testid="search-input"
              className="w-full pl-12 pr-12 py-4 bg-[#1A1F2E] border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 text-base transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                data-testid="clear-search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        {searched && !loading && (
          <p className="text-gray-400 text-sm mb-6" data-testid="results-count">
            {results.length > 0
              ? `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${debouncedQuery}"`
              : `No results found for "${debouncedQuery}"`
            }
          </p>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Results grid */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-fade-in">
            {results.map(item => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && searched && results.length === 0 && (
          <div className="text-center py-24 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-[#1E2433] flex items-center justify-center mx-auto mb-5">
              <SearchIcon className="w-9 h-9 text-gray-600" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No results found</h2>
            <p className="text-gray-400 max-w-sm mx-auto">
              Try searching with a different keyword or browse by category.
            </p>
          </div>
        )}

        {/* Prompt */}
        {!query && (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-[#1E2433] flex items-center justify-center mx-auto mb-5">
              <Film className="w-9 h-9 text-gray-600" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Search SkyPlus+</h2>
            <p className="text-gray-400">Find movies, TV series, anime, K-dramas, and more</p>
          </div>
        )}
      </div>
    </div>
  );
}
