# KIRTAN CINEMA &mdash; World-Class 4K Streaming Platform

An ultra-luxury cinematic movie streaming platform built with React 19, Vite, Tailwind CSS, Framer Motion, and HLS.js.

![Kirtan Cinema](public/favicon.svg)

---

## 🚀 How to Push to GitHub (Solving the 100 Item Limit)

GitHub's website has a strict browser drag-and-drop limit of **100 files at a time**. Because projects contain `node_modules` (thousands of files), uploading through the GitHub web UI fails.

This project is now properly initialized with a clean `.gitignore` and local Git repository containing **only the 44 clean source files**.

### Step 1: Create a New Empty Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Repository name: `kirtan-cinema` (or any name you like).
3. Do **NOT** check "Initialize this repository with a README" (keep it blank).
4. Click **Create repository**.

### Step 2: Run These 2 Commands in Terminal
Open your terminal in this folder and paste your GitHub repository link:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

*(If you already added origin, use: `git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git` then `git push -u origin main`)*

All 44 clean files will upload instantly to GitHub in under 5 seconds!

---

## 🌟 Key Features

1. **VLC-Grade Video Player**:
   - Web Audio API **200% Volume Boost** (with flame booster indicator).
   - **Accurate Synchronized Dialogue Subtitles** in Hindi, English [CC], Spanish, French, and Japanese.
   - **Custom Subtitle Upload (.srt / .vtt)** support with color and size tuning.
   - Subtitle Delay & Audio Delay Sync Adjusters (50ms steps via `G`/`H` and `J`/`K` keys).
   - **VLC Video Equalizer**: Brightness, Contrast, Saturation controls and Theater Ambilight Glow.
   - **Aspect Ratio Switcher** (Fit Window, 16:9, 21:9 CinemaScope, 4:3, Fill Screen - Key: `A`).
   - **1-Click 4K Frame Snapshot Capture** (`S` key) with camera shutter flash and download.
   - **Frame Step** (`E` key) and **A-B Looper Sequencer**.

2. **Direct Video Ingest (No Links Needed)**:
   - Select or drag & drop any `.mp4`, `.mov`, `.mkv`, or `.webm` file.
   - HTML5 Canvas automatically grabs a high-resolution 4K poster snapshot from the video at 1.5s.
   - Auto-extracts duration and title.
   - Immediately publishes to the Home Page and starts streaming with 1 click.

3. **Multi-Device Wi-Fi Casting**:
   - Any phone, iPad, or Smart TV on the local network can open `http://192.168.1.7:5174/` or scan the QR code to stream directly.

4. **iOS 27 Liquid Glass Navbar**:
   - Ultra-translucent saturated backdrop blur (`36px` blur, `220%` saturation) with edge specular highlight.
   - Does NOT turn black on scroll &mdash; colors and poster art shine through cleanly.

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
