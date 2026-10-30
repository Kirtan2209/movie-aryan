import React, { useState, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';
import { Play, Plus, Check, Heart, Info, Tv, Sparkles } from 'lucide-react';
import { useMovies } from '../../context/MovieContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../common/Badge';
import { soundFx } from '../../utils/sound';
import { fireCelebrationConfetti } from '../../utils/videoUpload';

export const MovieCard = ({ movie, variant = 'poster', index = 0 }) => {
  const { 
    playMovie, 
    openDetails, 
    toggleWatchlist, 
    isInWatchlist, 
    toggleLike, 
    isLiked, 
    openVlcModal,
    watchProgress 
  } = useMovies();
  const { addToast } = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const cardRef = useRef(null);

  // 3D Tilt Spring Physics
  const springOptions = { damping: 20, stiffness: 260, mass: 0.1 };
  const rotateX = useSpring(0, springOptions);
  const rotateY = useSpring(0, springOptions);
  const scale = useSpring(1, springOptions);

  const handleMouseMove = (e) => {
    if (!cardRef.current || window.matchMedia('(pointer: coarse)').matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Smooth tilt angles
    rotateX.set(((y - centerY) / centerY) * -10);
    rotateY.set(((x - centerX) / centerX) * 10);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    scale.set(1.05);
    soundFx.playHover();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  };

  const saved = isInWatchlist(movie.id);
  const liked = isLiked(movie.id);
  const progress = watchProgress[movie.id];

  const handlePlay = (e) => {
    e.stopPropagation();
    soundFx.playWhoosh();
    playMovie(movie);
  };

  const handleToggleWatchlist = (e) => {
    e.stopPropagation();
    toggleWatchlist(movie.id);
    if (!saved) fireCelebrationConfetti();
    addToast({
      title: saved ? 'Removed from My List' : 'Added to My List',
      description: saved ? `"${movie.title}" removed.` : `"${movie.title}" saved to your personal library.`,
      type: 'info'
    });
  };

  const handleToggleLike = (e) => {
    e.stopPropagation();
    toggleLike(movie.id);
    addToast({
      title: liked ? 'Removed Like' : 'Favorited Film',
      description: liked ? `Like removed from "${movie.title}".` : `Marked "${movie.title}" as favorite.`,
      type: 'success'
    });
  };

  const handleOpenVlc = (e) => {
    e.stopPropagation();
    openVlcModal(movie);
  };

  const isWide = variant === 'wide';

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: 'preserve-3d'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => openDetails(movie)}
      className={`group relative flex-shrink-0 cursor-pointer rounded-2xl overflow-hidden bg-[#0D0F16] border border-white/[0.08] transition-colors duration-300 hover:border-[#E5A93C]/60 hover:shadow-2xl hover:shadow-black/90 ${
        isWide
          ? 'w-72 sm:w-80 md:w-96 aspect-video'
          : 'w-40 sm:w-48 md:w-56 aspect-[2/3]'
      }`}
    >
      {/* Background Image with shimmer loading placeholder */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-[#12141D] animate-pulse" />
      )}

      <img
        src={isWide ? movie.backdrop : movie.poster}
        alt={movie.title}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        className="w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-108"
      />

      {/* Dynamic Specular Glass Reflection on Hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#060709] via-[#060709]/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#060709]/40 via-transparent to-transparent opacity-60" />

      {/* Top Badges */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          {movie.isOriginal && (
            <Badge variant="gold" size="xs">
              Kirtan
            </Badge>
          )}
          <Badge variant="glass" size="xs">
            {movie.specs?.resolution ? movie.specs.resolution.split(' ')[0] : '4K'}
          </Badge>
        </div>
        <div className="bg-[#060709]/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-[#E5A93C] border border-[#E5A93C]/30 shadow-sm">
          ★ {movie.imdb}
        </div>
      </div>

      {/* Center Play Button on Hover */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none z-20 ${
          isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
      >
        <button
          onClick={handlePlay}
          className="pointer-events-auto w-12 h-12 rounded-full bg-gradient-to-tr from-[#E5A93C] to-[#F7BA4E] text-black flex items-center justify-center shadow-xl shadow-[#E5A93C]/50 hover:scale-115 active:scale-90 transition-transform"
          aria-label={`Play ${movie.title}`}
        >
          <Play className="w-5 h-5 fill-black ml-0.5" />
        </button>
      </div>

      {/* Bottom Content & Meta Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-10">
        <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold text-[#00F2FE]">
          <span>{movie.match}% Match</span>
          <span className="text-slate-500">&bull;</span>
          <span className="text-slate-300">{movie.year}</span>
          <span className="text-slate-500">&bull;</span>
          <span className="text-slate-300">{movie.duration}</span>
        </div>

        <h3 className="text-sm sm:text-base font-bold text-white tracking-wide truncate group-hover:text-[#E5A93C] transition-colors">
          {movie.title}
        </h3>

        <p className="text-[11px] text-slate-400 truncate mt-0.5">
          {movie.genres ? movie.genres.slice(0, 3).join(' • ') : '4K Cinema'}
        </p>

        {/* Watch Progress bar if partially watched */}
        {progress && progress.percent > 0 && (
          <div className="mt-2.5 space-y-1">
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#E5A93C] to-amber-300 rounded-full"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="text-[9px] text-[#E5A93C] font-mono">
              Resume: {progress.percent}% watched
            </p>
          </div>
        )}

        {/* Quick Action Bar on Hover */}
        <div
          className={`mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between transition-all duration-300 ${
            isHovered ? 'opacity-100 max-h-10' : 'opacity-0 max-h-0 overflow-hidden'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleWatchlist}
              className={`p-1.5 rounded-lg border transition-all ${
                saved
                  ? 'bg-[#E5A93C] border-[#E5A93C] text-black'
                  : 'bg-white/10 border-white/15 text-slate-200 hover:text-white hover:bg-white/20'
              }`}
              title={saved ? 'Remove from My List' : 'Add to My List'}
              aria-label="Toggle Watchlist"
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleToggleLike}
              className={`p-1.5 rounded-lg border transition-all ${
                liked
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                  : 'bg-white/10 border-white/15 text-slate-200 hover:text-white hover:bg-white/20'
              }`}
              title="Like"
              aria-label="Like Movie"
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-400' : ''}`} />
            </button>

            <button
              onClick={handleOpenVlc}
              className="p-1.5 rounded-lg bg-white/10 border border-white/15 text-amber-300 hover:text-white hover:bg-white/20 transition-all text-[10px] font-mono font-bold px-2"
              title="Stream with External VLC Player"
            >
              VLC
            </button>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openDetails(movie);
            }}
            className="p-1.5 rounded-lg bg-white/10 border border-white/15 text-slate-200 hover:text-white hover:bg-white/20 transition-all"
            title="More Details"
            aria-label="Movie details"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
