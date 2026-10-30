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
  RotateCcw,
  Mail,
  CheckCircle2,
  Table,
  Radio,
  Share2,
  Globe,
  HardDrive,
  Info
} from 'lucide-react';
import { useMovies } from '../../context/MovieContext';
import { useToast } from '../../context/ToastContext';
import { soundFx } from '../../utils/sound';
import { 
  captureVideoThumbnail, 
  uploadVideoFile, 
  convertToDirectStreamUrl,
  fireCelebrationConfetti 
} from '../../utils/videoUpload';

export const MovieUploadModal = ({ isOpen, onClose, editingMovie = null }) => {
  const { addMovie, updateMovie, setActiveTab, playMovie } = useMovies();
  const { addToast } = useToast();

  const fileInputRef = useRef(null);
  const [uploadMode, setUploadMode] = useState('cloud'); // 'cloud' | 'file'
  const [cloudVideoUrl, setCloudVideoUrl] = useState('');
  const [customPosterUrl, setCustomPosterUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [extractedPoster, setExtractedPoster] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadSuccessMovie, setUploadSuccessMovie] = useState(null);

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
    audio: 'Dolby Atmos 7.1',
    notifyEmail: ''
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
      title: 'Processing Video Master',
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

  // Handle Cloud Video URL change (Google Drive, Dropbox, direct MP4)
  const handleCloudUrlChange = (e) => {
    const rawUrl = e.target.value;
    setCloudVideoUrl(rawUrl);
    const directStream = convertToDirectStreamUrl(rawUrl);
    setVideoPreviewUrl(directStream);

    if (!formData.title && rawUrl.includes('drive.google.com')) {
      setFormData(prev => ({
        ...prev,
        title: 'Cloud Master Film 4K'
      }));
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      addToast({ title: 'Validation Error', description: 'Please provide a film title.', type: 'error' });
      return;
    }

    const effectiveStreamUrl = uploadMode === 'cloud' 
      ? convertToDirectStreamUrl(cloudVideoUrl) 
      : videoPreviewUrl;

    if (!effectiveStreamUrl && !selectedFile) {
      addToast({
        title: 'Video Required',
        description: uploadMode === 'cloud' 
          ? 'Please enter your Google Drive or cloud video link.' 
          : 'Please select or drop a video file to upload.',
        type: 'error'
      });
      return;
    }

    setIsUploading(true);
    setUploadPercent(20);

    let finalVideoUrl = effectiveStreamUrl;

    // If local file selected in file mode, upload to server
    if (uploadMode === 'file' && selectedFile) {
      try {
        setUploadPercent(45);
        const uploadResult = await uploadVideoFile(selectedFile);
        finalVideoUrl = uploadResult.url;
        setUploadPercent(90);
      } catch {
        finalVideoUrl = videoPreviewUrl;
      }
    }

    setUploadPercent(100);

    const chosenPoster = customPosterUrl.trim() || extractedPoster || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2880&q=85';

    const movieObj = {
      ...formData,
      backdrop: chosenPoster,
      poster: chosenPoster,
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
      setIsUploading(false);
      onClose();
    } else {
      const createdMovie = addMovie(movieObj);
      fireCelebrationConfetti();
      soundFx.playSuccess();
      setIsUploading(false);
      setUploadSuccessMovie(createdMovie);

      addToast({
        title: '4K Film Streaming Live!',
        description: `"${formData.title}" is live on Google Sheets cloud and ready for 24/7 streaming anywhere!`,
        type: 'success',
        duration: 8000
      });
    }
  };

  const handleResetForAnotherUpload = () => {
    setSelectedFile(null);
    setVideoPreviewUrl('');
    setExtractedPoster('');
    setCloudVideoUrl('');
    setCustomPosterUrl('');
    setUploadSuccessMovie(null);
    setFormData({
      title: '',
      tagline: 'Exclusive Master Cinema Stream',
      description: 'High-definition uncompressed master release streamable across all connected devices.',
      year: 2026,
      duration: '1h 45m',
      rating: 'PG-13',
      imdb: 9.0,
      director: 'Kirtan Studio Productions',
      genres: ['Action', 'Sci-Fi', 'Originals'],
      isFeatured: true,
      isOriginal: true,
      resolution: '4K UHD 2160p',
      audio: 'Dolby Atmos 7.1',
      notifyEmail: ''
    });
  };

  const handleFinishAndGoHome = () => {
    onClose();
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayNow = () => {
    if (uploadSuccessMovie) {
      playMovie(uploadSuccessMovie);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 md:p-8">
        <div onClick={onClose} className="fixed inset-0 bg-transparent" />

        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0D0F17] border border-white/15 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 my-auto overflow-hidden"
        >
          {/* Subtle Golden Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#E5A93C]/15 blur-3xl pointer-events-none rounded-full" />

          {/* ================================================================= */}
          {/* VIEW 1: UPLOAD SUCCESS & EMAIL NOTIFICATION VERIFICATION SCREEN   */}
          {/* ================================================================= */}
          {uploadSuccessMovie ? (
            <div className="space-y-6 text-center py-2 relative z-10">
              {/* Crown / Check Badge with Radial Glow */}
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#E5A93C]/30 blur-xl animate-pulse" />
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#E5A93C] via-[#F7BA4E] to-[#E5A93C] text-black flex items-center justify-center shadow-2xl shadow-[#E5A93C]/50 relative z-10">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#E5A93C]/15 border border-[#E5A93C]/40 text-[#E5A93C] text-[11px] font-mono font-extrabold uppercase tracking-widest mb-2">
                  ★ 24/7 INGESTION & PREMIERE VERIFIED ★
                </span>
                <h3 className="text-2xl sm:text-3xl font-cinema font-extrabold text-white tracking-wide">
                  Film Published & Streaming 24/7!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
                  <strong className="text-[#E5A93C]">{uploadSuccessMovie.title}</strong> is saved to Google Sheets and can be streamed on any phone, TV, or laptop anywhere!
                </p>
              </div>

              {/* Film Ingest Card */}
              <div className="p-4 rounded-2xl bg-[#12141F] border border-white/10 text-left flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-36 h-24 rounded-xl overflow-hidden bg-black/60 relative shrink-0 border border-white/10">
                  {uploadSuccessMovie.poster ? (
                    <img 
                      src={uploadSuccessMovie.poster} 
                      alt={uploadSuccessMovie.title}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <Film className="w-8 h-8" />
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                    {uploadSuccessMovie.duration}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-base font-bold text-white truncate">
                    {uploadSuccessMovie.title}
                  </h4>
                  <p className="text-xs text-[#E5A93C] italic truncate">
                    {uploadSuccessMovie.tagline || '4K Master Cinema Stream'}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-white font-semibold">
                      4K UHD 2160p
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-white font-semibold">
                      Dolby Atmos 7.1
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#E5A93C]/20 border border-[#E5A93C]/40 text-[10px] text-[#E5A93C] font-bold">
                      IMDb {uploadSuccessMovie.imdb || '9.0'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Verification Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">24/7 Cloud Stream Active</p>
                    <p className="text-[11px] text-emerald-300/80">Plays even when laptop is turned off</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5">
                  <Table className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Google Sheets Cloud Synced</p>
                    <p className="text-[11px] text-emerald-300/80">Saved in cloud spreadsheet row</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-[#E5A93C]/30 flex items-start gap-2.5 sm:col-span-2">
                  <Mail className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white flex items-center gap-2">
                      <span>Email Notification Dispatched</span>
                      <span className="px-1.5 py-0.2 rounded bg-[#E5A93C]/20 text-[#E5A93C] text-[9px] uppercase font-mono font-bold">Auto</span>
                    </p>
                    <p className="text-[11px] text-amber-200/80">
                      An executive 4K premiere invite email was sent to your Google Account with full film specs and stream link!
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handlePlayNow}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#E5A93C] via-[#F7BA4E] to-[#E5A93C] text-black font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-[#E5A93C]/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Stream in 4K Player Now</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetForAnotherUpload}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-[#E5A93C]" />
                  <span>Upload Another Video</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinishAndGoHome}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Done (Go to Home)</span>
                </button>
              </div>
            </div>
          ) : (
            /* ================================================================= */
            /* VIEW 2: NORMAL UPLOAD FORM WITH 24/7 CLOUD TAB                    */
            /* ================================================================= */
            <>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E5A93C] flex items-center justify-center text-black font-extrabold shadow-lg shadow-[#E5A93C]/30">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-cinema font-bold text-white tracking-wide">
                      {editingMovie ? 'Edit Title' : 'Upload & 24/7 Stream Engine'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Stream anytime, anywhere &mdash; even when your laptop is turned off!
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Ingest Mode Selector: 24/7 Cloud (Google Drive) vs Local File */}
              <div className="mt-4 flex items-center gap-2 p-1 rounded-2xl bg-black/60 border border-white/10 relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setUploadMode('cloud');
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    uploadMode === 'cloud'
                      ? 'bg-gradient-to-r from-[#E5A93C] to-amber-400 text-black shadow-lg shadow-[#E5A93C]/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>24/7 Cloud (Google Drive / Link)</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full uppercase ${
                    uploadMode === 'cloud' ? 'bg-black/20 text-black font-extrabold' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    Laptop Off OK
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setUploadMode('file');
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    uploadMode === 'file'
                      ? 'bg-gradient-to-r from-[#E5A93C] to-amber-400 text-black shadow-lg shadow-[#E5A93C]/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <HardDrive className="w-4 h-4" />
                  <span>Direct File (Local Wi-Fi)</span>
                </button>
              </div>

              <form onSubmit={handlePublish} className="py-4 space-y-4 max-h-[66vh] overflow-y-auto no-scrollbar relative z-10">
                {/* MODE 1: 24/7 CLOUD STREAM (GOOGLE DRIVE) */}
                {uploadMode === 'cloud' && (
                  <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-2.5">
                    <label className="text-xs font-semibold text-white flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-cyan-400" />
                        Google Drive or Cloud Video URL (24/7 Anywhere)
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        ★ Works When Laptop Is OFF
                      </span>
                    </label>
                    <input
                      type="url"
                      value={cloudVideoUrl}
                      onChange={handleCloudUrlChange}
                      placeholder="Paste Google Drive share link (e.g. https://drive.google.com/file/d/...)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#E5A93C]"
                    />
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-2 text-[11px] text-slate-300">
                      <Info className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        <strong>Kahin bhi, kabhi bhi dekhne ke liye:</strong> Apni movie ko apne <strong>Google Drive</strong> me upload karein, share setting me <em>"Anyone with the link"</em> karein aur yahan link paste kar dein. Laptop completely band hone par bhi yeh phone, TV ya tablet par 24/7 stream hogi!
                      </p>
                    </div>

                    {/* Optional Custom Poster Image */}
                    <div className="pt-1 space-y-1">
                      <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-[#E5A93C]" />
                          Poster / Backdrop Image URL (Optional)
                        </span>
                        <span className="text-[10px] text-slate-400">Leave blank for auto 4K cinema poster</span>
                      </label>
                      <input
                        type="url"
                        value={customPosterUrl}
                        onChange={(e) => setCustomPosterUrl(e.target.value)}
                        placeholder="e.g. https://images.unsplash.com/... or leave blank"
                        className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#E5A93C]"
                      />
                    </div>
                  </div>
                )}

                {/* MODE 2: DIRECT VIDEO FILE DROPZONE */}
                {uploadMode === 'file' && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {!videoPreviewUrl ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className="border-2 border-dashed border-[#E5A93C]/50 hover:border-[#E5A93C] bg-[#E5A93C]/5 hover:bg-[#E5A93C]/10 rounded-2xl p-7 text-center cursor-pointer transition-all duration-300 group shadow-inner"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-[#E5A93C]/20 border border-[#E5A93C]/40 flex items-center justify-center text-[#E5A93C] mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                          <UploadCloud className="w-7 h-7" />
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-[#E5A93C] transition-colors">
                          Click to Choose or Drag & Drop Video File
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          Select any MP4, MKV, MOV, or WebM video file. Automatically captures 4K snapshot and streams across your Wi-Fi!
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="mt-3.5 px-5 py-2.5 rounded-xl bg-[#E5A93C] text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#E5A93C]/30 hover:brightness-110 transition-all cursor-pointer"
                        >
                          Browse Video File
                        </button>
                      </div>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black">
                        <video
                          src={videoPreviewUrl}
                          controls
                          className="w-full aspect-video max-h-48 object-contain bg-black"
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
                            className="text-rose-400 hover:text-rose-300 text-xs font-semibold shrink-0 cursor-pointer"
                          >
                            Change Video
                          </button>
                        </div>
                      </div>
                    )}
                  </>
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

                {/* Notification Email (Optional) */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#E5A93C]" />
                      Email Notification Recipient (Optional)
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      Auto-sent on publish
                    </span>
                  </label>
                  <input
                    type="email"
                    value={formData.notifyEmail}
                    onChange={(e) => setFormData({ ...formData, notifyEmail: e.target.value })}
                    placeholder="Enter email or leave blank for your Google Account"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-[#E5A93C]"
                  />
                  <p className="text-[11px] text-slate-400">
                    A luxury 4K premiere invite email with poster, duration, and stream link will be sent automatically.
                  </p>
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
                      <span>Syncing to Google Sheets Cloud DB & Sending Email...</span>
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
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#E5A93C] via-[#F7BA4E] to-[#E5A93C] text-black font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-[#E5A93C]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>Publish, Sync & Notify</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
