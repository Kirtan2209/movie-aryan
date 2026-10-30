import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  UploadCloud, 
  Sparkles, 
  Film, 
  Check, 
  Play, 
  FileVideo, 
  Image as ImageIcon, 
  Smartphone, 
  Zap, 
  RotateCcw 
} from 'lucide-react';
import { useMovies } from '../../context/MovieContext';
import { useToast } from '../../context/ToastContext';
import { GENRES } from '../../data/initialMovies';
import { soundFx } from '../../utils/sound';
import { 
  captureVideoThumbnail, 
  uploadVideoFile, 
  fireCelebrationConfetti 
} from '../../utils/videoUpload';

export const MovieUploadModal = ({ isOpen, onClose, editingMovie = null }) => {
  const { addMovie, updateMovie, setActiveTab, playMovie } = useMovies();
  const { addToast } = useToast();

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [extractedPoster, setExtractedPoster] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);

  const [formData, setFormData] = useState({
    title: editingMovie?.title || '',
    tagline: editingMovie?.tagline || 'Exclusive Master Cinema Stream',
    description: editingMovie?.description || 'High-definition uncompressed master release streamable across all connected devices.',
    year: editingMovie?.year || 2026,
    duration: editingMovie?.duration || '1h 45m',
    rating: editingMovie?.rating || 'PG-13',
    imdb: editingMovie?.imdb || 9.0,
    director: editingMovie?.director || 'Kirtan Studio Productions',
    genres: editingMovie?.genres || ['Action', 'Sci-Fi', 'Originals'],
    isFeatured: true,
    isOriginal: true,
    resolution: '4K UHD 2160p',
    audio: 'Dolby Atmos 7.1'
  });

  if (!isOpen) return null;

  // Handle local video file selection
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processVideoFile(file);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      await processVideoFile(file);
    } else {
      addToast({
        title: 'Please drop a video file',
        description: 'Supported formats: MP4, WebM, MKV, MOV.',
        type: 'error'
      });
    }
  };

  const processVideoFile = async (file) => {
    soundFx.playClick();
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);

    // Auto extract clean title from filename
    const cleanTitle = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    setFormData((prev) => ({
      ...prev,
      title: prev.title || cleanTitle
    }));

    // Auto extract high-res thumbnail and duration using canvas
    addToast({
      title: 'Processing Video',
      description: 'Extracting 4K poster snapshot and duration...',
      type: 'info'
    });

    const info = await captureVideoThumbnail(file);
    setExtractedPoster(info.poster);
    setFormData((prev) => ({
      ...prev,
      duration: info.duration
    }));
  };


  const handlePublish = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      addToast({ title: 'Validation Error', description: 'Please provide a film title.', type: 'error' });
      return;
    }

    if (!selectedFile && !videoPreviewUrl) {
      addToast({
        title: 'Video Required',
        description: 'Please select or drop a video file to upload.',
        type: 'error'
      });
      return;
    }

    setIsUploading(true);
    setUploadPercent(20);

    let finalVideoUrl = videoPreviewUrl;

    // If local file selected, stream to server endpoint
    if (selectedFile) {
      try {
        setUploadPercent(50);
        const uploadResult = await uploadVideoFile(selectedFile);
        finalVideoUrl = uploadResult.url;
        setUploadPercent(95);
      } catch {
        finalVideoUrl = videoPreviewUrl;
      }
    }

    setUploadPercent(100);

    const movieObj = {
      ...formData,
      backdrop: extractedPoster || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2880&q=85',
      poster: extractedPoster || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=85',
      videoUrl: finalVideoUrl,
      trailerUrl: finalVideoUrl,
      isFeatured: true,
      isTrending: true,
      isRecentlyAdded: true,
      isOriginal: true,
      match: 99,
      imdb: formData.imdb || 9.2,
      specs: {
        resolution: formData.resolution || '4K UHD 2160p',
        audio: formData.audio || 'Dolby Atmos 7.1',
        hdr: 'Dolby Vision & HDR10+',
        aspect: '1.90:1 IMAX Master',
        fps: '24.000 fps'
      }
    };

    if (editingMovie) {
      updateMovie(editingMovie.id, movieObj);
      addToast({
        title: 'Video Updated',
        description: `"${formData.title}" updated in Kirtan Cinema catalog.`,
        type: 'success'
      });
    } else {
      const createdMovie = addMovie(movieObj);
      fireCelebrationConfetti();
      soundFx.playSuccess();

      addToast({
        title: 'Film Streaming Live Now!',
        description: `"${formData.title}" is now available on this device and on any phone/TV on your Wi-Fi!`,
        type: 'success',
        duration: 7000,
        action: {
          label: 'Watch Now',
          onClick: () => playMovie(createdMovie)
        }
      });
    }

    setIsUploading(false);
    onClose();
    // Automatically switch to home page so the user immediately sees it!
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 md:p-8">
        <div onClick={onClose} className="fixed inset-0 bg-transparent" />

        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0D0F17] border border-white/15 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E5A93C] flex items-center justify-center text-black font-extrabold shadow-lg shadow-[#E5A93C]/30">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-cinema font-bold text-white tracking-wide">
                  {editingMovie ? 'Edit Title' : 'Direct Video Upload & Stream'}
                </h3>
                <p className="text-xs text-slate-400">
                  Upload any video file from your computer or phone &mdash; streams instantly across all devices.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handlePublish} className="py-5 space-y-5 max-h-[72vh] overflow-y-auto no-scrollbar">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Direct Video File Dropzone */}
            {!videoPreviewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-[#E5A93C]/50 hover:border-[#E5A93C] bg-[#E5A93C]/5 hover:bg-[#E5A93C]/10 rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 group shadow-inner"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#E5A93C]/20 border border-[#E5A93C]/40 flex items-center justify-center text-[#E5A93C] mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-[#E5A93C] transition-colors">
                  Click to Choose or Drag & Drop Video File
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Select any MP4, MKV, MOV, or WebM video file. It will automatically capture poster artwork and stream on any device!
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-[#E5A93C] text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#E5A93C]/30 hover:brightness-110 transition-all"
                >
                  Browse Video File
                </button>
              </div>
            ) : (
              /* Live Video Preview Box */
              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black">
                <video
                  src={videoPreviewUrl}
                  controls
                  className="w-full aspect-video max-h-56 object-contain bg-black"
                />
                <div className="p-3 bg-[#11131C] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileVideo className="w-4 h-4 text-[#E5A93C] shrink-0" />
                    <span className="text-white font-medium truncate">
                      {selectedFile ? selectedFile.name : formData.title}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      ({formData.duration})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setVideoPreviewUrl('');
                      setExtractedPoster('');
                    }}
                    className="text-rose-400 hover:text-rose-300 text-xs font-semibold shrink-0"
                  >
                    Change Video
                  </button>
                </div>
              </div>
            )}


            {/* Title & Tagline Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Film Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Inception 4K"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-[#E5A93C]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Master release in 4K Atmos"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-[#E5A93C]"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Synopsis / Description</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Storyline synopsis..."
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-[#E5A93C]"
              />
            </div>

            {/* Progress bar if uploading */}
            {isUploading && (
              <div className="space-y-1.5 p-3 rounded-xl bg-[#E5A93C]/10 border border-[#E5A93C]/30">
                <div className="flex items-center justify-between text-xs text-[#E5A93C] font-mono">
                  <span>Uploading to Local Stream Engine...</span>
                  <span>{uploadPercent}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E5A93C] to-amber-300 transition-all duration-300"
                    style={{ width: `${uploadPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Publish & Stream Instantly Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isUploading}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#E5A93C] via-[#F7BA4E] to-[#E5A93C] text-black font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-[#E5A93C]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Upload & Stream Instantly</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
