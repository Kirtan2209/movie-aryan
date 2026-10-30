import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_MOVIES } from '../data/initialMovies';
import { soundFx } from '../utils/sound';

const MovieContext = createContext(null);

const STORAGE_KEYS = {
  MOVIES: 'kirtan_cinema_movies_v2',
  WATCHLIST: 'kirtan_cinema_watchlist_v2',
  LIKED: 'kirtan_cinema_liked_v2',
  PROGRESS: 'kirtan_cinema_watch_progress_v2',
  SOUND: 'kirtan_cinema_sound_v2'
};

export const MovieProvider = ({ children }) => {
  // Movies catalog with persistent storage
  const [movies, setMovies] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOVIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading movies from storage', e);
    }
    return INITIAL_MOVIES;
  });

  // Watchlist
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
      return saved ? JSON.parse(saved) : ['m-aetheria', 'm-cyberpunk'];
    } catch {
      return ['m-aetheria', 'm-cyberpunk'];
    }
  });

  // Liked movies
  const [likedMovies, setLikedMovies] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LIKED);
      return saved ? JSON.parse(saved) : ['m-chronos'];
    } catch {
      return ['m-chronos'];
    }
  });

  // Playback Progress: { [movieId]: { currentTime: number, duration: number, percent: number, updatedAt: number } }
  const [watchProgress, setWatchProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      return saved ? JSON.parse(saved) : {
        'm-aetheria': { currentTime: 1420, duration: 9480, percent: 15, updatedAt: Date.now() - 3600000 },
        'm-chronos': { currentTime: 4560, duration: 9900, percent: 46, updatedAt: Date.now() - 86400000 }
      };
    } catch {
      return {};
    }
  });

  // Sound effects state
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Modal / Player states
  const [playingMovie, setPlayingMovie] = useState(null);
  const [detailsMovie, setDetailsMovie] = useState(null);
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [vlcModalMovie, setVlcModalMovie] = useState(null);

  // Search & Navigation state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'movies' | 'series' | 'watchlist' | 'admin'

  // Persist state updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(movies));
    } catch (e) {
      console.warn('Could not persist movies', e);
    }
  }, [movies]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
    } catch (e) {
      console.warn('Could not persist watchlist', e);
    }
  }, [watchlist]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LIKED, JSON.stringify(likedMovies));
    } catch (e) {
      console.warn('Could not persist liked movies', e);
    }
  }, [likedMovies]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(watchProgress));
    } catch (e) {
      console.warn('Could not persist watch progress', e);
    }
  }, [watchProgress]);

  useEffect(() => {
    soundFx.enabled = soundEnabled;
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND, JSON.stringify(soundEnabled));
    } catch (e) {}
  }, [soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      soundFx.enabled = next;
      if (next) soundFx.playSuccess();
      return next;
    });
  };

  // Watchlist action
  const toggleWatchlist = (movieId) => {
    soundFx.playClick();
    setWatchlist(prev => {
      const exists = prev.includes(movieId);
      if (exists) {
        return prev.filter(id => id !== movieId);
      } else {
        return [...prev, movieId];
      }
    });
  };

  const isInWatchlist = (movieId) => watchlist.includes(movieId);

  // Like action
  const toggleLike = (movieId) => {
    soundFx.playClick();
    setLikedMovies(prev => {
      if (prev.includes(movieId)) {
        return prev.filter(id => id !== movieId);
      } else {
        return [...prev, movieId];
      }
    });
  };

  const isLiked = (movieId) => likedMovies.includes(movieId);

  // Playback progress memory
  const saveProgress = (movieId, currentTime, duration) => {
    if (!movieId || !duration) return;
    const percent = Math.min(100, Math.round((currentTime / duration) * 100));
    setWatchProgress(prev => ({
      ...prev,
      [movieId]: {
        currentTime,
        duration,
        percent,
        updatedAt: Date.now()
      }
    }));
  };

  const clearProgress = (movieId) => {
    setWatchProgress(prev => {
      const next = { ...prev };
      delete next[movieId];
      return next;
    });
  };

  // Movie actions
  const playMovie = (movie) => {
    soundFx.playWhoosh();
    setPlayingMovie(movie);
  };

  const closePlayer = () => {
    setPlayingMovie(null);
  };

  const openDetails = (movie) => {
    soundFx.playClick();
    setDetailsMovie(movie);
  };

  const closeDetails = () => {
    setDetailsMovie(null);
  };

  const openVlcModal = (movie) => {
    soundFx.playClick();
    setVlcModalMovie(movie);
  };

  const closeVlcModal = () => {
    setVlcModalMovie(null);
  };

  // Admin CRUD
  const addMovie = (newMovie) => {
    const movieWithId = {
      ...newMovie,
      id: `m-${Date.now()}`,
      imdb: newMovie.imdb || 8.5,
      match: newMovie.match || 95,
      views: '1.2K',
      isFeatured: Boolean(newMovie.isFeatured),
      isTrending: Boolean(newMovie.isTrending),
      isRecentlyAdded: true,
      specs: newMovie.specs || {
        resolution: "4K UHD 2160p",
        audio: "Dolby Atmos 7.1",
        hdr: "Dolby Vision",
        aspect: "2.39:1",
        fps: "24 fps"
      },
      cast: newMovie.cast || [
        { name: "Lead Actor", role: "Protagonist", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" }
      ],
      subtitles: ["English [CC]", "Spanish", "French"]
    };
    setMovies(prev => [movieWithId, ...prev]);
    return movieWithId;
  };

  const updateMovie = (id, updatedFields) => {
    setMovies(prev => prev.map(m => m.id === id ? { ...m, ...updatedFields } : m));
    if (detailsMovie?.id === id) {
      setDetailsMovie(prev => ({ ...prev, ...updatedFields }));
    }
  };

  const deleteMovie = (id) => {
    setMovies(prev => prev.filter(m => m.id !== id));
    if (detailsMovie?.id === id) setDetailsMovie(null);
    if (playingMovie?.id === id) setPlayingMovie(null);
    clearProgress(id);
  };

  const resetToDefaults = () => {
    setMovies(INITIAL_MOVIES);
    localStorage.removeItem(STORAGE_KEYS.MOVIES);
  };

  return (
    <MovieContext.Provider
      value={{
        movies,
        watchlist,
        likedMovies,
        watchProgress,
        soundEnabled,
        toggleSound,
        toggleWatchlist,
        isInWatchlist,
        toggleLike,
        isLiked,
        saveProgress,
        clearProgress,
        playingMovie,
        playMovie,
        closePlayer,
        detailsMovie,
        openDetails,
        closeDetails,
        trailerMovie,
        setTrailerMovie,
        vlcModalMovie,
        openVlcModal,
        closeVlcModal,
        searchQuery,
        setSearchQuery,
        selectedGenre,
        setSelectedGenre,
        activeTab,
        setActiveTab,
        addMovie,
        updateMovie,
        deleteMovie,
        resetToDefaults
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovies must be used within MovieProvider');
  }
  return context;
};
