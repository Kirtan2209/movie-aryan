import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Copy, Check, QrCode, Wifi, Tv, ExternalLink } from 'lucide-react';
import { soundFx } from '../../utils/sound';
import { useToast } from '../../context/ToastContext';

export const DeviceConnectModal = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [networkInfo, setNetworkInfo] = useState({
    ip: '192.168.1.7',
    port: 5174,
    streamUrl: 'http://192.168.1.7:5174'
  });

  useEffect(() => {
    if (isOpen) {
      fetch('/api/network-info')
        .then((res) => res.json())
        .then((data) => setNetworkInfo(data))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    soundFx.playSuccess();
    navigator.clipboard.writeText(networkInfo.streamUrl);
    setCopied(true);
    addToast({
      title: 'Network Link Copied',
      description: `Open ${networkInfo.streamUrl} on any phone, tablet or TV on this Wi-Fi.`,
      type: 'success'
    });
    setTimeout(() => setCopied(false), 2500);
  };

  // Generate QR code URL via reliable public SVG/API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    networkInfo.streamUrl
  )}&color=000000&bgcolor=FFFFFF`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
        <div onClick={onClose} className="fixed inset-0 bg-transparent" />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-md bg-[#0D0F17] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 text-center"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-3">
            <Smartphone className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-cinema font-bold text-white tracking-wide">
            Stream on Phone / Other Device
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Scan with your mobile camera or enter the link on any device on your Wi-Fi.
          </p>

          {/* QR Code Container */}
          <div className="mt-5 p-3.5 bg-white rounded-2xl inline-block shadow-xl shadow-black/80 border-4 border-[#E5A93C]/30">
            <img
              src={qrCodeUrl}
              alt="Scan QR code to stream on phone"
              className="w-40 h-40 object-contain mx-auto"
            />
          </div>

          {/* Network Link bar */}
          <div className="mt-5 space-y-2 text-left">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-[#E5A93C]" />
              Local Wi-Fi Stream Address
            </label>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/60 border border-white/15">
              <input
                type="text"
                readOnly
                value={networkInfo.streamUrl}
                className="flex-1 bg-transparent text-[#E5A93C] font-mono text-xs font-semibold select-all focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#E5A93C] hover:text-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Instructions note */}
          <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-slate-300 text-left space-y-1">
            <p className="font-semibold text-white flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-cyan-400" />
              Instant Multi-Device Sync:
            </p>
            <p className="text-slate-400 text-[10px]">
              Any video uploaded here will immediately appear and stream on your phone, iPad, or Smart TV in real-time.
            </p>
          </div>

          {/* Done button */}
          <button
            onClick={onClose}
            className="mt-5 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
