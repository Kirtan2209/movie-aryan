import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tv, Copy, Check, ExternalLink, ShieldCheck, Terminal } from 'lucide-react';
import { useMovies } from '../../context/MovieContext';
import { useToast } from '../../context/ToastContext';
import { soundFx } from '../../utils/sound';

export const VlcPlayerModal = () => {
  const { vlcModalMovie, closeVlcModal } = useMovies();
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!vlcModalMovie) return null;

  const streamUrl = vlcModalMovie.videoUrl;
  const vlcProtocolUrl = `vlc://${streamUrl}`;

  const handleCopy = () => {
    soundFx.playSuccess();
    navigator.clipboard.writeText(streamUrl);
    setCopied(true);
    addToast({
      title: 'Stream URL Copied',
      description: 'Paste into VLC Media Player (Ctrl+N or Cmd+N) to stream directly.',
      type: 'success'
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLaunchVlc = () => {
    soundFx.playWhoosh();
    window.location.href = vlcProtocolUrl;
    addToast({
      title: 'Opening External VLC',
      description: 'Launching VLC Media Player protocol link...',
      type: 'info'
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6">
        <div onClick={closeVlcModal} className="fixed inset-0 bg-transparent" />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          className="relative w-full max-w-lg bg-[#0F1118] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Stream in External VLC</h3>
                <p className="text-xs text-slate-400">{vlcModalMovie.title}</p>
              </div>
            </div>
            <button
              onClick={closeVlcModal}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <div className="py-5 space-y-4 text-xs text-slate-300">
            <p>
              Experience uncompressed local hardware decoding by streaming the direct 4K master network stream through your desktop VLC player or home theater receiver.
            </p>

            {/* Direct Stream URL Bar */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Direct Master Stream URL:
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/60 border border-white/15">
                <input
                  type="text"
                  readOnly
                  value={streamUrl}
                  className="flex-1 bg-transparent text-slate-200 text-xs font-mono select-all focus:outline-none truncate"
                />
                <button
                  onClick={handleCopy}
                  className="p-1.5 px-3 rounded-lg bg-white/10 hover:bg-[#E5A93C] hover:text-black text-white font-medium text-xs transition-colors flex items-center gap-1.5 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Instructions box */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              <p className="text-white font-semibold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#E5A93C]" />
                How to open in VLC:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>Open <strong>VLC Media Player</strong> on your computer.</li>
                <li>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Ctrl + N</kbd> (or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Cmd + N</kbd> on Mac).</li>
                <li>Paste the copied stream URL and click <strong>Play</strong>.</li>
              </ol>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleLaunchVlc}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-[#E5A93C] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Launch VLC Directly</span>
            </button>
            <button
              onClick={closeVlcModal}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
