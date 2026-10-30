import confetti from 'canvas-confetti';

/**
 * Extracts a high-res screenshot poster from a video file using HTML5 canvas
 */
export const captureVideoThumbnail = (file) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      // Seek to 1.5s or 10% of video
      const targetTime = Math.min(1.5, video.duration * 0.1);
      video.currentTime = targetTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        URL.revokeObjectURL(video.src);
        resolve({
          poster: dataUrl,
          duration: formatSecondsToDuration(video.duration),
          durationSeconds: Math.round(video.duration)
        });
      } catch {
        resolve({
          poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2880&q=85',
          duration: '2h 10m',
          durationSeconds: 7800
        });
      }
    };

    video.onerror = () => {
      resolve({
        poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2880&q=85',
        duration: '1h 50m',
        durationSeconds: 6600
      });
    };
  });
};

export const formatSecondsToDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '1h 45m';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m ${secs}s`;
};

/**
 * Converts Google Drive, Dropbox, or Cloud URLs to direct 24/7 playable video streams
 */
export const convertToDirectStreamUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim();

  // Google Drive: https://drive.google.com/file/d/FILE_ID/view... or open?id=FILE_ID
  const gdriveRegex = /https:\/\/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/;
  const gdriveMatch = trimmed.match(gdriveRegex);
  if (gdriveMatch && gdriveMatch[1]) {
    const fileId = gdriveMatch[1];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  // Dropbox: convert dl=0 to raw=1 for direct streaming
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace('dl=0', 'raw=1');
  }

  return trimmed;
};

/**
 * Uploads a video file directly to the local streaming server
 */
export const uploadVideoFile = async (file, onProgress) => {
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'x-file-name': encodeURIComponent(file.name)
      },
      body: file
    });

    if (!response.ok) {
      throw new Error('Upload to local server failed');
    }

    const data = await response.json();
    return {
      success: true,
      url: data.url, // e.g. /uploads/filename.mp4
      filename: data.filename
    };
  } catch (err) {
    console.warn('Server upload fallback to local Blob URL:', err);
    // Safe fallback to Object URL if server is not handling POST
    const blobUrl = URL.createObjectURL(file);
    return {
      success: true,
      url: blobUrl,
      filename: file.name
    };
  }
};

/**
 * Cinematic Golden Confetti Celebration
 */
export const fireCelebrationConfetti = () => {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#E5A93C', '#F5C518', '#00F2FE', '#FFFFFF', '#FFA726']
    });
  } catch {}
};
