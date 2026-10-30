import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Settings,
  Tv,
  Subtitles,
  X,
  Gauge,
  Sparkles,
  ArrowLeft,
  Camera,
  Repeat,
  Sliders,
  Ratio,
  PictureInPicture,
  Check,
  ChevronRight,
  Upload,
  Sun,
  Contrast,
  Clock,
  Zap,
  Flame,
  Volume
} from 'lucide-react';
import Hls from 'hls.js';
import { useMovies } from '../../context/MovieContext';
import { useToast } from '../../context/ToastContext';
import { soundFx } from '../../utils/sound';
import { CINEMA_SUBTITLES, getActiveCue, parseSrtOrVtt } from '../../utils/subtitleParser';

export const CinematicPlayer = () => {
  const { playingMovie, closePlayer, saveProgress, watchProgress, openVlcModal } = useMovies();
  const { addToast } = useToast();

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const subtitleInputRef = useRef(null);

  // Web Audio Context for VLC 200% Volume Boost
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceNodeRef = useRef(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0); // 0.0 to 2.0 (VLC Boost up to 200%!)
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isPiP, setIsPiP] = useState(false);

  // OSD HUD Message (VLC style on-screen overlay)
  const [osdMessage, setOsdMessage] = useState(null);
  const osdTimeoutRef = useRef(null);

  // Subtitle states
  const [activeSubtitleLang, setActiveSubtitleLang] = useState('English [CC]');
  const [customCues, setCustomCues] = useState(null);
  const [subtitleDelayMs, setSubtitleDelayMs] = useState(0); // -5000 to +5000 ms
  const [subtitleSize, setSubtitleSize] = useState('text-base sm:text-xl'); // text-sm, text-base, text-xl, text-2xl
  const [subtitleColor, setSubtitleColor] = useState('#FFE866'); // Gold, White, Cyan

  // Audio Sync states
  const [audioDelayMs, setAudioDelayMs] = useState(0);

  // Video Effects / Equalizer (VLC Extended Settings)
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [ambilight, setAmbilight] = useState(true);

  // Aspect Ratio (VLC 'A' key)
  // 'fit' | '16-9' | '21-9' | '4-3' | 'fill'
  const [aspectRatio, setAspectRatio] = useState('fit');

  // A-B Loop
  const [loopA, setLoopA] = useState(null);
  const [loopB, setLoopB] = useState(null);

  // Settings Panel Tab
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('root'); // 'root' | 'subtitles' | 'effects' | 'sync' | 'aspect' | 'speed'

  // Playback speed
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeQuality, setActiveQuality] = useState('4K 2160p Master');

  // Snapshot shutter flash
  const [snapshotFlash, setSnapshotFlash] = useState(false);

  // Resume prompt state
  const [resumePrompt, setResumePrompt] = useState(null);

  const showOsd = useCallback((text) => {
    setOsdMessage(text);
    if (osdTimeoutRef.current) clearTimeout(osdTimeoutRef.current);
    osdTimeoutRef.current = setTimeout(() => {
      setOsdMessage(null);
    }, 2200);
  }, []);

  // Initialize Web Audio Gain Node for 200% Volume Boost
  const setupAudioBooster = useCallback(() => {
    if (!videoRef.current || audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const source = ctx.createMediaElementSource(videoRef.current);
      const gainNode = ctx.createGain();

      gainNode.gain.value = volume;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      audioCtxRef.current = ctx;
      gainNodeRef.current = gainNode;
      sourceNodeRef.current = source;
    } catch {
      // Audio element already routed or cross-origin restrictions
    }
  }, [volume]);

  // Handle HLS and Stream Loading
  useEffect(() => {
    if (!playingMovie || !videoRef.current) return;

    const video = videoRef.current;
    const streamUrl = playingMovie.videoUrl;

    if (streamUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
        return () => hls.destroy();
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      }
    } else {
      video.src = streamUrl;
    }

    // Check if previously watched
    const existingProgress = watchProgress[playingMovie.id];
    if (existingProgress && existingProgress.currentTime > 15 && existingProgress.currentTime < existingProgress.duration - 30) {
      setResumePrompt(existingProgress.currentTime);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [playingMovie]);

  // Controls auto-hide
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettings) {
        setShowControls(false);
      }
    }, 3200);
  }, [isPlaying, showSettings]);

  useEffect(() => {
    const handleMouseMove = () => resetHideTimer();
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [resetHideTimer]);

  // Time Update and A-B Loop checks
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(curr);
    setDuration(dur);

    // A-B Loop handler
    if (loopA !== null && loopB !== null && curr >= loopB) {
      videoRef.current.currentTime = loopA;
      return;
    }

    // Save progress periodically
    if (Math.floor(curr) % 5 === 0 && dur > 0) {
      saveProgress(playingMovie.id, curr, dur);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    soundFx.playClick();
    setupAudioBooster();
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      showOsd('Play');
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      showOsd('Pause');
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const targetTime = Math.max(0, Math.min(duration, pos * duration));
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleSkip = (seconds) => {
    if (!videoRef.current) return;
    soundFx.playClick();
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    showOsd(seconds > 0 ? `+${seconds}s` : `${seconds}s`);
  };

  // Step Frame forward (VLC 'E' key)
  const stepNextFrame = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
    videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + (1 / 24));
    showOsd('Frame Step: +1');
  };

  // VLC 200% Volume Boost Handler
  const handleVolumeChange = (newVal) => {
    const clamped = Math.max(0, Math.min(2.0, newVal));
    setVolume(clamped);
    setupAudioBooster();

    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = clamped;
    } else if (videoRef.current) {
      videoRef.current.volume = Math.min(1.0, clamped);
    }

    if (videoRef.current) {
      videoRef.current.muted = clamped === 0;
      setIsMuted(clamped === 0);
    }

    showOsd(`Volume: ${Math.round(clamped * 100)}%${clamped > 1.0 ? ' 🔥 BOOST' : ''}`);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    soundFx.playClick();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
    showOsd(nextMuted ? 'Muted' : `Volume: ${Math.round(volume * 100)}%`);
  };

  // Fullscreen
  const toggleFullscreen = () => {
    soundFx.playClick();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Picture in Picture
  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else {
        await videoRef.current.requestPictureInPicture();
        setIsPiP(true);
        showOsd('Picture-in-Picture');
      }
    } catch {}
  };

  // VLC Snapshot / Screenshot (VLC 'Shift+S' / 'S')
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    soundFx.playSuccess();
    setSnapshotFlash(true);
    setTimeout(() => setSnapshotFlash(false), 200);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext('2d');

      // Apply video filters to snapshot
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const timestamp = formatTime(video.currentTime).replace(/:/g, '-');
      const filename = `Kirtan_${playingMovie.title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.jpg`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();

      showOsd(`Snapshot Saved: ${timestamp}`);
      addToast({
        title: 'VLC Frame Snapshot Saved',
        description: `Saved full 4K frame to Downloads (${filename})`,
        type: 'success'
      });
    } catch (err) {
      showOsd('Snapshot failed (CORS)');
    }
  };

  // Load Custom User Subtitle File (.srt / .vtt)
  const handleSubtitleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      const parsed = parseSrtOrVtt(content);
      if (parsed.length > 0) {
        setCustomCues(parsed);
        setActiveSubtitleLang('Custom File (.srt)');
        soundFx.playSuccess();
        showOsd(`Loaded ${parsed.length} Subtitles`);
        addToast({
          title: 'Custom Subtitles Loaded',
          description: `Loaded ${parsed.length} timed cues from "${file.name}".`,
          type: 'success'
        });
      } else {
        addToast({ title: 'Invalid Subtitle', description: 'Could not parse SRT/VTT file.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  // Aspect Ratio Cycling (VLC 'A' key)
  const cycleAspectRatio = () => {
    soundFx.playClick();
    const modes = ['fit', '16-9', '21-9', '4-3', 'fill'];
    const names = {
      'fit': 'Fit Window (Original)',
      '16-9': '16:9 Widescreen',
      '21-9': '21:9 CinemaScope',
      '4-3': '4:3 Standard',
      'fill': 'Stretch to Screen'
    };
    const nextIdx = (modes.indexOf(aspectRatio) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setAspectRatio(nextMode);
    showOsd(`Aspect: ${names[nextMode]}`);
  };

  // A-B Looper toggle
  const toggleLoopA = () => {
    if (!videoRef.current) return;
    setLoopA(videoRef.current.currentTime);
    showOsd(`Loop A: ${formatTime(videoRef.current.currentTime)}`);
  };

  const toggleLoopB = () => {
    if (!videoRef.current) return;
    if (loopA === null) {
      setLoopA(videoRef.current.currentTime);
      showOsd(`Loop A: ${formatTime(videoRef.current.currentTime)}`);
    } else {
      setLoopB(videoRef.current.currentTime);
      showOsd(`Loop B set (${formatTime(loopA)} - ${formatTime(videoRef.current.currentTime)})`);
    }
  };

  const clearLoop = () => {
    setLoopA(null);
    setLoopB(null);
    showOsd('A-B Loop Cleared');
  };

  // Active Subtitle Cue Resolution
  const activeCuesList = customCues || CINEMA_SUBTITLES[activeSubtitleLang] || [];
  const currentCue = activeSubtitleLang !== 'Off'
    ? getActiveCue(activeCuesList, currentTime, subtitleDelayMs / 1000)
    : null;

  // Format time (hh:mm:ss)
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Complete VLC Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!playingMovie) return;
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const key = e.key.toLowerCase();

      // VLC Shortcuts
      if (key === ' ' || key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (key === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (key === 'arrowleft') {
        e.preventDefault();
        handleSkip(e.ctrlKey ? -60 : e.shiftKey ? -3 : -5);
      } else if (key === 'arrowright') {
        e.preventDefault();
        handleSkip(e.ctrlKey ? 60 : e.shiftKey ? 3 : 5);
      } else if (key === 'arrowup') {
        e.preventDefault();
        handleVolumeChange(volume + 0.05);
      } else if (key === 'arrowdown') {
        e.preventDefault();
        handleVolumeChange(volume - 0.05);
      } else if (key === 's') {
        e.preventDefault();
        takeSnapshot();
      } else if (key === 'e') {
        e.preventDefault();
        stepNextFrame();
      } else if (key === 'a') {
        e.preventDefault();
        cycleAspectRatio();
      } else if (key === 'g') {
        // Subtitle delay -50ms (VLC standard)
        e.preventDefault();
        setSubtitleDelayMs((d) => {
          const next = d - 50;
          showOsd(`Subtitle delay: ${next > 0 ? `+${next}` : next} ms`);
          return next;
        });
      } else if (key === 'h') {
        // Subtitle delay +50ms (VLC standard)
        e.preventDefault();
        setSubtitleDelayMs((d) => {
          const next = d + 50;
          showOsd(`Subtitle delay: ${next > 0 ? `+${next}` : next} ms`);
          return next;
        });
      } else if (key === 'j') {
        // Audio delay -50ms (VLC standard)
        e.preventDefault();
        setAudioDelayMs((d) => {
          const next = d - 50;
          showOsd(`Audio delay: ${next > 0 ? `+${next}` : next} ms`);
          return next;
        });
      } else if (key === ']') {
        e.preventDefault();
        setPlaybackSpeed((s) => {
          const next = Math.min(3, +(s + 0.25).toFixed(2));
          if (videoRef.current) videoRef.current.playbackRate = next;
          showOsd(`Speed: ${next}x`);
          return next;
        });
      } else if (key === '[') {
        e.preventDefault();
        setPlaybackSpeed((s) => {
          const next = Math.max(0.25, +(s - 0.25).toFixed(2));
          if (videoRef.current) videoRef.current.playbackRate = next;
          showOsd(`Speed: ${next}x`);
          return next;
        });
      } else if (key === '=' || key === '1') {
        e.preventDefault();
        setPlaybackSpeed(1);
        if (videoRef.current) videoRef.current.playbackRate = 1;
        showOsd('Speed: 1.0x (Normal)');
      } else if (key === 'escape') {
        if (!document.fullscreenElement) {
          closePlayer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playingMovie, isPlaying, isMuted, duration, volume, subtitleDelayMs, audioDelayMs, aspectRatio]);

  if (!playingMovie) return null;

  // Aspect ratio class mapping
  const aspectClasses = {
    'fit': 'object-contain w-full h-full',
    '16-9': 'object-cover aspect-video w-full h-full max-h-screen',
    '21-9': 'object-cover aspect-[2.39/1] w-full max-h-screen',
    '4-3': 'object-contain aspect-[4/3] w-full h-full',
    'fill': 'object-fill w-full h-full'
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden"
    >
      {/* Hidden Subtitle File Input */}
      <input
        ref={subtitleInputRef}
        type="file"
        accept=".srt,.vtt,.txt"
        onChange={handleSubtitleFileSelect}
        className="hidden"
      />

      {/* Snapshot Shutter Flash Effect */}
      {snapshotFlash && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none opacity-80 transition-opacity duration-150" />
      )}

      {/* Ambilight Glowing Edge Halo */}
      {ambilight && (
        <div
          className="absolute inset-0 -z-10 blur-3xl opacity-30 pointer-events-none scale-105"
          style={{
            backgroundImage: `url(${playingMovie.backdrop || playingMovie.poster})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        />
      )}

      {/* VLC On-Screen Display (OSD HUD) */}
      <AnimatePresence>
        {osdMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-8 right-8 z-40 px-4 py-2 rounded-xl bg-black/80 border border-white/20 backdrop-blur-xl text-white font-mono text-sm font-bold shadow-2xl flex items-center gap-2 pointer-events-none"
          >
            <span className="w-2 h-2 rounded-full bg-[#E5A93C] animate-pulse" />
            <span>{osdMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Element with CSS Equalizer Filters */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          onTimeUpdate={handleTimeUpdate}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onCanPlay={() => setIsBuffering(false)}
          onEnded={() => {
            setIsPlaying(false);
            saveProgress(playingMovie.id, 0, duration);
          }}
          onClick={togglePlay}
          playsInline
          style={{
            filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
          }}
          className={`${aspectClasses[aspectRatio]} cursor-pointer transition-all duration-300`}
        />
      </div>

      {/* Synchronized Subtitles Display */}
      {activeSubtitleLang !== 'Off' && currentCue && (
        <div className="absolute bottom-20 sm:bottom-24 left-0 right-0 text-center pointer-events-none px-6 z-30">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="inline-block max-w-4xl"
          >
            <span
              style={{ color: subtitleColor }}
              className={`inline-block font-sans font-semibold tracking-wide px-4 py-1.5 rounded-lg bg-black/80 backdrop-blur-md shadow-2xl border border-white/10 ${subtitleSize}`}
            >
              {currentCue.text}
            </span>
          </motion.div>
        </div>
      )}

      {/* Buffering Indicator */}
      <AnimatePresence>
        {isBuffering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 pointer-events-none z-30"
          >
            <div className="w-16 h-16 rounded-full border-4 border-[#E5A93C]/20 border-t-[#E5A93C] animate-spin" />
            <p className="mt-4 text-xs font-mono text-[#E5A93C] tracking-widest uppercase">
              Buffering Master 4K Atmos...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resume Playback Prompt */}
      <AnimatePresence>
        {resumePrompt !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-40 bg-[#0F1118]/95 border border-[#E5A93C]/40 p-6 rounded-3xl shadow-2xl backdrop-blur-2xl max-w-sm text-center"
          >
            <Sparkles className="w-8 h-8 text-[#E5A93C] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">Resume Cinema?</h4>
            <p className="text-xs text-slate-300 mt-1 mb-4">
              Stopped at <span className="text-[#E5A93C] font-mono font-bold">{formatTime(resumePrompt)}</span>.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  soundFx.playClick();
                  if (videoRef.current) {
                    videoRef.current.currentTime = resumePrompt;
                    videoRef.current.play();
                    setIsPlaying(true);
                  }
                  setResumePrompt(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#E5A93C] text-black font-bold text-xs uppercase hover:brightness-110 transition-all"
              >
                Resume ({formatTime(resumePrompt)})
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play();
                    setIsPlaying(true);
                  }
                  setResumePrompt(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                Start Over
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Overlay Controls */}
      <motion.div
        initial={false}
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className={`absolute inset-0 flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-gradient-to-t from-black/95 via-transparent to-black/85 z-30 ${
          showControls ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Top Bar: Title & VLC Extra Tools */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              soundFx.playClick();
              closePlayer();
            }}
            className="flex items-center gap-2 p-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs font-semibold">Exit Theater</span>
          </button>

          <div className="text-center max-w-md truncate px-3">
            <h2 className="text-sm sm:text-lg font-cinema font-bold text-white tracking-wide truncate">
              {playingMovie.title}
            </h2>
            <div className="flex items-center justify-center gap-2 text-[10px] text-[#E5A93C] font-mono mt-0.5">
              <span>{activeQuality}</span>
              <span>&bull;</span>
              <span>{playingMovie.specs?.audio || 'Dolby Atmos'}</span>
              {volume > 1.0 && <span className="text-rose-400 font-bold">&bull; 200% BOOST</span>}
            </div>
          </div>

          {/* Top Right VLC Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Snapshot Frame button */}
            <button
              onClick={takeSnapshot}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-[#E5A93C] hover:text-black text-slate-200 backdrop-blur-md transition-all"
              title="VLC Snapshot Frame (S)"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Aspect Ratio Button */}
            <button
              onClick={cycleAspectRatio}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-[#E5A93C] hover:text-black text-slate-200 backdrop-blur-md transition-all"
              title="Cycle Aspect Ratio (A)"
            >
              <Ratio className="w-4 h-4" />
            </button>

            {/* Picture in Picture */}
            <button
              onClick={togglePiP}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-[#E5A93C] hover:text-black text-slate-200 backdrop-blur-md transition-all hidden sm:flex"
              title="Picture-in-Picture"
            >
              <PictureInPicture className="w-4 h-4" />
            </button>

            {/* Stream to VLC */}
            <button
              onClick={() => openVlcModal(playingMovie)}
              className="p-2.5 px-3 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:bg-[#E5A93C] hover:text-black text-amber-300 backdrop-blur-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
              title="Stream in VLC App"
            >
              <Tv className="w-4 h-4" />
              <span className="hidden sm:inline">VLC</span>
            </button>

            {/* Close Player */}
            <button
              onClick={closePlayer}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-500 text-white backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Quick Play/Pause Splash Icon */}
        <div className="flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/15 hover:bg-[#E5A93C] hover:text-black text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-2xl transition-all duration-200 hover:scale-110 active:scale-90"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>
        </div>

        {/* Bottom Bar: Timeline Scrubber & Primary Controls */}
        <div className="space-y-3">
          {/* Progress Bar / Scrubber */}
          <div
            onClick={handleSeek}
            className="relative h-2.5 bg-white/20 hover:h-4 rounded-full cursor-pointer transition-all duration-200 group/scrub"
          >
            {/* Played Fill */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#E5A93C] to-amber-300 rounded-full"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            {/* A-B Loop Indicators */}
            {loopA !== null && duration > 0 && (
              <div
                className="absolute top-0 bottom-0 w-1 bg-cyan-400 z-10"
                style={{ left: `${(loopA / duration) * 100}%` }}
                title={`Loop Point A: ${formatTime(loopA)}`}
              />
            )}
            {loopB !== null && duration > 0 && (
              <div
                className="absolute top-0 bottom-0 w-1 bg-rose-400 z-10"
                style={{ left: `${(loopB / duration) * 100}%` }}
                title={`Loop Point B: ${formatTime(loopB)}`}
              />
            )}
            {/* Scrubber Knob */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md shadow-black scale-0 group-hover/scrub:scale-100 transition-transform -ml-2"
              style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-white flex-wrap gap-3">
            {/* Left Controls: Play, Rewind, Step Frame, Volume (200% VLC Boost) */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={togglePlay}
                className="hover:text-[#E5A93C] transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <button
                onClick={() => handleSkip(-5)}
                className="hover:text-[#E5A93C] transition-colors text-xs flex items-center gap-0.5"
                title="Rewind 5s (Left Arrow)"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-[10px] font-mono">5s</span>
              </button>

              <button
                onClick={() => handleSkip(5)}
                className="hover:text-[#E5A93C] transition-colors text-xs flex items-center gap-0.5"
                title="Forward 5s (Right Arrow)"
              >
                <RotateCw className="w-4 h-4" />
                <span className="text-[10px] font-mono">5s</span>
              </button>

              {/* VLC Frame Step (E) */}
              <button
                onClick={stepNextFrame}
                className="hover:text-[#E5A93C] transition-colors text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 hidden sm:inline"
                title="Step Next Frame (E)"
              >
                +1F
              </button>

              {/* VLC 200% Volume Slider */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="hover:text-[#E5A93C] transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-rose-400" />
                  ) : volume > 1.0 ? (
                    <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>

                <div className="relative flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="2.0"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20 sm:w-28 h-1.5 accent-[#E5A93C] bg-white/20 rounded-full cursor-pointer"
                  />
                </div>

                <span className={`text-[10px] font-mono font-bold ${volume > 1.0 ? 'text-[#E5A93C]' : 'text-slate-300'}`}>
                  {Math.round(volume * 100)}%
                </span>
              </div>

              {/* Timestamp Counter */}
              <div className="text-xs font-mono text-slate-300 hidden md:block">
                <span className="text-white font-semibold">{formatTime(currentTime)}</span>
                <span className="mx-1 text-slate-500">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls: Subtitles, VLC Extended Settings, Fullscreen */}
            <div className="flex items-center gap-2 sm:gap-3 relative">
              {/* Subtitles Quick Toggle */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setShowSettings(!showSettings);
                  setSettingsTab('subtitles');
                }}
                className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 ${
                  activeSubtitleLang !== 'Off'
                    ? 'border-[#E5A93C] text-[#E5A93C] bg-[#E5A93C]/15 font-bold'
                    : 'border-white/10 text-slate-300 hover:text-white'
                }`}
                title="Captions / Subtitles"
              >
                <Subtitles className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">{activeSubtitleLang.split(' ')[0]}</span>
              </button>

              {/* VLC Extended Settings Panel (Gear/Sliders) */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setShowSettings(!showSettings);
                  setSettingsTab('root');
                }}
                className={`p-2 rounded-xl border transition-colors ${
                  showSettings
                    ? 'border-[#E5A93C] text-[#E5A93C] bg-[#E5A93C]/15'
                    : 'border-white/10 text-slate-300 hover:text-white'
                }`}
                title="VLC Extended Settings & Effects"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="hover:text-[#E5A93C] transition-colors p-2"
                title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>

              {/* VLC Comprehensive Extended Settings Popover */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 bottom-14 w-80 rounded-3xl bg-[#0F1118]/98 border border-white/15 p-4 shadow-2xl backdrop-blur-2xl z-40 text-xs"
                  >
                    {/* ROOT MENU */}
                    {settingsTab === 'root' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <span className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-[#E5A93C]" />
                            VLC Extended Controls
                          </span>
                          <span className="text-[10px] font-mono text-[#E5A93C]">Master 4K</span>
                        </div>

                        {/* Subtitles & Captions */}
                        <button
                          onClick={() => setSettingsTab('subtitles')}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 text-slate-200"
                        >
                          <span className="flex items-center gap-2">
                            <Subtitles className="w-4 h-4 text-[#E5A93C]" />
                            Subtitles & Captions
                          </span>
                          <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                            {activeSubtitleLang} <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </button>

                        {/* Video Effects & Equalizer */}
                        <button
                          onClick={() => setSettingsTab('effects')}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 text-slate-200"
                        >
                          <span className="flex items-center gap-2">
                            <Sun className="w-4 h-4 text-amber-400" />
                            Video Effects / Equalizer
                          </span>
                          <span className="text-slate-400 text-[11px] flex items-center gap-1">
                            Tune <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </button>

                        {/* Audio & Subtitle Sync Adjuster */}
                        <button
                          onClick={() => setSettingsTab('sync')}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 text-slate-200"
                        >
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-400" />
                            Track Synchronization
                          </span>
                          <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                            {subtitleDelayMs === 0 ? 'Synced' : `${subtitleDelayMs}ms`} <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </button>

                        {/* Aspect Ratio Switcher */}
                        <button
                          onClick={() => setSettingsTab('aspect')}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 text-slate-200"
                        >
                          <span className="flex items-center gap-2">
                            <Ratio className="w-4 h-4 text-purple-400" />
                            Aspect Ratio
                          </span>
                          <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                            {aspectRatio.toUpperCase()} <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </button>

                        {/* Playback Speed */}
                        <button
                          onClick={() => setSettingsTab('speed')}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 text-slate-200"
                        >
                          <span className="flex items-center gap-2">
                            <Gauge className="w-4 h-4 text-emerald-400" />
                            Playback Speed
                          </span>
                          <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                            {playbackSpeed}x <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </button>

                        {/* A-B Looper Buttons */}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-1.5 text-[10px]">
                          <span className="text-slate-400 font-bold uppercase">A-B Loop:</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={toggleLoopA}
                              className={`px-2 py-1 rounded-md border font-mono ${
                                loopA !== null ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/10 text-slate-300'
                              }`}
                            >
                              [A] {loopA !== null ? formatTime(loopA) : 'Set'}
                            </button>
                            <button
                              onClick={toggleLoopB}
                              className={`px-2 py-1 rounded-md border font-mono ${
                                loopB !== null ? 'bg-rose-500/20 border-rose-400 text-rose-300' : 'bg-white/5 border-white/10 text-slate-300'
                              }`}
                            >
                              [B] {loopB !== null ? formatTime(loopB) : 'Set'}
                            </button>
                            {(loopA !== null || loopB !== null) && (
                              <button
                                onClick={clearLoop}
                                className="px-1.5 py-1 text-slate-400 hover:text-white"
                                title="Clear Loop"
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUBTITLES TAB */}
                    {settingsTab === 'subtitles' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <span className="font-bold text-white">Captions / Subtitles</span>
                          <button onClick={() => setSettingsTab('root')} className="text-slate-400 hover:text-white">
                            Back
                          </button>
                        </div>

                        {/* Language Selection */}
                        <div className="space-y-1 max-h-36 overflow-y-auto no-scrollbar">
                          {['Off', 'English [CC]', 'Hindi', 'Spanish', 'French', 'Japanese'].map((lang) => (
                            <button
                              key={lang}
                              onClick={() => {
                                soundFx.playClick();
                                setCustomCues(null);
                                setActiveSubtitleLang(lang);
                                showOsd(`Captions: ${lang}`);
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors ${
                                activeSubtitleLang === lang && !customCues
                                  ? 'bg-[#E5A93C]/15 text-[#E5A93C]'
                                  : 'hover:bg-white/10 text-slate-300'
                              }`}
                            >
                              <span>{lang}</span>
                              {activeSubtitleLang === lang && !customCues && <Check className="w-4 h-4" />}
                            </button>
                          ))}
                        </div>

                        {/* Custom SRT/VTT upload */}
                        <div className="pt-2 border-t border-white/10">
                          <button
                            onClick={() => subtitleInputRef.current?.click()}
                            className="w-full py-2 rounded-xl bg-white/10 hover:bg-[#E5A93C] hover:text-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Load Subtitle File (.srt / .vtt)</span>
                          </button>
                        </div>

                        {/* Color & Size Customizer */}
                        <div className="pt-2 border-t border-white/10 space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Caption Color</span>
                            <div className="flex items-center gap-1.5">
                              {['#FFE866', '#FFFFFF', '#00F2FE'].map((c) => (
                                <button
                                  key={c}
                                  onClick={() => setSubtitleColor(c)}
                                  className="w-5 h-5 rounded-full border border-white/20"
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Font Size</span>
                            <div className="flex items-center gap-1">
                              {[
                                { label: 'S', cls: 'text-sm' },
                                { label: 'M', cls: 'text-base sm:text-xl' },
                                { label: 'L', cls: 'text-xl sm:text-2xl' }
                              ].map((s) => (
                                <button
                                  key={s.label}
                                  onClick={() => setSubtitleSize(s.cls)}
                                  className={`px-2 py-0.5 rounded border text-[10px] ${
                                    subtitleSize === s.cls
                                      ? 'bg-[#E5A93C] text-black border-[#E5A93C]'
                                      : 'bg-white/5 border-white/10 text-slate-300'
                                  }`}
                                >
                                  {s.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* VIDEO EFFECTS / EQUALIZER TAB */}
                    {settingsTab === 'effects' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <span className="font-bold text-white">VLC Video Equalizer</span>
                          <button onClick={() => setSettingsTab('root')} className="text-slate-400 hover:text-white">
                            Back
                          </button>
                        </div>

                        {/* Brightness */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-slate-400 text-[11px]">
                            <span>Brightness</span>
                            <span className="font-mono text-white">{brightness}%</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="150"
                            value={brightness}
                            onChange={(e) => setBrightness(parseInt(e.target.value))}
                            className="w-full h-1.5 accent-[#E5A93C] bg-white/20 rounded-full cursor-pointer"
                          />
                        </div>

                        {/* Contrast */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-slate-400 text-[11px]">
                            <span>Contrast</span>
                            <span className="font-mono text-white">{contrast}%</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="150"
                            value={contrast}
                            onChange={(e) => setContrast(parseInt(e.target.value))}
                            className="w-full h-1.5 accent-[#E5A93C] bg-white/20 rounded-full cursor-pointer"
                          />
                        </div>

                        {/* Saturation */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-slate-400 text-[11px]">
                            <span>Color Saturation</span>
                            <span className="font-mono text-white">{saturation}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={saturation}
                            onChange={(e) => setSaturation(parseInt(e.target.value))}
                            className="w-full h-1.5 accent-[#E5A93C] bg-white/20 rounded-full cursor-pointer"
                          />
                        </div>

                        {/* Ambilight Toggle */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-slate-300">Theater Ambilight Glow</span>
                          <input
                            type="checkbox"
                            checked={ambilight}
                            onChange={(e) => setAmbilight(e.target.checked)}
                            className="w-4 h-4 rounded accent-[#E5A93C]"
                          />
                        </div>

                        {/* Reset Effects */}
                        <button
                          onClick={() => {
                            setBrightness(100);
                            setContrast(100);
                            setSaturation(100);
                            showOsd('Video Effects Reset');
                          }}
                          className="w-full mt-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs"
                        >
                          Reset Effects to Default
                        </button>
                      </div>
                    )}

                    {/* TRACK SYNC TAB */}
                    {settingsTab === 'sync' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <span className="font-bold text-white">Track Synchronization</span>
                          <button onClick={() => setSettingsTab('root')} className="text-slate-400 hover:text-white">
                            Back
                          </button>
                        </div>

                        {/* Subtitle Delay Adjuster (G / H keys) */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-slate-300">
                            <span>Subtitle Delay (G / H)</span>
                            <span className="font-mono text-[#E5A93C] font-bold">
                              {subtitleDelayMs > 0 ? `+${subtitleDelayMs}` : subtitleDelayMs} ms
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSubtitleDelayMs((d) => d - 50)}
                              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-mono"
                            >
                              -50ms
                            </button>
                            <input
                              type="range"
                              min="-3000"
                              max="3000"
                              step="50"
                              value={subtitleDelayMs}
                              onChange={(e) => setSubtitleDelayMs(parseInt(e.target.value))}
                              className="flex-1 h-1.5 accent-[#E5A93C] bg-white/20 rounded-full"
                            />
                            <button
                              onClick={() => setSubtitleDelayMs((d) => d + 50)}
                              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-mono"
                            >
                              +50ms
                            </button>
                          </div>
                          <button
                            onClick={() => setSubtitleDelayMs(0)}
                            className="text-[10px] text-slate-500 hover:text-slate-300 block"
                          >
                            Reset Subtitle Sync
                          </button>
                        </div>

                        {/* Audio Delay Adjuster (J / K keys) */}
                        <div className="space-y-1.5 pt-2 border-t border-white/10">
                          <div className="flex justify-between text-xs text-slate-300">
                            <span>Audio Delay (J / K)</span>
                            <span className="font-mono text-cyan-400 font-bold">
                              {audioDelayMs > 0 ? `+${audioDelayMs}` : audioDelayMs} ms
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setAudioDelayMs((d) => d - 50)}
                              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-mono"
                            >
                              -50ms
                            </button>
                            <input
                              type="range"
                              min="-3000"
                              max="3000"
                              step="50"
                              value={audioDelayMs}
                              onChange={(e) => setAudioDelayMs(parseInt(e.target.value))}
                              className="flex-1 h-1.5 accent-cyan-400 bg-white/20 rounded-full"
                            />
                            <button
                              onClick={() => setAudioDelayMs((d) => d + 50)}
                              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-mono"
                            >
                              +50ms
                            </button>
                          </div>
                          <button
                            onClick={() => setAudioDelayMs(0)}
                            className="text-[10px] text-slate-500 hover:text-slate-300 block"
                          >
                            Reset Audio Sync
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ASPECT RATIO TAB */}
                    {settingsTab === 'aspect' && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                          <span className="font-bold text-white">Aspect Ratio (Key: A)</span>
                          <button onClick={() => setSettingsTab('root')} className="text-slate-400 hover:text-white">
                            Back
                          </button>
                        </div>
                        {[
                          { id: 'fit', label: 'Fit Window (Original)' },
                          { id: '16-9', label: '16:9 Widescreen' },
                          { id: '21-9', label: '21:9 CinemaScope' },
                          { id: '4-3', label: '4:3 Standard' },
                          { id: 'fill', label: 'Stretch to Screen' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              soundFx.playClick();
                              setAspectRatio(item.id);
                              setShowSettings(false);
                              showOsd(`Aspect: ${item.label}`);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors ${
                              aspectRatio === item.id
                                ? 'bg-purple-500/20 text-purple-300 font-bold'
                                : 'hover:bg-white/10 text-slate-300'
                            }`}
                          >
                            <span>{item.label}</span>
                            {aspectRatio === item.id && <Check className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* PLAYBACK SPEED TAB */}
                    {settingsTab === 'speed' && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                          <span className="font-bold text-white">Speed ([ / ] keys)</span>
                          <button onClick={() => setSettingsTab('root')} className="text-slate-400 hover:text-white">
                            Back
                          </button>
                        </div>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2, 2.5].map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              soundFx.playClick();
                              setPlaybackSpeed(s);
                              if (videoRef.current) videoRef.current.playbackRate = s;
                              setShowSettings(false);
                              showOsd(`Speed: ${s}x`);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors ${
                              playbackSpeed === s
                                ? 'bg-[#E5A93C]/15 text-[#E5A93C] font-bold'
                                : 'hover:bg-white/10 text-slate-300'
                            }`}
                          >
                            <span>{s === 1 ? '1.0x (Normal)' : `${s}x`}</span>
                            {playbackSpeed === s && <Check className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
