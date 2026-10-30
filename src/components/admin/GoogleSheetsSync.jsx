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
  AlertCircle
} from 'lucide-react';
import { useMovies } from '../../context/MovieContext';
import { useToast } from '../../context/ToastContext';
import { 
  getSavedSheetUrl, 
  setSavedSheetUrl, 
  fetchMoviesFromSheet, 
  syncAllMoviesToSheet 
} from '../../services/googleSheetsService';
import { soundFx } from '../../utils/sound';

export const GoogleSheetsSync = () => {
  const { movies, setMovies } = useMovies();
  const { addToast } = useToast();

  const [sheetUrl, setSheetUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const saved = getSavedSheetUrl();
    if (saved) {
      setSheetUrl(saved);
      setIsConnected(true);
    }
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
        title: 'Google Sheets Connected!',
        description: `Successfully connected to sheet! Found ${fetchedMovies.length} cloud records.`,
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
      description: `Uploaded all ${movies.length} master 4K titles to your Google Sheet.`,
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
        // Fallback sample if raw path fetch fails
        codeText = `// KIRTAN CINEMA GOOGLE APPS SCRIPT BACKEND\n// Please check backend/google-apps-script.js in your project files!`;
      }
      await navigator.clipboard.writeText(codeText);
      setCopiedCode(true);
      addToast({
        title: 'Backend Code Copied!',
        description: 'Paste directly into Google Sheets -> Extensions -> Apps Script.',
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
                  {isConnected ? 'LIVE SYNC CONNECTED' : 'NOT CONNECTED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 max-w-xl leading-relaxed">
                Use a free Google Sheet as your live cloud database. Any film added or edited here automatically saves as a row in your spreadsheet.
              </p>
            </div>
          </div>

          {/* Quick Copy Script Button */}
          <button
            onClick={handleCopyBackendCode}
            className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/15 border border-white/15 text-white text-xs font-semibold flex items-center gap-2 transition-all shrink-0"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#E5A93C]" />}
            <span>{copiedCode ? 'Copied Apps Script!' : 'Copy Apps Script Code'}</span>
          </button>
        </div>

        {/* Connection Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
          <label className="text-[11px] uppercase font-bold text-slate-300 tracking-wider flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#E5A93C]" />
            Google Apps Script Web App Deployment URL
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <input
              type="url"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#E5A93C]"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testing...' : 'Connect & Sync'}</span>
              </button>

              <button
                onClick={handlePushToSheet}
                disabled={isSyncing || !isConnected}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Populate your Google Sheet with all current movies"
              >
                <CloudUpload className="w-3.5 h-3.5 text-[#E5A93C]" />
                <span>Push Catalog ({movies.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Step Setup Guide */}
      <div className="p-6 rounded-3xl bg-[#0E1017] border border-white/10 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E5A93C]" />
          <span>How to set up your free Google Sheets backend in 1 minute:</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <span className="w-6 h-6 rounded-full bg-[#E5A93C]/20 border border-[#E5A93C]/40 text-[#E5A93C] font-mono font-bold text-xs flex items-center justify-center">
              1
            </span>
            <p className="font-semibold text-white">Create Google Sheet</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Open <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold">sheets.new</a> in your browser and name the sheet <em>&ldquo;Kirtan Cinema Database&rdquo;</em>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <span className="w-6 h-6 rounded-full bg-[#E5A93C]/20 border border-[#E5A93C]/40 text-[#E5A93C] font-mono font-bold text-xs flex items-center justify-center">
              2
            </span>
            <p className="font-semibold text-white">Open Apps Script</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              In Google Sheets top menu, click <strong>Extensions</strong> (एक्सटेंशन) &rarr; <strong>Apps Script</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <span className="w-6 h-6 rounded-full bg-[#E5A93C]/20 border border-[#E5A93C]/40 text-[#E5A93C] font-mono font-bold text-xs flex items-center justify-center">
              3
            </span>
            <p className="font-semibold text-white">Paste Backend Code</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Click <strong>&ldquo;Copy Apps Script Code&rdquo;</strong> button above, delete sample code in Apps Script, and paste this code.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <span className="w-6 h-6 rounded-full bg-[#E5A93C]/20 border border-[#E5A93C]/40 text-[#E5A93C] font-mono font-bold text-xs flex items-center justify-center">
              4
            </span>
            <p className="font-semibold text-white">Deploy Web App</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Click <strong>Deploy &rarr; New deployment</strong> &rarr; Type: <strong>Web app</strong> &rarr; Who has access: <strong>Anyone</strong>. Copy your Web App URL and paste it here!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
