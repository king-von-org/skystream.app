import { Link } from "wouter";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <div className="relative mb-8">
          <div className="text-[120px] md:text-[160px] font-black text-white/5 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black gradient-text mb-1">404</div>
              <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Page Not Found</div>
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">Oops! Lost in space</h1>
        <p className="text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back to watching something great.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/"
            data-testid="404-home-btn"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-blue-600 transition-all hover:scale-105 shadow-lg shadow-primary/30"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/search"
            data-testid="404-search-btn"
            className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/15 hover:bg-white/20 transition-all"
          >
            <Search className="w-4 h-4" />
            Search
          </Link>
        </div>
      </div>
    </div>
  );
}
