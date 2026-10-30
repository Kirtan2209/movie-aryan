import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Film, Disc3, ShieldCheck, Zap, UploadCloud, Smartphone, ArrowRight } from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { HeroBanner } from '../components/movie/HeroBanner';
import { MovieRail } from '../components/movie/MovieRail';
import { MovieUploadModal } from '../components/admin/MovieUploadModal';
import { DeviceConnectModal } from '../components/common/DeviceConnectModal';
import { soundFx } from '../utils/sound';

export const HomePage = () => {
  const { movies, watchProgress, setActiveTab } = useMovies();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);

  // Continue watching movies that have saved progress
  const continueWatchingMovies = movies.filter(
    (m) => watchProgress[m.id] && watchProgress[m.id].percent > 0
  );

  const trendingMovies = movies.filter((m) => m.isTrending);
  const originalMovies = movies.filter((m) => m.isOriginal);
  const sciFiMovies = movies.filter((m) => m.genres?.includes('Sci-Fi'));
  const actionMovies = movies.filter((m) => m.genres?.includes('Action') || m.genres?.includes('Cyberpunk'));
  const imaxMovies = movies.filter((m) => m.genres?.includes('IMAX Experience') || m.specs?.resolution?.includes('4K'));

  return (
    <div className="relative min-h-screen">
      {/* Cinematic Hero Stage */}
      <HeroBanner onQuickUpload={() => setUploadModalOpen(true)} />

      {/* Main Content Rails */}
      <div className="relative z-20 space-y-4 pb-20">
        {/* Quick Multi-Device & Direct Upload Action Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#141622] via-[#0E1018] to-[#141622] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-[#E5A93C]/15 border border-[#E5A93C]/30 flex items-center justify-center text-[#E5A93C] shrink-0">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5 justify-center sm:justify-start">
                  <span>Direct Video Upload</span>
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                    Instant Play
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select any video file &mdash; it publishes automatically to the home screen and streams across your devices!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setDeviceModalOpen(true);
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/15 text-slate-200 border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Phone Stream</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setUploadModalOpen(true);
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5A93C] to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-[#E5A93C]/25 hover:scale-105 active:scale-95 transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Video</span>
              </button>
            </div>
          </div>
        </div>

        {/* Continue Watching Row */}
        {continueWatchingMovies.length > 0 && (
          <MovieRail
            title="Continue Watching"
            subtitle="Pick up right where you paused in 4K Master resolution"
            movies={continueWatchingMovies}
            variant="wide"
            badgeText="Resume"
          />
        )}

        {/* Trending Rail */}
        <MovieRail
          title="Trending Blockbusters"
          subtitle="Most streamed titles across the global network this week"
          movies={trendingMovies}
          variant="poster"
          badgeText="Hot"
        />

        {/* Kirtan Cinema Originals Spotlight Rail (Wide format) */}
        <MovieRail
          title="Kirtan Cinema Originals"
          subtitle="Exclusive master-grade productions engineered for Dolby Vision"
          movies={originalMovies}
          variant="wide"
          badgeText="Originals"
        />

        {/* IMAX Enhanced Rail */}
        <MovieRail
          title="IMAX Enhanced 4K Cinema"
          subtitle="Mastered with expanded 1.90:1 aspect ratio and DTS/Dolby Atmos sound"
          movies={imaxMovies}
          variant="poster"
          badgeText="IMAX"
        />

        {/* Sci-Fi & Cyberpunk Rail */}
        <MovieRail
          title="Sci-Fi & Cyberpunk Odysseys"
          subtitle="Mind-bending alternate realities and deep space voyages"
          movies={sciFiMovies}
          variant="poster"
          badgeText="Featured"
        />

        {/* Action & Martial Arts Rail */}
        <MovieRail
          title="High-Octane Action & Noir"
          subtitle="Unrelenting thrillers, shadow syndicates, and combat epics"
          movies={actionMovies}
          variant="wide"
          badgeText="4K UHD"
        />

        {/* Tech Excellence Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-[#12141F] via-[#0E1018] to-[#12141F] border border-white/10 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-[#E5A93C]/10 to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5A93C]/15 border border-[#E5A93C]/30 text-[#E5A93C] text-xs font-mono font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>KIRTAN CINEMA MASTER ENGINE</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-cinema font-bold text-white tracking-wide">
                Engineered for the Purist.
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Direct hardware decoding, local Wi-Fi cross-device casting, and uncompressed 4K DCI color space. Experience films and your uploaded videos with reference fidelity.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                  <span className="text-[#E5A93C] font-bold block text-sm">2160p</span>
                  <span className="text-slate-400 text-[10px]">True 4K UHD</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                  <span className="text-cyan-400 font-bold block text-sm">7.1.4</span>
                  <span className="text-slate-400 text-[10px]">Dolby Atmos</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                  <span className="text-amber-400 font-bold block text-sm">Instant</span>
                  <span className="text-slate-400 text-[10px]">Direct Upload</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                  <span className="text-emerald-400 font-bold block text-sm">Wi-Fi</span>
                  <span className="text-slate-400 text-[10px]">Phone Streaming</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <MovieUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />

      {/* Device Modal */}
      <DeviceConnectModal
        isOpen={deviceModalOpen}
        onClose={() => setDeviceModalOpen(false)}
      />
    </div>
  );
};
