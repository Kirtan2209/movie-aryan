import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MovieProvider, useMovies } from './context/MovieContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { SeriesPage } from './pages/SeriesPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CinematicPlayer } from './components/player/CinematicPlayer';
import { MovieDetailsModal } from './components/movie/MovieDetailsModal';
import { VlcPlayerModal } from './components/movie/VlcPlayerModal';
import { CursorGlow } from './components/common/CursorGlow';

const MainContent = () => {
  const { activeTab } = useMovies();

  return (
    <div className="relative min-h-screen bg-[#060709] text-slate-100 flex flex-col justify-between selection:bg-[#E5A93C]/30 selection:text-[#E5A93C] overflow-hidden">
      {/* Luxury Cinematic Cursor Glow */}
      <CursorGlow />

      {/* Sticky Top Navbar */}
      <Navbar />

      {/* Dynamic Tab Page with Smooth Transition */}
      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'home' && <HomePage />}
            {activeTab === 'movies' && <MoviesPage />}
            {activeTab === 'series' && <SeriesPage />}
            {activeTab === 'watchlist' && <WatchlistPage />}
            {activeTab === 'admin' && <AdminDashboardPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Modals and Custom Player */}
      <CinematicPlayer />
      <MovieDetailsModal />
      <VlcPlayerModal />

      {/* Mobile Floating Bottom Dock */}
      <MobileNav />

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <MovieProvider>
      <ToastProvider>
        <MainContent />
      </ToastProvider>
    </MovieProvider>
  );
}
