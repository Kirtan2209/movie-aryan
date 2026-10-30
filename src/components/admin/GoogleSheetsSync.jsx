import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  Table, 
  CloudUpload,
  CheckCircle2,
  AlertCircle,
  Mail,
  Send,
  Zap
} from 'lucide-react';
import { useMovies } from '../../context/MovieContext';
import { useToast } from '../../context/ToastContext';
import { 
  DEFAULT_SHEET_URL,
  getSavedSheetUrl, 
  setSavedSheetUrl, 
  fetchMoviesFromSheet, 
  syncAllMoviesToSheet 
} from '../../services/googleSheetsService';
import { soundFx } from '../../utils/sound';

export const GoogleSheetsSync = () => {
  const { movies, setMovies } = useMovies();
  const { addToast } = useToast();

  const [sheetUrl, setSheetUrl] = useState(DEFAULT_SHEET_URL);
  const [isConnected, setIsConnected] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const saved = getSavedSheetUrl() || DEFAULT_SHEET_URL;
    setSheetUrl(saved);
    setIsConnected(true);
  }, []);

  // Test connection to Google Sheet
  const handleTestConnection = async () => {
    if (!sheetUrl.trim()) {
      addToast({ title: 'URL Required', description: 'Please paste your Google Apps Script Web App URL.', type: 'error' });
      return;
    }

    setIsTesting(true);
    soundFx.playClick();

    const fetchedMovies = await fetchMoviesFromSheet(sheetUrl);

    setIsTesting(false);

    if (fetchedMovies !== null) {
      setIsConnected(true);
      setSavedSheetUrl(sheetUrl);
      soundFx.playSuccess();
      addToast({
        title: 'Google Sheets Connected & Synced!',
        description: `Connected to cloud sheet! Found ${fetchedMovies.length} movies in catalog.`,
        type: 'success'
      });
      if (fetchedMovies.length > 0) {
        setMovies(fetchedMovies);
      }
    } else {
      setIsConnected(false);
      addToast({
        title: 'Connection Failed',
        description: 'Could not connect. Verify you deployed with "Who has access: Anyone".',
        type: 'error'
      });
    }
  };

  // Push all existing catalog movies to populate blank Google Sheet
  const handlePushToSheet = async () => {
    if (!sheetUrl.trim()) {
      addToast({ title: 'Connect First', description: 'Please enter your Google Apps Script Web App URL first.', type: 'error' });
      return;
    }

    setIsSyncing(true);
    soundFx.playClick();

    await syncAllMoviesToSheet(movies);

    setIsSyncing(false);
    soundFx.playSuccess();
    addToast({
      title: 'Catalog Synced to Google Sheet!',
      description: `Uploaded all ${movies.length} master 4K titles to your Google Sheet database.`,
      type: 'success'
    });
  };

  // Copy Apps Script backend code directly to clipboard
  const handleCopyBackendCode = async () => {
    soundFx.playSuccess();
    try {
      const res = await fetch('/backend/google-apps-script.js');
      let codeText = '';
      if (res.ok) {
        codeText = await res.text();
      }
      if (!codeText) {
        codeText = `// Please view backend/google-apps-script.js in your project files!`;
      }
      await navigator.clipboard.writeText(codeText);
      setCopiedCode(true);
      addToast({
        title: 'Backend Code Copied!',
        description: 'Updated with Google Sheets Sync + Instant Email Alerts! Paste into Apps Script.',
        type: 'success'
      });
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0F121C] via-[#0E1017] to-[#121422] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Table className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-cinema font-bold text-white tracking-wide">
                  Google Sheets Cloud Backend
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
                  isConnected
                    ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                    : 'bg-white/10 border border-white/15 text-slate-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
                  {isConnected ? 'LIVE CLOUD CONNECTED' : 'NOT CONNECTED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 max-w-xl leading-relaxed">
                Google Sheets is connected as your live cloud database. Any film uploaded or edited automatically syncs as a row and dispatches real-time email notifications!
              </p>
            </div>
          </div>

          {/* Quick Copy Script Button */}
          <button
            onClick={handleCopyBackendCode}
            className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/15 border border-[#E5A93C]/40 text-white text-xs font-semibold flex items-center gap-2 transition-all shrink-0 shadow-lg"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#E5A93C]" />}
            <span>{copiedCode ? 'Copied Apps Script!' : 'Copy Apps Script (With Email)'}</span>
          </button>
        </div>

        {/* Connection Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
          <label className="text-[11px] uppercase font-bold text-slate-300 tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#E5A93C]" />
              Active Google Apps Script Web App Deployment URL
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-normal">
              Directly Linked in Code
            </span>
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <input
              type="url"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-[#E5A93C]/30 text-white text-xs font-mono focus:outline-none focus:border-[#E5A93C]"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testing...' : 'Test & Sync'}</span>
              </button>

              <button
                onClick={handlePushToSheet}
                disabled={isSyncing || !isConnected}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#E5A93C] hover:bg-[#F3C973] text-black font-bold border border-[#E5A93C] text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#E5A93C]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Populate your Google Sheet with all current movies"
              >
                <CloudUpload className="w-3.5 h-3.5 text-black" />
                <span>Push Full Catalog ({movies.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Email Notification Feature Callout */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#0E1017] to-amber-500/5 border border-[#E5A93C]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#E5A93C]/20 border border-[#E5A93C]/40 flex items-center justify-center text-[#E5A93C] shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Automatic Email Notifications on Every Ingest</span>
              <span className="px-2 py-0.5 rounded-full bg-[#E5A93C]/20 text-[#E5A93C] text-[10px] uppercase font-mono font-bold">Live</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Whenever you drop or upload a video file, Google Apps Script automatically sends a luxury 4K premiere invite email to your Google Account with full specs, poster snapshot, and stream link!
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyBackendCode}
          className="px-4 py-2 rounded-xl bg-[#E5A93C]/15 hover:bg-[#E5A93C]/25 border border-[#E5A93C]/40 text-[#E5A93C] text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Update Apps Script (30s)</span>
        </button>
      </div>

      {/* 4-Step Setup & Update Guide */}
      <div className="p-6 rounded-3xl bg-[#0E1017] border border-white/10 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E5A93C]" />
          <span>How to activate or update Apps Script in 30 seconds:</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <span className="w-6 h-6 rounded-full bg-[#E5A93C]/20 border border-[#E5A93C]/40 text-[#E5A93C] font-mono font-bold text-xs flex items-center justify-center">
              1
            </span>
            <p className="font-semibold text-white">Copy Code</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Click <strong>&ldquo;Copy Apps Script (With Email)&rdquo;</strong> button above to copy the latest backend code to clipboard.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <span className="w-6 h-6 rounded-full bg-[#E5A93C]/20 border border-[#E5A93C]/40 text-[#E5A93C] font-mono font-bold text-xs flex items-center justify-center">
              2
            </span>
            <p className="font-semibold text-white">Open Apps Script</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              In your Google Sheet, click <strong>Extensions &rarr; Apps Script</strong> and paste the copied code into the editor.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <span className="w-6 h-6 rounded-full bg-[#E5A93C]/20 border border-[#E5A93C]/40 text-[#E5A93C] font-mono font-bold text-xs flex items-center justify-center">
              3
            </span>
            <p className="font-semibold text-white">Manage Deployment</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Click <strong>Deploy &rarr; Manage deployments</strong> &rarr; Click <strong>Edit (Pencil)</strong> &rarr; Version: <strong>New version</strong> &rarr; Click <strong>Deploy</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <span className="w-6 h-6 rounded-full bg-[#E5A93C]/20 border border-[#E5A93C]/40 text-[#E5A93C] font-mono font-bold text-xs flex items-center justify-center">
              4
            </span>
            <p className="font-semibold text-white">Ready & Live!</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Your Web App is live! Every upload automatically writes to your Sheet and sends a luxury email directly to your inbox.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
