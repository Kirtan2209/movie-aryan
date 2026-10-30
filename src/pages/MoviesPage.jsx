import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Film, Filter, SlidersHorizontal, Sparkles, Search } from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { GENRES } from '../data/initialMovies';
import { MovieCard } from '../components/movie/MovieCard';
import { soundFx } from '../utils/sound';

export const MoviesPage = () => {
  const { movies } = useMovies();
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'year' | 'match' | 'title'
  const [searchFilter, setSearchFilter] = useState('');

  const filteredMovies = movies
    .filter((m) => {
      const matchGenre = selectedGenre === 'All' || m.genres.includes(selectedGenre);
      const matchSearch =
        m.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        m.director.toLowerCase().includes(searchFilter.toLowerCase());
      return matchGenre && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.imdb - a.imdb;
      if (sortBy === 'year') return b.year - a.year;
      if (sortBy === 'match') return b.match - a.match;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  return (
    <div className="pt-28 pb-24 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5A93C]/10 border border-[#E5A93C]/30 text-[#E5A93C] text-xs font-mono font-bold">
          <Film className="w-4 h-4" />
          <span>4K MASTER ARCHIVE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-cinema font-bold text-white tracking-wide">
          The 4K UHD Master Catalog
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Browse our complete collection of reference-grade films featuring native Dolby Vision HDR and uncompressed Dolby Atmos master tracks.
        </p>
      </div>

      {/* Filter and Sort Bar */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0E1017] border border-white/10">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by title, director, or character..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E5A93C]"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#E5A93C]" />
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => {
                soundFx.playClick();
                setSortBy(e.target.value);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#12141D] border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-[#E5A93C]"
            >
              <option value="rating">Top IMDb Rating</option>
              <option value="year">Newest Release</option>
              <option value="match">Highest Match %</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Genre Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {GENRES.map((genre) => {
            const isSelected = selectedGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedGenre(genre);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#E5A93C] text-black font-bold shadow-lg shadow-[#E5A93C]/20 scale-105'
                    : 'bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-6">
        <span>Showing <strong>{filteredMovies.length}</strong> master titles</span>
        {selectedGenre !== 'All' && (
          <span>Category: <strong className="text-[#E5A93C]">{selectedGenre}</strong></span>
        )}
      </div>

      {/* Grid of Movie Cards */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredMovies.map((movie, index) => (
            <div key={movie.id} className="w-full flex justify-center">
              <MovieCard movie={movie} variant="poster" index={index} />
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-[#0E1017] border border-white/10 space-y-3">
          <Film className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Titles Found</h3>
          <p className="text-xs text-slate-400">
            No films matched your active filter criteria. Try resetting the genre or search keyword.
          </p>
          <button
            onClick={() => {
              setSelectedGenre('All');
              setSearchFilter('');
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
