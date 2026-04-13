import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, ShoppingCart, ChevronDown, X } from "lucide-react";

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold text-foreground">NFT</span>
            <span className="text-[10px] font-semibold bg-muted text-muted-foreground px-1.5 py-0.5 rounded">BETA</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => { setDiscoverOpen(!discoverOpen); setLearnOpen(false); }}
                className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
              >
                Discover <ChevronDown className="w-4 h-4" />
              </button>
              {discoverOpen && (
                <div className="absolute top-full mt-2 left-0 bg-card rounded-xl shadow-lg border border-border p-4 min-w-[200px] animate-in fade-in-0 zoom-in-95">
                  <Link to="/" className="block px-3 py-2 text-sm hover:bg-muted rounded-lg" onClick={() => setDiscoverOpen(false)}>Collections</Link>
                  <Link to="/" className="block px-3 py-2 text-sm hover:bg-muted rounded-lg" onClick={() => setDiscoverOpen(false)}>Profiles</Link>
                  <Link to="/" className="block px-3 py-2 text-sm hover:bg-muted rounded-lg" onClick={() => setDiscoverOpen(false)}>NFTs</Link>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => { setLearnOpen(!learnOpen); setDiscoverOpen(false); }}
                className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
              >
                Learn <ChevronDown className="w-4 h-4" />
              </button>
              {learnOpen && (
                <div className="absolute top-full mt-2 left-0 bg-card rounded-xl shadow-lg border border-border p-4 min-w-[200px] animate-in fade-in-0 zoom-in-95">
                  <Link to="/" className="block px-3 py-2 text-sm hover:bg-muted rounded-lg" onClick={() => setLearnOpen(false)}>Blog</Link>
                  <Link to="/" className="block px-3 py-2 text-sm hover:bg-muted rounded-lg" onClick={() => setLearnOpen(false)}>Docs</Link>
                  <Link to="/" className="block px-3 py-2 text-sm hover:bg-muted rounded-lg" onClick={() => setLearnOpen(false)}>What is an NFT?</Link>
                </div>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {searchOpen ? (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <input
                  type="text"
                  placeholder="Search NFTs, collections..."
                  className="h-9 w-48 sm:w-64 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
                <button onClick={() => setSearchOpen(false)}>
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-1.5 text-sm text-foreground hover:text-foreground/80 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
            )}

            <button className="h-10 px-5 rounded-full border-2 border-foreground text-sm font-semibold text-foreground hover:bg-foreground hover:text-background transition-colors flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
              </svg>
              Sign In
            </button>

            <button className="p-2 text-foreground hover:text-foreground/80 transition-colors">
              <ShoppingCart className="w-5 h-5" />
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="w-5 h-5 flex flex-col justify-center gap-1">
                <span className={`block h-0.5 w-5 bg-foreground transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block h-0.5 w-5 bg-foreground transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-5 bg-foreground transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 animate-in slide-in-from-top-2">
            <Link to="/" className="block px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg">Collections</Link>
            <Link to="/" className="block px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg">Profiles</Link>
            <Link to="/" className="block px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg">NFTs</Link>
            <Link to="/" className="block px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg">Blog</Link>
            <Link to="/" className="block px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg">Docs</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
