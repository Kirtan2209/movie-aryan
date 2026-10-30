/**
 * ==============================================================================
 * KIRTAN CINEMA - GOOGLE SHEETS BACKEND (Google Apps Script)
 * ==============================================================================
 * 
 * SETUP INSTRUCTIONS (1 MINUTE):
 * 1. Open Google Sheets (https://sheets.new) and name it "Kirtan Cinema Database".
 * 2. Click on "Extensions" (एक्सटेंशन) -> "Apps Script" in top menu.
 * 3. Delete any code in the editor, and PASTE THIS ENTIRE FILE.
 * 4. Click "Deploy" (डिप्लॉय) (top right blue button) -> "New deployment".
 * 5. Select type: "Web app" (क्लिक गियर आइकन -> Web app).
 * 6. Set Description: "Kirtan Cinema API".
 * 7. Set "Execute as": "Me" (your email).
 * 8. Set "Who has access": "Anyone" (महत्वपूर्ण: Anyone सेलेक्ट करें ताकि वेबसाइट डेटा पढ़ सके).
 * 9. Click "Deploy", approve Google permissions, and COPY the Web App URL!
 * 10. Paste that URL into Kirtan Cinema -> Studio CMS -> Google Sheets tab!
 * ==============================================================================
 */

// Headers schema for the Google Sheet
const HEADERS = [
  'id',
  'title',
  'tagline',
  'description',
  'backdrop',
  'poster',
  'videoUrl',
  'trailerUrl',
  'year',
  'duration',
  'rating',
  'imdb',
  'match',
  'director',
  'genres',
  'resolution',
  'audio',
  'isFeatured',
  'isOriginal'
];

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Movies');
  if (!sheet) {
    sheet = ss.insertSheet('Movies');
  }

  // Ensure headers exist
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#12141D')
      .setFontColor('#E5A93C');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Handle GET requests - Fetch all movies from Google Sheet
 */
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return jsonResponse({
        success: true,
        count: 0,
        movies: []
      });
    }

    const headers = data[0];
    const movies = [];

    for (var r = 1; r < data.length; r++) {
      var row = data[r];
      if (!row[0]) continue; // Skip empty rows

      var movie = {};
      for (var c = 0; c < headers.length; c++) {
        var key = headers[c];
        var val = row[c];

        // Format specific fields
        if (key === 'genres') {
          movie.genres = val ? val.toString().split(',').map(function(s) { return s.trim(); }) : ['Action'];
        } else if (key === 'isFeatured' || key === 'isOriginal') {
          movie[key] = (val === true || val === 'TRUE' || val === 'true' || val === 1);
        } else if (key === 'imdb' || key === 'match' || key === 'year') {
          movie[key] = Number(val) || val;
        } else {
          movie[key] = val;
        }
      }

      // Specs object wrapper
      movie.specs = {
        resolution: movie.resolution || '4K UHD 2160p',
        audio: movie.audio || 'Dolby Atmos 7.1',
        hdr: 'Dolby Vision & HDR10+',
        aspect: '1.90:1 IMAX',
        fps: '24 fps'
      };

      movies.push(movie);
    }

    return jsonResponse({
      success: true,
      count: movies.length,
      movies: movies
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * Handle POST requests - Add, Edit, Delete, or Bulk Sync movies
 */
function doPost(e) {
  try {
    var sheet = getOrCreateSheet();
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;

    // ACTION 1: Add new Movie
    if (action === 'add') {
      var m = payload.movie;
      var newId = m.id || 'm-' + new Date().getTime();
      var genresStr = Array.isArray(m.genres) ? m.genres.join(', ') : (m.genres || 'Action');

      sheet.appendRow([
        newId,
        m.title || 'Untitled Film',
        m.tagline || '',
        m.description || '',
        m.backdrop || '',
        m.poster || '',
        m.videoUrl || '',
        m.trailerUrl || m.videoUrl || '',
        m.year || 2026,
        m.duration || '2h 00m',
        m.rating || 'PG-13',
        m.imdb || 8.8,
        m.match || 95,
        m.director || 'Kirtan Studio',
        genresStr,
        (m.specs && m.specs.resolution) || '4K UHD 2160p',
        (m.specs && m.specs.audio) || 'Dolby Atmos 7.1',
        Boolean(m.isFeatured),
        Boolean(m.isOriginal)
      ]);

      return jsonResponse({
        success: true,
        message: 'Film added to Google Sheet successfully',
        id: newId
      });
    }

    // ACTION 2: Update existing Movie
    if (action === 'update') {
      var idToUpdate = payload.id;
      var updatedMovie = payload.movie;
      var data = sheet.getDataRange().getValues();
      var rowIndex = -1;

      for (var i = 1; i < data.length; i++) {
        if (data[i][0] == idToUpdate) {
          rowIndex = i + 1; // 1-based index
          break;
        }
      }

      if (rowIndex === -1) {
        return jsonResponse({ success: false, message: 'Movie ID not found in sheet' });
      }

      var genresStr = Array.isArray(updatedMovie.genres) ? updatedMovie.genres.join(', ') : (updatedMovie.genres || '');

      sheet.getRange(rowIndex, 1, 1, HEADERS.length).setValues([[
        idToUpdate,
        updatedMovie.title || data[rowIndex-1][1],
        updatedMovie.tagline || data[rowIndex-1][2],
        updatedMovie.description || data[rowIndex-1][3],
        updatedMovie.backdrop || data[rowIndex-1][4],
        updatedMovie.poster || data[rowIndex-1][5],
        updatedMovie.videoUrl || data[rowIndex-1][6],
        updatedMovie.trailerUrl || data[rowIndex-1][7],
        updatedMovie.year || data[rowIndex-1][8],
        updatedMovie.duration || data[rowIndex-1][9],
        updatedMovie.rating || data[rowIndex-1][10],
        updatedMovie.imdb || data[rowIndex-1][11],
        updatedMovie.match || data[rowIndex-1][12],
        updatedMovie.director || data[rowIndex-1][13],
        genresStr,
        (updatedMovie.specs && updatedMovie.specs.resolution) || data[rowIndex-1][15],
        (updatedMovie.specs && updatedMovie.specs.audio) || data[rowIndex-1][16],
        Boolean(updatedMovie.isFeatured),
        Boolean(updatedMovie.isOriginal)
      ]]);

      return jsonResponse({ success: true, message: 'Movie updated in Google Sheet' });
    }

    // ACTION 3: Delete Movie
    if (action === 'delete') {
      var idToDelete = payload.id;
      var data = sheet.getDataRange().getValues();

      for (var i = 1; i < data.length; i++) {
        if (data[i][0] == idToDelete) {
          sheet.deleteRow(i + 1);
          return jsonResponse({ success: true, message: 'Movie deleted from Google Sheet' });
        }
      }

      return jsonResponse({ success: false, message: 'Movie ID not found' });
    }

    // ACTION 4: Bulk Sync All Movies
    if (action === 'sync_all') {
      var moviesList = payload.movies || [];
      sheet.clearContents();
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length)
        .setFontWeight('bold')
        .setBackground('#12141D')
        .setFontColor('#E5A93C');
      sheet.setFrozenRows(1);

      var rowsToAdd = [];
      for (var j = 0; j < moviesList.length; j++) {
        var m = moviesList[j];
        var genresStr = Array.isArray(m.genres) ? m.genres.join(', ') : (m.genres || '');
        rowsToAdd.push([
          m.id || 'm-' + j,
          m.title || '',
          m.tagline || '',
          m.description || '',
          m.backdrop || '',
          m.poster || '',
          m.videoUrl || '',
          m.trailerUrl || '',
          m.year || 2026,
          m.duration || '2h',
          m.rating || 'PG-13',
          m.imdb || 8.5,
          m.match || 95,
          m.director || 'Kirtan Studio',
          genresStr,
          (m.specs && m.specs.resolution) || '4K UHD 2160p',
          (m.specs && m.specs.audio) || 'Dolby Atmos 7.1',
          Boolean(m.isFeatured),
          Boolean(m.isOriginal)
        ]);
      }

      if (rowsToAdd.length > 0) {
        sheet.getRange(2, 1, rowsToAdd.length, HEADERS.length).setValues(rowsToAdd);
      }

      return jsonResponse({
        success: true,
        message: 'Successfully populated ' + rowsToAdd.length + ' films to Google Sheet'
      });
    }

    return jsonResponse({ success: false, message: 'Unknown action' });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

/**
 * Return formatted JSON response with CORS headers
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
