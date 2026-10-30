import React from 'react';
import { motion } from 'framer-motion';
import { Film, Eye, Clock, HardDrive, Wifi, Sparkles, TrendingUp } from 'lucide-react';
import { useMovies } from '../../context/MovieContext';

export const AdminStats = () => {
  const { movies } = useMovies();

  const totalTitles = movies.length;
  const featuredTitles = movies.filter((m) => m.isFeatured).length;
  const fourKTitles = movies.filter((m) => m.specs?.resolution?.includes('4K')).length;

  const stats = [
    {
      title: 'Master Catalog',
      value: `${totalTitles} Titles`,
      subtext: `${fourKTitles} in 4K UHD Master`,
      icon: Film,
      trend: '+12% this month',
      color: 'from-amber-500/20 to-amber-500/5',
      accent: 'text-[#E5A93C]',
      border: 'border-[#E5A93C]/20'
    },
    {
      title: 'Active Streams',
      value: '24,819',
      subtext: '99.98% stream health',
      icon: Eye,
      trend: '+8.4% peak load',
      color: 'from-cyan-500/20 to-cyan-500/5',
      accent: 'text-cyan-400',
      border: 'border-cyan-500/20'
    },
    {
      title: 'Stream Hours Today',
      value: '142,650 hrs',
      subtext: 'Dolby Atmos Spatial Audio',
      icon: Clock,
      trend: '+19.2% engagement',
      color: 'from-emerald-500/20 to-emerald-500/5',
      accent: 'text-emerald-400',
      border: 'border-emerald-500/20'
    },
    {
      title: 'Bandwidth Throughput',
      value: '48.2 Gbps',
      subtext: 'Edge CDN Acceleration',
      icon: Wifi,
      trend: 'Zero frame drop',
      color: 'from-purple-500/20 to-purple-500/5',
      accent: 'text-purple-400',
      border: 'border-purple-500/20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className={`p-5 rounded-2xl bg-gradient-to-br ${stat.color} bg-[#0E1017] border ${stat.border} relative overflow-hidden group hover:border-white/20 transition-all`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold text-white mt-1.5 tracking-tight font-heading">
                    {stat.value}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>
                </div>
                <div className={`p-2.5 rounded-xl bg-white/[0.06] ${stat.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {stat.trend}
                </span>
                <span className="text-slate-500 font-mono">Real-time</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Real-time Streaming Activity Chart (Clean SVG) */}
      <div className="p-6 rounded-2xl bg-[#0E1017] border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E5A93C]" />
              <span>Global 4K Bitrate & Stream Traffic</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Live telemetry monitoring across APAC, US East, and EU Central nodes
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            LIVE 60 FPS
          </span>
        </div>

        {/* SVG Chart visualization */}
        <div className="h-36 w-full relative">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 200">
            <defs>
              <linearGradient id="streamGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E5A93C" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#E5A93C" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Horizontal Grid lines */}
            <line x1="0" y1="50" x2="1000" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <line x1="0" y1="100" x2="1000" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <line x1="0" y1="150" x2="1000" y2="150" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

            {/* Filled area */}
            <path
              d="M0,170 Q120,80 250,110 T500,60 T750,90 T1000,40 L1000,200 L0,200 Z"
              fill="url(#streamGrad)"
            />
            {/* Glowing line */}
            <path
              d="M0,170 Q120,80 250,110 T500,60 T750,90 T1000,40"
              fill="none"
              stroke="#E5A93C"
              strokeWidth="3"
            />
          </svg>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>00:00 UTC</span>
          <span>04:00 UTC</span>
          <span>08:00 UTC</span>
          <span>12:00 UTC</span>
          <span>16:00 UTC</span>
          <span>CURRENT</span>
        </div>
      </div>
    </div>
  );
};
