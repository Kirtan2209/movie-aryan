const STORAGE_KEY = 'kirtan_google_sheets_url';

export const getSavedSheetUrl = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
};

export const setSavedSheetUrl = (url) => {
  try {
    if (url) {
      localStorage.setItem(STORAGE_KEY, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
};

/**
 * Fetch all movies from connected Google Sheet Web App
 */
export const fetchMoviesFromSheet = async (url) => {
  const targetUrl = url || getSavedSheetUrl();
  if (!targetUrl) return null;

  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.movies) && data.movies.length > 0) {
      return data.movies;
    }
    return [];
  } catch (err) {
    console.warn('Could not fetch from Google Sheet:', err);
    return null;
  }
};

/**
 * Add movie to Google Sheet
 */
export const addMovieToSheet = async (movie) => {
  const targetUrl = getSavedSheetUrl();
  if (!targetUrl) return false;

  try {
    await fetch(targetUrl, {
      method: 'POST',
      mode: 'no-cors', // Google Apps Script redirects require no-cors for fire-and-forget or text response
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add',
        movie
      })
    });
    return true;
  } catch (err) {
    console.error('Error adding to Google Sheet:', err);
    return false;
  }
};

/**
 * Update movie in Google Sheet
 */
export const updateMovieInSheet = async (id, updatedFields) => {
  const targetUrl = getSavedSheetUrl();
  if (!targetUrl) return false;

  try {
    await fetch(targetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update',
        id,
        movie: updatedFields
      })
    });
    return true;
  } catch (err) {
    console.error('Error updating in Google Sheet:', err);
    return false;
  }
};

/**
 * Delete movie from Google Sheet
 */
export const deleteMovieFromSheet = async (id) => {
  const targetUrl = getSavedSheetUrl();
  if (!targetUrl) return false;

  try {
    await fetch(targetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete',
        id
      })
    });
    return true;
  } catch (err) {
    console.error('Error deleting from Google Sheet:', err);
    return false;
  }
};

/**
 * Push all catalog movies into a blank Google Sheet in 1 click
 */
export const syncAllMoviesToSheet = async (movies) => {
  const targetUrl = getSavedSheetUrl();
  if (!targetUrl) return false;

  try {
    await fetch(targetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sync_all',
        movies
      })
    });
    return true;
  } catch (err) {
    console.error('Error syncing all movies to Google Sheet:', err);
    return false;
  }
};
