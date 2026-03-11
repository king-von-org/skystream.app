import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, Bell, User, Menu, X, Home, Film, Tv, Grid3X3, ListChecks, ChevronDown } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Movies", href: "/browse?tab=movies", icon: Film },
  { label: "Series", href: "/browse?tab=series", icon: Tv },
  { label: "Browse", href: "/browse", icon: Grid3X3 },
  { label: "My List", href: "/mylist", icon: ListChecks },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || mobileOpen
          ? "glass-nav border-b border-white/5"
          : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-1 group" data-testid="logo-link">
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl md:text-3xl font-black tracking-tight text-white">Sky</span>
              <span className="text-2xl md:text-3xl font-black tracking-tight gradient-text">Plus</span>
              <span className="text-2xl md:text-3xl font-black gradient-text">+</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 ml-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-testid={`nav-link-${link.label.toLowerCase().replace(" ", "-")}`}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative group ${
                  location === link.href
                    ? "text-white bg-white/10"
                    : "text-gray-300 hover:text-white hover:bg-white/8"
                }`}
              >
                {link.label}
                {location === link.href && (
                  <span className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search */}
            <Link
              href="/search"
              data-testid="nav-search"
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Notifications */}
            <button
              className="hidden md:flex p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 relative"
              data-testid="nav-notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                data-testid="nav-profile"
                className="flex items-center gap-1.5 p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown className={`w-3.5 h-3.5 hidden md:block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1A1F2E] border border-white/10 shadow-2xl py-1 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-medium text-white">Guest User</p>
                    <p className="text-xs text-gray-400">skyplus.app</p>
                  </div>
                  <Link href="/mylist" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/8 transition-colors">
                    <ListChecks className="w-4 h-4" /> My List
                  </Link>
                  <Link href="/search" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/8 transition-colors">
                    <Search className="w-4 h-4" /> Search
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-gray-300 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="nav-mobile-menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass-nav border-t border-white/5 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                data-testid={`mobile-nav-${link.label.toLowerCase().replace(" ", "-")}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  location === link.href
                    ? "text-white bg-primary/20 border border-primary/30"
                    : "text-gray-300 hover:text-white hover:bg-white/8"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
