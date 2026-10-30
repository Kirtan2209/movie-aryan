import React from 'react';
import { Film, ShieldCheck, Disc3, Sparkles, Tv, Layers, Smartphone } from 'lucide-react';
import { useMovies } from '../../context/MovieContext';

export const Footer = () => {
  const { setActiveTab } = useMovies();

  return (
    <footer className="relative bg-[#040507] border-t border-white/[0.06] pt-16 pb-28 md:pb-16 text-slate-400 overflow-hidden">
      {/* Subtle background ambient ray */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-[#E5A93C]/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/[0.06]">
          {/* Brand Column: KIRTAN */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E5A93C] p-0.5 flex items-center justify-center text-black font-black font-cinema">
                K
              </div>
              <span className="font-cinema text-lg font-bold tracking-wider text-white">
                KIRTAN CINEMA
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curated luxury 4K streaming platform engineered for direct local video ingest and zero-latency multi-device playback. Enjoy uncompressed Dolby Atmos master tracks and IMAX Enhanced framing.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#E5A93C] font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>DCI-P3 Certified Master Cinema</span>
            </div>
          </div>

          {/* Platform Columns */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <Disc3 className="w-3.5 h-3.5 text-[#E5A93C]" />
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors">
                  Featured Showcase
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('movies')} className="hover:text-white transition-colors">
                  4K Master Blockbusters
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('series')} className="hover:text-white transition-colors">
                  IMAX Original Series
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('watchlist')} className="hover:text-white transition-colors">
                  Personal Vault (My List)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('admin')} className="hover:text-[#E5A93C] transition-colors flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#E5A93C]" /> Studio CMS
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#00F2FE]" />
              Sound & Vision
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center justify-between">
                <span>Display Resolution</span>
                <span className="text-slate-200 font-mono">3840 &times; 2160 UHD</span>
              </li>
              <li className="flex items-center justify-between">
                <span>High Dynamic Range</span>
                <span className="text-[#E5A93C] font-mono">Dolby Vision / HDR10+</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Spatial Audio</span>
                <span className="text-[#00F2FE] font-mono">Dolby Atmos 7.1.4</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Direct Upload</span>
                <span className="text-emerald-400 font-mono">Instant Cross-Device</span>
              </li>
              <li className="flex items-center justify-between">
                <span>External Link</span>
                <span className="text-slate-200 font-mono">VLC Direct Stream</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              Multi-Device Wi-Fi
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Videos uploaded from this computer immediately stream on any phone, tablet, or Smart TV connected to your local network.
            </p>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-slate-300">
              <span className="text-[#E5A93C] font-bold block mb-0.5">Network Stream Address:</span>
              <span className="font-mono text-cyan-400 text-xs">http://192.168.1.7:5174</span>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} KIRTAN CINEMA PLATFORM. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Standard</span>
            <span>Terms of Cinema</span>
            <span className="text-[#E5A93C]">System Status: 100% Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
