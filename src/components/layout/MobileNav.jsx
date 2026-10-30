import React from 'react';
import { motion } from 'framer-motion';
import { Home, Film, Tv, Bookmark, Sliders } from 'lucide-react';
import { useMovies } from '../../context/MovieContext';
import { soundFx } from '../../utils/sound';

export const MobileNav = () => {
  const { activeTab, setActiveTab, watchlist } = useMovies();

  const items = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'series', label: 'Series', icon: Tv },
    { id: 'watchlist', label: 'My List', icon: Bookmark, badge: watchlist.length },
    { id: 'admin', label: 'Studio', icon: Sliders }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden p-3 pb-5 pointer-events-none">
      <nav className="max-w-md mx-auto glass-dock rounded-2xl p-1.5 flex items-center justify-around pointer-events-auto">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(item.id);
              }}
              className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 select-none ${
                isActive ? 'text-[#E5A93C]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute inset-0 bg-[#E5A93C]/10 border border-[#E5A93C]/30 rounded-xl"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 text-[9px] font-black bg-[#E5A93C] text-black w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] font-semibold mt-1 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
