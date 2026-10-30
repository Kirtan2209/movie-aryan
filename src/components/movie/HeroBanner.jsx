import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Plus, Check, Star, Sparkles, Volume2, VolumeX, ChevronRight, UploadCloud } from 'lucide-react';
import { useMovies } from '../../context/MovieContext';
import { useToast } from '../../context/ToastContext';
import { MagneticButton } from '../common/MagneticButton';
import { Badge } from '../common/Badge';
import { soundFx } from '../../utils/sound';
import { fireCelebrationConfetti } from '../../utils/videoUpload';

export const HeroBanner = ({ onQuickUpload }) => {
  const { movies, playMovie, openDetails, toggleWatchlist, isInWatchlist } = useMovies();
  const { addToast } = useToast();

  const featuredMovies = movies.filter((m) => m.isFeatured);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered || featuredMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isHovered, featuredMovies.length]);

  const activeMovie = featuredMovies[currentIndex] || movies[0];
  if (!activeMovie) return null;

  const saved = isInWatchlist(activeMovie.id);

  const handlePlay = () => {
    soundFx.playWhoosh();
    playMovie(activeMovie);
  };

  const handleDetails = () => {
    soundFx.playClick();
    openDetails(activeMovie);
  };

  const handleToggleWatchlist = () => {
    toggleWatchlist(activeMovie.id);
    if (!saved) fireCelebrationConfetti();
    addToast({
      title: saved ? 'Removed from My List' : 'Added to My List',
      description: saved ? `"${activeMovie.title}" removed.` : `"${activeMovie.title}" added to your personal library.`,
      type: 'info'
    });
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full min-h-[85vh] lg:min-h-[92vh] flex items-end pb-20 sm:pb-24 pt-32 overflow-hidden select-none"
    >
      {/* Background Backdrop Art with Crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMovie.id}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <img
            src={activeMovie.backdrop}
            alt={activeMovie.title}
            className="w-full h-full object-cover object-center lg:object-top"
          />
          <div className="absolute inset-0 film-grain pointer-events-none opacity-40" />
        </motion.div>
      </AnimatePresence>

      {/* Cinematic Vignette and Dark Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#060709] via-[#060709]/60 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#060709] via-[#060709]/75 to-transparent z-10 w-full lg:w-3/4" />
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#060709]/90 to-transparent z-10" />

      {/* Ambient Glow Aura */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#E5A93C]/10 rounded-full blur-[140px] pointer-events-none z-10 animate-pulse-glow" />

      {/* Main Content Info */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl lg:max-w-3xl space-y-5">
          {/* Badges Bar */}
          <motion.div
            key={`badges-${activeMovie.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2.5 flex-wrap"
          >
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5A93C]/15 border border-[#E5A93C]/35 text-[#E5A93C] text-xs font-bold tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>KIRTAN PREMIERE SPOTLIGHT</span>
            </div>

            <Badge variant="glass">{activeMovie.specs?.resolution || '4K UHD'}</Badge>
            <Badge variant="cyan">{activeMovie.specs?.audio || 'Dolby Atmos'}</Badge>
            <Badge variant="charcoal">IMDb {activeMovie.imdb}</Badge>
            <span className="text-xs text-emerald-400 font-semibold">{activeMovie.match}% Match</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            key={`title-${activeMovie.id}`}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-7xl font-cinema font-black tracking-tight text-white leading-[1.05]"
          >
            {activeMovie.title}
          </motion.h1>

          {/* Tagline */}
          <motion.p
            key={`tagline-${activeMovie.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base font-semibold text-[#E5A93C] tracking-wide italic"
          >
            &ldquo;{activeMovie.tagline}&rdquo;
          </motion.p>

          {/* Synopsis */}
          <motion.p
            key={`desc-${activeMovie.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xs sm:text-sm md:text-base text-slate-300 line-clamp-3 md:line-clamp-4 leading-relaxed font-normal max-w-2xl"
          >
            {activeMovie.description}
          </motion.p>

          {/* Meta Details */}
          <motion.div
            key={`meta-${activeMovie.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex items-center gap-4 text-xs text-slate-400 font-medium"
          >
            <span>Director: <strong className="text-white">{activeMovie.director || 'Kirtan Studio'}</strong></span>
            <span>&bull;</span>
            <span>Duration: <strong className="text-white">{activeMovie.duration}</strong></span>
            <span>&bull;</span>
            <span>Rating: <strong className="text-white">{activeMovie.rating}</strong></span>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            key={`actions-${activeMovie.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center gap-3.5 pt-2 flex-wrap"
          >
            <MagneticButton
              variant="primary"
              size="lg"
              icon={Play}
              onClick={handlePlay}
            >
              Play Master 4K
            </MagneticButton>

            <MagneticButton
              variant="secondary"
              size="lg"
              icon={Info}
              onClick={handleDetails}
            >
              More Details
            </MagneticButton>

            <MagneticButton
              variant="glass"
              size="lg"
              icon={saved ? Check : Plus}
              onClick={handleToggleWatchlist}
            >
              {saved ? 'In Watchlist' : 'Add to List'}
            </MagneticButton>
          </motion.div>
        </div>

        {/* Carousel Mini Switchers */}
        <div className="absolute right-4 sm:right-8 bottom-6 z-20 hidden md:flex items-center gap-3">
          {featuredMovies.map((movie, idx) => (
            <button
              key={movie.id}
              onClick={() => {
                soundFx.playClick();
                setCurrentIndex(idx);
              }}
              className={`relative rounded-xl overflow-hidden transition-all duration-300 border ${
                currentIndex === idx
                  ? 'w-24 h-14 border-[#E5A93C] shadow-lg shadow-[#E5A93C]/30 scale-105'
                  : 'w-16 h-10 border-white/20 opacity-50 hover:opacity-100 hover:scale-100'
              }`}
            >
              <img
                src={movie.backdrop}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              {currentIndex === idx && (
                <div className="absolute inset-0 bg-[#E5A93C]/20 border-2 border-[#E5A93C]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
