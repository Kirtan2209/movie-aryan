import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sliders, 
  Plus, 
  Film, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  HardDrive, 
  ShieldCheck, 
  Smartphone, 
  UploadCloud, 
  CheckCircle2,
  Table
} from 'lucide-react';
import { useMovies } from '../context/MovieContext';
import { useToast } from '../context/ToastContext';
import { AdminStats } from '../components/admin/AdminStats';
import { AdminMovieTable } from '../components/admin/AdminMovieTable';
import { MovieUploadModal } from '../components/admin/MovieUploadModal';
import { DeviceConnectModal } from '../components/common/DeviceConnectModal';
import { GoogleSheetsSync } from '../components/admin/GoogleSheetsSync';
import { soundFx } from '../utils/sound';

export const AdminDashboardPage = () => {
  const { movies, resetToDefaults } = useMovies();
  const { addToast } = useToast();

  const [activeAdminTab, setActiveAdminTab] = useState('catalog');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  const handleOpenUpload = () => {
    soundFx.playClick();
    setEditingMovie(null);
    setIsUploadOpen(true);
  };

  const handleEditMovie = (movie) => {
    soundFx.playClick();
    setEditingMovie(movie);
    setIsUploadOpen(true);
  };

  const handleResetCatalog = () => {
    soundFx.playClick();
    resetToDefaults();
    addToast({
      title: 'Catalog Restored',
      description: 'Reset library to master reference state with original blockbuster films.',
      type: 'success'
    });
  };

  return (
    <div className="pt-28 pb-24 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5A93C]/15 border border-[#E5A93C]/35 text-[#E5A93C] text-xs font-mono font-bold mb-2">
            <Sliders className="w-4 h-4" />
            <span>KIRTAN CINEMA STUDIO CONTROL</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-cinema font-bold text-white tracking-wide">
            Master Studio CMS
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mt-1">
            Directly upload video files, manage streaming to mobile and TV devices on your Wi-Fi, and curate the master catalog.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              soundFx.playClick();
              setIsDeviceModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Smartphone className="w-4 h-4" />
            <span>Stream on Phone / TV</span>
          </button>

          <button
            onClick={handleResetCatalog}
            className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-2 transition-colors"
            title="Reset Catalog to Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Master Catalog</span>
          </button>

          <button
            onClick={handleOpenUpload}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5A93C] via-amber-400 to-[#E5A93C] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#E5A93C]/25 hover:scale-105 active:scale-95 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Direct Video Upload</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'catalog', label: 'Catalog & Titles', icon: Film, count: movies.length },
          { id: 'sheets', label: 'Google Sheets DB', icon: Table, isSpecial: true },
          { id: 'stats', label: 'Telemetry & Bandwidth', icon: HardDrive },
          { id: 'system', label: 'Platform Standards', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveAdminTab(tab.id);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#E5A93C]' : ''}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab: Catalog Management */}
      {activeAdminTab === 'catalog' && (
        <div className="space-y-6">
          <AdminStats />
          <div className="pt-4">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Film className="w-4 h-4 text-[#E5A93C]" />
              <span>Published Master Films ({movies.length})</span>
            </h3>
            <AdminMovieTable onEditMovie={handleEditMovie} />
          </div>
        </div>
      )}

      {/* Tab: Telemetry & Bandwidth */}
      {activeAdminTab === 'stats' && (
        <div className="space-y-6">
          <AdminStats />
          <div className="p-6 rounded-2xl bg-[#0E1017] border border-white/10 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Multi-Device Wi-Fi Broadcast Telemetry</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Local Stream IP</span>
                <span className="text-[#E5A93C] font-mono font-bold text-sm">http://192.168.1.7:5174</span>
                <span className="text-emerald-400 block text-[11px]">Wi-Fi Broadcast Active</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Instant Ingest</span>
                <span className="text-white font-mono font-bold text-sm">Direct File & Canvas Poster</span>
                <span className="text-cyan-400 block text-[11px]">Zero Links Needed</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Audio Master Engine</span>
                <span className="text-white font-mono font-bold text-sm">Dolby Atmos Object Audio</span>
                <span className="text-emerald-400 block text-[11px]">Hardware Accelerated</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: System & Platform Standards */}
      {activeAdminTab === 'system' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0E1017] border border-white/10 space-y-6 max-w-3xl">
          <div className="space-y-2">
            <h3 className="text-xl font-cinema font-bold text-white">Kirtan Cinema Master Specifications</h3>
            <p className="text-xs text-slate-400">
              Technical rules enforced across ingest pipelines to maintain reference theater quality.
            </p>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <CheckCircle2 className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">DCI 4K Native Resolution (3840 &times; 2160)</strong>
                Bitrates minimum 25 Mbps up to 100 Mbps burst for pristine motion artifacts elimination.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Direct Video Drag-and-Drop Ingest</strong>
                Upload MP4, MKV, MOV, or WebM directly without copy-pasting URLs or external links.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Universal Cross-Device Wi-Fi Broadcast</strong>
                Phone, iPad, and Smart TV connect automatically using the local Wi-Fi IP and QR code.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Google Sheets Cloud Database */}
      {activeAdminTab === 'sheets' && (
        <GoogleSheetsSync />
      )}

      {/* Upload/Edit Modal */}
      <MovieUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        editingMovie={editingMovie}
      />

      {/* Device Modal */}
      <DeviceConnectModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
      />
    </div>
  );
};
