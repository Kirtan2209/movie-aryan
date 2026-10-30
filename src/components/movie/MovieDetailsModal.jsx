import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Play, 
  Plus, 
  Check, 
  Heart, 
  Tv, 
  Volume2, 
  VolumeX, 
  Film, 
  Sparkles, 
  Clock, 
  Calendar, 
  Award, 
  Sliders 
} from 'lucide-react';
import { useMovies } from '../../context/MovieContext';
import { useToast } from '../../context/ToastContext';
import { MagneticButton } from '../common/MagneticButton';
import { Badge } from '../common/Badge';
import { MovieCard } from './MovieCard';
import { soundFx } from '../../utils/sound';

export const MovieDetailsModal = () => {
  const { 
    detailsMovie, 
    closeDetails, 
    playMovie, 
    toggleWatchlist, 
    isInWatchlist, 
    toggleLike, 
    isLiked, 
    openVlcModal, 
    movies 
  } = useMovies();
  const { addToast } = useToast();

  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [trailerMuted, setTrailerMuted] = useState(true);

  if (!detailsMovie) return null;

  const saved = isInWatchlist(detailsMovie.id);
  const liked = isLiked(detailsMovie.id);

  // Similar movies based on shared genre
  const similarMovies = movies
    .filter(
      (m) =>
        m.id !== detailsMovie.id &&
        m.genres.some((g) => detailsMovie.genres.includes(g))
    )
    .slice(0, 4);

  const handlePlay = () => {
    closeDetails();
    playMovie(detailsMovie);
  };

  const handleToggleWatchlist = () => {
    toggleWatchlist(detailsMovie.id);
    addToast({
      title: saved ? 'Removed from My List' : 'Added to My List',
      description: saved ? `"${detailsMovie.title}" removed.` : `"${detailsMovie.title}" added to your personal library.`,
      type: 'info'
    });
  };

  const handleToggleLike = () => {
    toggleLike(detailsMovie.id);
    addToast({
      title: liked ? 'Removed Like' : 'Favorited Film',
      description: liked ? `Like removed.` : `You favorited "${detailsMovie.title}".`,
      type: 'success'
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 md:p-10">
        {/* Backdrop click dismiss */}
        <div 
          onClick={closeDetails} 
          className="fixed inset-0 bg-transparent" 
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-[#0B0D13] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black overflow-hidden z-10 my-auto"
        >
          {/* Close Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              closeDetails();
            }}
            className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-[#060709]/80 border border-white/15 text-slate-300 hover:text-white hover:bg-black transition-all hover:scale-105"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hero Banner / Video Preview */}
          <div className="relative aspect-video w-full max-h-[460px] overflow-hidden bg-black">
            {isPlayingTrailer ? (
              <div className="relative w-full h-full">
                <video
                  src={detailsMovie.trailerUrl}
                  autoPlay
                  loop
                  muted={trailerMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setTrailerMuted(!trailerMuted)}
                  className="absolute bottom-4 right-4 z-20 p-2 rounded-full bg-black/70 border border-white/10 text-white hover:scale-110 transition-transform"
                >
                  {trailerMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <img
                src={detailsMovie.backdrop}
                alt={detailsMovie.title}
                className="w-full h-full object-cover"
              />
            )}

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D13] via-[#0B0D13]/40 to-transparent" />

            {/* Floating Quick Action Row */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between gap-4 z-20 flex-wrap">
              <div className="flex items-center gap-3">
                <MagneticButton
                  variant="primary"
                  size="md"
                  icon={Play}
                  onClick={handlePlay}
                >
                  Play Master 4K
                </MagneticButton>

                <button
                  onClick={() => setIsPlayingTrailer(!isPlayingTrailer)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-2"
                >
                  <Film className="w-4 h-4 text-[#E5A93C]" />
                  <span>{isPlayingTrailer ? 'Stop Trailer' : 'Preview Trailer'}</span>
                </button>

                <button
                  onClick={handleToggleWatchlist}
                  className={`p-2.5 rounded-xl border transition-all ${
                    saved
                      ? 'bg-[#E5A93C] text-black border-[#E5A93C]'
                      : 'bg-white/10 border-white/15 text-white hover:bg-white/20'
                  }`}
                  title={saved ? 'In Watchlist' : 'Add to List'}
                >
                  {saved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleToggleLike}
                  className={`p-2.5 rounded-xl border transition-all ${
                    liked
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500'
                      : 'bg-white/10 border-white/15 text-white hover:bg-white/20'
                  }`}
                  title="Like"
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-rose-400' : ''}`} />
                </button>
              </div>

              {/* External VLC Stream Option */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  openVlcModal(detailsMovie);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 text-[#E5A93C] hover:bg-[#E5A93C]/20 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Tv className="w-4 h-4" />
                <span>Open in External VLC</span>
              </button>
            </div>
          </div>

          {/* Modal Details Body */}
          <div className="p-6 sm:p-8 space-y-6 max-h-[50vh] overflow-y-auto no-scrollbar">
            {/* Header / Meta */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="gold">{detailsMovie.specs.resolution}</Badge>
                <Badge variant="cyan">{detailsMovie.specs.audio}</Badge>
                <Badge variant="glass">{detailsMovie.specs.hdr}</Badge>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {detailsMovie.match}% Match
                </span>
                <span className="text-xs text-slate-400">&bull;</span>
                <span className="text-xs text-slate-300">{detailsMovie.year}</span>
                <span className="text-xs text-slate-400">&bull;</span>
                <span className="text-xs text-slate-300">{detailsMovie.duration}</span>
                <span className="text-xs text-slate-400">&bull;</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">
                  {detailsMovie.rating}
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-cinema font-bold text-white tracking-wide">
                {detailsMovie.title}
              </h2>
              <p className="text-sm font-semibold text-[#E5A93C] mt-1 italic">
                &ldquo;{detailsMovie.tagline}&rdquo;
              </p>
            </div>

            {/* Synopsis */}
            <p className="text-sm text-slate-300 leading-relaxed">
              {detailsMovie.description}
            </p>

            {/* Technical Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Aspect Ratio</span>
                <span className="text-white font-mono font-medium">{detailsMovie.specs.aspect}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Frame Rate</span>
                <span className="text-white font-mono font-medium">{detailsMovie.specs.fps}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Audio Master</span>
                <span className="text-[#00F2FE] font-mono font-medium">{detailsMovie.specs.audio.split(' ')[0]}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Director</span>
                <span className="text-[#E5A93C] font-medium truncate block">{detailsMovie.director}</span>
              </div>
            </div>

            {/* Cast & Crew Gallery */}
            {detailsMovie.cast && detailsMovie.cast.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Starring Cast & Characters
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {detailsMovie.cast.map((actor, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                      <img
                        src={actor.avatar}
                        alt={actor.name}
                        className="w-10 h-10 rounded-lg object-cover border border-white/10"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{actor.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{actor.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Similar Movies */}
            {similarMovies.length > 0 && (
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E5A93C]" />
                  <span>More Like This</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {similarMovies.map((simMovie) => (
                    <div
                      key={simMovie.id}
                      onClick={() => {
                        soundFx.playClick();
                        closeDetails();
                        setTimeout(() => playMovie(simMovie), 100);
                      }}
                      className="group cursor-pointer rounded-xl overflow-hidden bg-[#11131C] border border-white/10 hover:border-[#E5A93C] transition-all"
                    >
                      <img
                        src={simMovie.poster}
                        alt={simMovie.title}
                        className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="p-2">
                        <p className="text-xs font-semibold text-white truncate group-hover:text-[#E5A93C]">
                          {simMovie.title}
                        </p>
                        <p className="text-[10px] text-slate-400">{simMovie.year} &bull; {simMovie.specs.resolution.split(' ')[0]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
