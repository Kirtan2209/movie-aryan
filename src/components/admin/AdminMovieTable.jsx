import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Edit, 
  Trash2, 
  Play, 
  Star, 
  Sparkles, 
  Filter, 
  AlertTriangle, 
  ExternalLink 
} from 'lucide-react';
import { useMovies } from '../../context/MovieContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../common/Badge';
import { soundFx } from '../../utils/sound';

export const AdminMovieTable = ({ onEditMovie }) => {
  const { movies, deleteMovie, updateMovie, playMovie, openDetails } = useMovies();
  const { addToast } = useToast();

  const [tableSearch, setTableSearch] = useState('');
  const [filterGenre, setFilterGenre] = useState('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const filteredMovies = movies.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(tableSearch.toLowerCase()) ||
      m.director.toLowerCase().includes(tableSearch.toLowerCase());
    const matchesGenre = filterGenre === 'All' || m.genres.includes(filterGenre);
    return matchesSearch && matchesGenre;
  });

  const handleDelete = (id, title) => {
    soundFx.playClick();
    deleteMovie(id);
    setDeleteConfirmId(null);
    addToast({
      title: 'Title Deleted',
      description: `"${title}" has been removed from the platform catalog.`,
      type: 'error'
    });
  };

  const handleToggleFeatured = (movie) => {
    soundFx.playClick();
    const next = !movie.isFeatured;
    updateMovie(movie.id, { isFeatured: next });
    addToast({
      title: next ? 'Featured in Hero' : 'Removed from Hero',
      description: `"${movie.title}" status updated.`,
      type: 'info'
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#0E1017] border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            placeholder="Filter catalog by title or director..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E5A93C]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['All', 'Sci-Fi', 'Action', 'IMAX Experience', 'Cyberpunk', 'Originals'].map((g) => (
            <button
              key={g}
              onClick={() => {
                soundFx.playClick();
                setFilterGenre(g);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                filterGenre === g
                  ? 'bg-[#E5A93C] text-black font-bold'
                  : 'bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl bg-[#0E1017] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/[0.03] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10 font-mono">
              <tr>
                <th className="py-3.5 px-4">Title & Artwork</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Duration / Year</th>
                <th className="py-3.5 px-4 hidden sm:table-cell">Genres</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Specs / Master</th>
                <th className="py-3.5 px-4">Hero Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMovies.length > 0 ? (
                filteredMovies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Artwork + Title */}
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-10 h-14 object-cover rounded-lg border border-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-xs group-hover:text-[#E5A93C] transition-colors">
                          {movie.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          Dir: {movie.director}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 sm:hidden">
                          <span className="text-[10px] text-[#E5A93C] font-mono">★ {movie.imdb}</span>
                          <span className="text-slate-500">&bull;</span>
                          <span className="text-[10px] text-slate-400">{movie.duration}</span>
                        </div>
                      </div>
                    </td>

                    {/* Duration / Year */}
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <div className="font-mono text-white">{movie.year}</div>
                      <div className="text-slate-400 text-[11px]">{movie.duration}</div>
                    </td>

                    {/* Genres */}
                    <td className="py-3.5 px-4 hidden sm:table-cell">
                      <div className="flex items-center gap-1 flex-wrap">
                        {movie.genres.slice(0, 2).map((g) => (
                          <span
                            key={g}
                            className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-300"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Specs */}
                    <td className="py-3.5 px-4 hidden lg:table-cell font-mono">
                      <div className="text-[#E5A93C] font-semibold">{movie.specs.resolution.split(' ')[0]}</div>
                      <div className="text-[10px] text-cyan-400">{movie.specs.audio.split(' ')[0]}</div>
                    </td>

                    {/* Hero Status */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleFeatured(movie)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                          movie.isFeatured
                            ? 'bg-[#E5A93C]/15 border border-[#E5A93C]/40 text-[#E5A93C]'
                            : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Star className={`w-3 h-3 ${movie.isFeatured ? 'fill-[#E5A93C]' : ''}`} />
                        <span>{movie.isFeatured ? 'Hero Active' : 'Off'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            soundFx.playWhoosh();
                            playMovie(movie);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-[#E5A93C] hover:text-black text-slate-200 transition-colors"
                          title="Preview Stream"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onEditMovie(movie);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-slate-200 transition-colors"
                          title="Edit Title"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(movie.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500 hover:text-white text-rose-400 transition-colors"
                          title="Delete Film"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No cinematic titles found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-[#12141D] border border-rose-500/30 rounded-2xl p-6 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Delete Master Title?</h3>
              <p className="text-xs text-slate-400 mt-1 mb-5">
                This will permanently unpublish the movie and remove all saved user progress.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const target = movies.find((m) => m.id === deleteConfirmId);
                    handleDelete(deleteConfirmId, target?.title || 'Film');
                  }}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
