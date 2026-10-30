import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { MovieCard } from './MovieCard';
import { soundFx } from '../../utils/sound';

export const MovieRail = ({
  title,
  subtitle,
  movies = [],
  variant = 'poster',
  badgeText,
  badgeVariant = 'gold'
}) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [movies]);

  const handleScroll = (direction) => {
    soundFx.playClick();
    if (!scrollContainerRef.current) return;
    const { clientWidth } = scrollContainerRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(checkScrollability, 350);
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="relative py-6 sm:py-8 group/rail">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{title}</span>
            </h2>
            {badgeText && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E5A93C]/10 text-[#E5A93C] border border-[#E5A93C]/30">
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Desktop Rail Scroll Controls */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              canScrollLeft
                ? 'bg-white/[0.05] border-white/10 text-white hover:bg-white/15 hover:border-[#E5A93C]/40 active:scale-95'
                : 'opacity-20 border-white/5 text-slate-600 cursor-not-allowed'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              canScrollRight
                ? 'bg-white/[0.05] border-white/10 text-white hover:bg-white/15 hover:border-[#E5A93C]/40 active:scale-95'
                : 'opacity-20 border-white/5 text-slate-600 cursor-not-allowed'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Rail Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollability}
          className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth px-4 sm:px-6 lg:px-8 py-2"
        >
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              variant={variant}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
