import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Film, Play, Trash2, Sparkles, ArrowRight } from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { MovieCard } from '../components/movie/MovieCard';
import { soundFx } from '../utils/sound';

export const WatchlistPage = () => {
  const { movies, watchlist, setActiveTab } = useMovies();

  const watchlistMovies = movies.filter((m) => watchlist.includes(m.id));

  return (
    <div className="pt-28 pb-24 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5A93C]/10 border border-[#E5A93C]/30 text-[#E5A93C] text-xs font-mono font-bold">
          <Bookmark className="w-4 h-4" />
          <span>PERSONAL VAULT</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-cinema font-bold text-white tracking-wide">
          My Cinema Watchlist
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Your bookmarked 4K UHD reference master titles saved for theater-grade streaming across any device.
        </p>
      </div>

      {/* Grid of Saved Movies */}
      {watchlistMovies.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span><strong>{watchlistMovies.length}</strong> titles bookmarked</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {watchlistMovies.map((movie, index) => (
              <div key={movie.id} className="w-full flex justify-center">
                <MovieCard movie={movie} variant="poster" index={index} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-[#0E1017] border border-white/10 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 flex items-center justify-center text-[#E5A93C] mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Your Watchlist is Empty</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            You haven&apos;t added any 4K master titles to your watchlist yet. Explore our curated film library and click the &ldquo;+&rdquo; icon on any title to save it here.
          </p>
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('movies');
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#E5A93C] to-amber-500 text-black font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-[#E5A93C]/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <span>Explore 4K Library</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
