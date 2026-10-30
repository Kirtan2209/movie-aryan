import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tv, Play, Sparkles, Layers, Clock, Star } from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { Badge } from '../components/common/Badge';
import { soundFx } from '../utils/sound';

export const SeriesPage = () => {
  const { movies, playMovie, openDetails } = useMovies();

  // Curated series items with episodes
  const seriesList = [
    {
      id: 'ser-aetheria',
      title: 'AETHERIA: CHRONICLES OF SAGITTARIUS',
      season: 'Season 1 (2025)',
      episodesCount: 8,
      rating: 'TV-MA',
      imdb: 9.4,
      backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2880&q=85',
      synopsis: 'An epic eight-chapter deep space saga following the final remnants of humanity as they navigate the enigmatic gravitational anomalies surrounding the galactic core.',
      episodes: [
        { ep: 'E01', title: 'The Event Horizon Inversion', duration: '58m', thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80', desc: 'Commander Cross and the crew encounter an inexplicable temporal dilation near Sagittarius A*.' },
        { ep: 'E02', title: 'Biomechanics of the Abyss', duration: '54m', thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80', desc: 'An expedition into the megastructure reveals an ancient non-biological intelligence.' },
        { ep: 'E03', title: 'The Neural Beacon', duration: '62m', thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80', desc: 'Echoes of long-extinct planetary civilizations begin transmitting directly into crew synthetics.' }
      ]
    },
    {
      id: 'ser-neo-noir',
      title: 'SECTOR 09: NEURAL WIRE',
      season: 'Limited Mini-Series',
      episodesCount: 6,
      rating: '18+',
      imdb: 9.1,
      backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=2880&q=85',
      synopsis: 'In a rain-drowned cyberpunk megalopolis, black-market neural runners trade prohibited memories while evading corporate death squads.',
      episodes: [
        { ep: 'E01', title: 'Ghost in the Carbon', duration: '52m', thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80', desc: 'Bounty hunter Ren accepts an unencrypted drive that holds an impossible signature.' },
        { ep: 'E02', title: 'Acid Rain Protocol', duration: '49m', thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80', desc: 'A blackout across Sector 09 leaves survivors at the mercy of rogue military cyborgs.' }
      ]
    }
  ];

  const [activeSeries, setActiveSeries] = useState(seriesList[0]);

  const handlePlayEpisode = (ep) => {
    soundFx.playWhoosh();
    const movieEquivalent = movies[0];
    playMovie({
      ...movieEquivalent,
      title: `${activeSeries.title} - ${ep.ep}: ${ep.title}`,
      tagline: ep.desc
    });
  };

  return (
    <div className="pt-28 pb-24 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
          <Tv className="w-4 h-4" />
          <span>IMAX EPISODIC PREMIERES</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-cinema font-bold text-white tracking-wide">
          Original IMAX Series
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Multi-part serialized master productions with uninterrupted 4K HDR streams and custom spatial soundscapes.
        </p>
      </div>

      {/* Featured Series Hero Showcase */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0E1017]">
        <div className="relative aspect-video max-h-[460px] w-full overflow-hidden">
          <img
            src={activeSeries.backdrop}
            alt={activeSeries.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E1017] via-[#0E1017]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0E1017] via-[#0E1017]/70 to-transparent w-full md:w-2/3" />

          {/* Series Meta Info */}
          <div className="absolute bottom-6 left-6 right-6 z-10 max-w-2xl space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="gold">4K UHD</Badge>
              <Badge variant="cyan">Dolby Atmos</Badge>
              <span className="text-xs font-mono text-[#E5A93C] font-bold">★ {activeSeries.imdb}</span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-300">{activeSeries.season}</span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-300">{activeSeries.episodesCount} Episodes</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-cinema font-bold text-white">
              {activeSeries.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
              {activeSeries.synopsis}
            </p>

            <button
              onClick={() => handlePlayEpisode(activeSeries.episodes[0])}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#E5A93C] to-amber-500 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#E5A93C]/30 hover:brightness-110 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Watch Episode 1 ({activeSeries.episodes[0].duration})</span>
            </button>
          </div>
        </div>

        {/* Series Switcher Tabs */}
        <div className="flex items-center gap-3 p-4 border-t border-white/10 bg-black/40 overflow-x-auto no-scrollbar">
          {seriesList.map((ser) => (
            <button
              key={ser.id}
              onClick={() => {
                soundFx.playClick();
                setActiveSeries(ser);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                activeSeries.id === ser.id
                  ? 'bg-white/15 text-white border border-[#E5A93C]/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {ser.title}
            </button>
          ))}
        </div>
      </div>

      {/* Episodes Rail */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#E5A93C]" />
          <span>Episodes in {activeSeries.season}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeSeries.episodes.map((ep, idx) => (
            <div
              key={idx}
              onClick={() => handlePlayEpisode(ep)}
              className="group cursor-pointer rounded-2xl overflow-hidden bg-[#11131C] border border-white/10 hover:border-[#E5A93C]/60 hover:shadow-xl transition-all"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                <img
                  src={ep.thumbnail}
                  alt={ep.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-[#E5A93C] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-lg">
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-white">
                  {ep.duration}
                </span>
                <span className="absolute top-2 left-2 bg-[#E5A93C] text-black px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                  {ep.ep}
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="text-sm font-bold text-white group-hover:text-[#E5A93C] transition-colors truncate">
                  {ep.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {ep.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
