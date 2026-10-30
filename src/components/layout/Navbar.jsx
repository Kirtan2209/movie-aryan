import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Film, 
  Search, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Smartphone, 
  UploadCloud, 
  User, 
  X, 
  Play, 
  Menu 
} from 'lucide-react';
import { useMovies } from '../../context/MovieContext';
import { DeviceConnectModal } from '../common/DeviceConnectModal';
import { MovieUploadModal } from '../admin/MovieUploadModal';
import { soundFx } from '../../utils/sound';

export const Navbar = () => {
  const { 
    activeTab, 
    setActiveTab, 
    watchlist, 
    soundEnabled, 
    toggleSound, 
    searchQuery, 
    setSearchQuery,
    movies,
    openDetails
  } = useMovies();

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [quickUploadOpen, setQuickUploadOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'movies', label: 'Movies' },
    { id: 'series', label: 'IMAX Series' },
    { id: 'watchlist', label: 'My List', count: watchlist.length },
    { id: 'admin', label: 'Studio CMS', isSpecial: true }
  ];

  const searchResults = searchQuery.trim()
    ? movies.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.genres?.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
          m.director?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'ios-glass-header py-3'
            : 'bg-gradient-to-b from-black/60 via-black/20 to-transparent py-4.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          {/* Brand Logo: KIRTAN */}
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('home');
            }}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#E5A93C] via-[#FFD066] to-[#A9741A] p-0.5 shadow-lg shadow-[#E5A93C]/25 transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-[#08090E] rounded-[10px] flex items-center justify-center">
                <span className="font-cinema text-lg font-black text-[#E5A93C] group-hover:scale-110 transition-transform">
                  K
                </span>
              </div>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-cinema text-lg sm:text-xl font-extrabold tracking-wider text-white">
                  KIRTAN
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5A93C] bg-[#E5A93C]/10 border border-[#E5A93C]/30 px-1.5 py-0.2 rounded">
                  4K
                </span>
              </div>
              <p className="text-[9px] tracking-[0.25em] uppercase text-slate-400 font-semibold hidden sm:block">
                Cinematic Platform
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.07] p-1.5 rounded-full border border-white/[0.15] backdrop-blur-2xl shadow-inner">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundFx.playClick();
                    setActiveTab(item.id);
                  }}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors duration-300 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white'
                      : item.isSpecial
                      ? 'text-[#E5A93C] hover:text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/[0.04] border border-white/15 rounded-full shadow-inner"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {item.isSpecial && <Sparkles className="w-3.5 h-3.5 text-[#E5A93C]" />}
                  <span className="relative z-10">{item.label}</span>
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span className="relative z-10 text-[10px] bg-[#E5A93C] text-black font-extrabold px-1.5 py-0.2 rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Quick Upload + Stream to Phone + Search + Sound */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Upload Video Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                setQuickUploadOpen(true);
              }}
              className="px-3 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#E5A93C] to-amber-500 text-black font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-md shadow-[#E5A93C]/20 hover:scale-105 active:scale-95 transition-all"
              title="Upload any video file to stream instantly"
            >
              <UploadCloud className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Video</span>
            </button>

            {/* Stream to Phone / QR Code Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                setDeviceModalOpen(true);
              }}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Stream on Phone or Smart TV via Wi-Fi"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden lg:inline">Phone Stream</span>
            </button>

            {/* Quick Search */}
            <button
              onClick={() => {
                soundFx.playClick();
                setSearchOpen(!searchOpen);
              }}
              className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center gap-2 ${
                searchOpen
                  ? 'bg-[#E5A93C]/10 border-[#E5A93C]/40 text-[#E5A93C]'
                  : 'bg-white/[0.05] border-white/10 text-slate-300 hover:text-white hover:border-white/20'
              }`}
              aria-label="Search movies"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2.5 rounded-xl border transition-all duration-300 ${
                soundEnabled
                  ? 'bg-white/[0.05] border-white/10 text-[#E5A93C] hover:border-[#E5A93C]/40'
                  : 'bg-white/[0.02] border-white/5 text-slate-500 hover:text-slate-300'
              }`}
              title={soundEnabled ? 'Interface Sound Active' : 'Sound Muted'}
              aria-label="Toggle Sound"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* User Profile / VIP Pass */}
            <div className="relative">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setProfileOpen(!profileOpen);
                }}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-white/[0.05] border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#E5A93C] to-amber-600 flex items-center justify-center text-black font-extrabold text-xs shadow-sm">
                  KC
                </div>
                <div className="hidden sm:block text-left text-[11px] leading-tight">
                  <span className="font-semibold text-slate-200 block">Kirtan VIP</span>
                  <span className="text-[#E5A93C] font-mono text-[9px]">DOLBY 4K</span>
                </div>
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0D0F17]/95 border border-white/10 p-4 shadow-2xl backdrop-blur-2xl z-50 text-xs"
                  >
                    <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E5A93C] to-amber-600 flex items-center justify-center text-black font-extrabold text-sm">
                        KC
                      </div>
                      <div>
                        <p className="font-semibold text-white">Kirtan Cinema Master</p>
                        <p className="text-[11px] text-[#E5A93C]">Active: 4K Dolby Pass</p>
                      </div>
                    </div>

                    <div className="py-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-slate-400 py-1">
                        <span>Max Resolution</span>
                        <span className="text-white font-mono font-semibold">2160p DCI</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 py-1">
                        <span>Audio Engine</span>
                        <span className="text-[#00F2FE] font-mono font-semibold">Dolby Atmos</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 py-1">
                        <span>Items in Watchlist</span>
                        <span className="text-white font-semibold">{watchlist.length} titles</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex flex-col gap-1.5">
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setDeviceModalOpen(true);
                          setProfileOpen(false);
                        }}
                        className="w-full text-left py-2 px-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition-colors flex items-center justify-between"
                      >
                        <span>Stream to Mobile / TV</span>
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setActiveTab('admin');
                          setProfileOpen(false);
                        }}
                        className="w-full text-left py-2 px-2.5 rounded-lg bg-white/[0.05] hover:bg-[#E5A93C]/15 hover:text-[#E5A93C] text-slate-200 transition-colors flex items-center justify-between"
                      >
                        <span>Open Studio CMS</span>
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Expandable Live Search */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-white/10 bg-[#0A0B10]/95 backdrop-blur-2xl px-4 sm:px-6 py-4 mt-3"
            >
              <div className="max-w-4xl mx-auto">
                <div className="relative flex items-center">
                  <Search className="absolute left-4 w-5 h-5 text-[#E5A93C]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search titles, directors, 4K IMAX, genres..."
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#E5A93C]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {searchQuery.trim().length > 0 && (
                  <div className="mt-3 bg-[#11131C] rounded-xl border border-white/10 divide-y divide-white/5 overflow-hidden shadow-2xl">
                    {searchResults.length > 0 ? (
                      searchResults.map((movie) => (
                        <div
                          key={movie.id}
                          onClick={() => {
                            soundFx.playClick();
                            openDetails(movie);
                            setSearchOpen(false);
                          }}
                          className="p-3 hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center gap-3.5 group"
                        >
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            className="w-10 h-14 object-cover rounded-md border border-white/10 group-hover:scale-105 transition-transform"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-white group-hover:text-[#E5A93C] transition-colors truncate">
                              {movie.title}
                            </h4>
                            <p className="text-xs text-slate-400 truncate">
                              {movie.year} &bull; {movie.duration} &bull; {movie.genres?.join(', ')}
                            </p>
                          </div>
                          <Play className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-sm">
                        No titles found matching &ldquo;{searchQuery}&rdquo;.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Device Connect Modal (Phone Stream) */}
      <DeviceConnectModal
        isOpen={deviceModalOpen}
        onClose={() => setDeviceModalOpen(false)}
      />

      {/* Direct Video Upload Modal */}
      <MovieUploadModal
        isOpen={quickUploadOpen}
        onClose={() => setQuickUploadOpen(false)}
      />
    </>
  );
};
