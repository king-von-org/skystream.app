import { useQuery } from "@tanstack/react-query";
import HeroBanner from "@/components/HeroBanner";
import ContentRow from "@/components/ContentRow";
import { getHome, getTrending, type ContentItem, type HomeSection } from "@/lib/api";

const SECTION_EMOJI: Record<string, string> = {
  'Popular Series': '📺',
  'Popular Movie': '🎬',
  'K-Drama': '🇰🇷',
  'C-Drama': '🇨🇳',
  'Thai-Drama': '🇹🇭',
  'Turkish Drama': '🇹🇷',
  'SA Drama': '🌍',
  'Nollywood Movie': '🎭',
  'Action Movies': '💥',
  'Horror Movies': '🎃',
  'Adventure Movies': '🌄',
  'Anime[English Dubbed]': '⚔️',
  'Upcoming Calendar': '📅',
  'Must-watch Black Shows': '✊',
};

export default function Home() {
  const { data: homeData, isLoading: homeLoading } = useQuery({
    queryKey: ['/api/movie/home'],
    queryFn: getHome,
    staleTime: 5 * 60 * 1000,
  });

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['/api/movie/trending', 1],
    queryFn: () => getTrending(1),
    staleTime: 5 * 60 * 1000,
  });

  const heroItems: ContentItem[] = (trendingData?.results ?? []).filter(i => i.poster).slice(0, 8);

  const sections: HomeSection[] = (homeData?.sections ?? []).filter(
    s => s.type === 'SUBJECTS_MOVIE' && s.items?.filter(i => i.poster).length > 0
  );

  return (
    <div className="min-h-screen bg-[#0A0F1C]">
      <HeroBanner items={heroItems} isLoading={trendingLoading} />

      <div className="mt-6">
        <ContentRow
          title="Trending Now"
          emoji="🔥"
          items={trendingData?.results ?? []}
          isLoading={trendingLoading}
          viewAllHref="/browse"
        />
      </div>

      {homeLoading
        ? Array.from({ length: 6 }).map((_, i) => (
            <ContentRow key={i} title="Loading..." items={[]} isLoading={true} />
          ))
        : sections.map((section) => {
            const cleanTitle = section.section.replace(/[🔥💓]/g, '').trim();
            return (
              <ContentRow
                key={section.section}
                title={cleanTitle}
                emoji={SECTION_EMOJI[section.section] ?? SECTION_EMOJI[cleanTitle]}
                items={section.items}
              />
            );
          })
      }
    </div>
  );
}
