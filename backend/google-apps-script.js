/**
 * ==============================================================================
 * KIRTAN CINEMA - GOOGLE SHEETS & EMAIL BACKEND (Google Apps Script)
 * ==============================================================================
 * 
 * FEATURES:
 * 1. Cloud Database: Stores full movie catalog directly in Google Sheets.
 * 2. Instant Email Alerts: Automatically dispatches a luxury branded 4K premiere
 *    email notification to your Google Account (or specified recipient) whenever
 *    a new video/movie is uploaded!
 * 3. Multi-Device Sync: Real-time GET and POST endpoints for zero-lag streaming.
 * 
 * QUICK SETUP / UPDATE (30 SECONDS):
 * 1. Open Google Sheets (https://sheets.new) -> Name it "Kirtan Cinema Database".
 * 2. Click "Extensions" (एक्सटेंशन) -> "Apps Script" in the top menu.
 * 3. Delete any previous code in the editor, and PASTE THIS ENTIRE FILE.
 * 4. Click "Deploy" (डिप्लॉय) (top right blue button) -> "Manage deployments" (or New deployment).
 * 5. Click the Pencil (Edit) icon -> Select "Version: New version" -> Click "Deploy".
 *    (Ensure "Execute as: Me" and "Who has access: Anyone").
 * 6. You're done! Every upload now writes to the Sheet and instantly emails you!
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

    // ACTION 1: Add new Movie + Trigger Email Notification
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

      // Trigger instant luxury email notification to the account owner / recipient
      var emailSent = false;
      try {
        emailSent = sendUploadEmailNotification(m, payload.notifyEmail);
      } catch (mailErr) {
        Logger.log('Email dispatch warning: ' + mailErr.toString());
      }

      return jsonResponse({
        success: true,
        message: 'Film added to Google Sheet successfully' + (emailSent ? ' & Email notification sent' : ''),
        id: newId,
        emailSent: emailSent
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

/**
 * Send an ultra-luxurious HTML email notification when a new movie is uploaded
 */
function sendUploadEmailNotification(movie, optionalRecipient) {
  try {
    var recipient = (optionalRecipient && optionalRecipient.indexOf('@') > -1) 
      ? optionalRecipient.trim() 
      : (Session.getEffectiveUser().getEmail() || Session.getActiveUser().getEmail());

    if (!recipient) {
      Logger.log('No recipient email available to receive notification.');
      return false;
    }

    var title = movie.title || 'Untitled Master Film';
    var duration = movie.duration || '2h 00m';
    var year = movie.year || 2026;
    var rating = movie.rating || 'PG-13';
    var imdb = movie.imdb || '9.0';
    var resolution = (movie.specs && movie.specs.resolution) || movie.resolution || '4K UHD 2160p';
    var audio = (movie.specs && movie.specs.audio) || movie.audio || 'Dolby Atmos 7.1';
    var genres = Array.isArray(movie.genres) ? movie.genres.join(', ') : (movie.genres || 'Action, Sci-Fi');
    var director = movie.director || 'Kirtan Studio';
    var tagline = movie.tagline || 'Exclusive Master Cinema Stream';
    var description = movie.description || 'High-definition uncompressed master release streamable across all connected devices.';
    var posterUrl = movie.poster || movie.backdrop || '';
    var nowStr = Utilities.formatDate(new Date(), 'GMT+5:30', 'dd MMM yyyy, hh:mm a');

    var subject = '🎬 [KIRTAN CINEMA] New 4K Film Premiered: ' + title;

    var htmlBody = 
      '<div style="margin: 0; padding: 30px 10px; background-color: #07080B; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #E8EAED;">' +
        '<div style="max-width: 620px; margin: 0 auto; background: #0E1017; border: 1px solid rgba(229, 169, 60, 0.35); border-radius: 18px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.85);">' +
          
          '<div style="height: 4px; background: linear-gradient(90deg, #E5A93C, #F3C973, #D49228);"></div>' +

          '<div style="padding: 28px 24px; text-align: center; background: radial-gradient(circle at 50% 0%, rgba(229, 169, 60, 0.12), transparent 75%); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">' +
            '<div style="display: inline-block; padding: 4px 14px; background: rgba(229, 169, 60, 0.15); border: 1px solid #E5A93C; border-radius: 999px; font-size: 11px; font-weight: 800; color: #E5A93C; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px;">★ INGESTION VERIFIED ★</div>' +
            '<h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 3px; color: #FFFFFF; text-transform: uppercase;">KIRTAN <span style="color: #E5A93C;">CINEMA</span></h1>' +
            '<p style="margin: 6px 0 0 0; font-size: 12px; color: #8F96A3; letter-spacing: 1.5px; text-transform: uppercase;">4K Ultra HD • Cloud Streaming Notification</p>' +
          '</div>' +

          (posterUrl ? 
            ('<div style="padding: 20px 24px 0 24px; text-align: center;">' +
              '<img src="' + posterUrl + '" alt="' + title + '" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 12px; border: 1px solid rgba(229, 169, 60, 0.25); display: block;" />' +
            '</div>') : '') +

          '<div style="padding: 28px 24px;">' +
            '<div style="margin-bottom: 18px;">' +
              '<h2 style="margin: 0 0 6px 0; font-size: 24px; font-weight: 700; color: #FFFFFF;">' + title + '</h2>' +
              '<p style="margin: 0; font-size: 14px; color: #E5A93C; font-style: italic;">"' + tagline + '"</p>' +
            '</div>' +

            '<div style="margin: 16px 0; display: block;">' +
              '<span style="display: inline-block; padding: 4px 10px; background: rgba(255,255,255,0.08); border-radius: 6px; font-size: 12px; color: #FFFFFF; font-weight: 600; margin-right: 6px; margin-bottom: 6px;">' + year + '</span>' +
              '<span style="display: inline-block; padding: 4px 10px; background: rgba(255,255,255,0.08); border-radius: 6px; font-size: 12px; color: #FFFFFF; font-weight: 600; margin-right: 6px; margin-bottom: 6px;">' + duration + '</span>' +
              '<span style="display: inline-block; padding: 4px 10px; background: rgba(255,255,255,0.08); border-radius: 6px; font-size: 12px; color: #FFFFFF; font-weight: 600; margin-right: 6px; margin-bottom: 6px;">' + rating + '</span>' +
              '<span style="display: inline-block; padding: 4px 10px; background: rgba(229, 169, 60, 0.2); border: 1px solid #E5A93C; border-radius: 6px; font-size: 12px; color: #E5A93C; font-weight: 700; margin-right: 6px; margin-bottom: 6px;">IMDb ' + imdb + '</span>' +
            '</div>' +

            '<div style="background: #141722; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 18px; margin: 20px 0;">' +
              '<table style="width: 100%; border-collapse: collapse; font-size: 13px;">' +
                '<tr>' +
                  '<td style="padding: 6px 0; color: #8F96A3; width: 40%;">Resolution:</td>' +
                  '<td style="padding: 6px 0; color: #FFFFFF; font-weight: 600;">' + resolution + '</td>' +
                '</tr>' +
                '<tr>' +
                  '<td style="padding: 6px 0; color: #8F96A3;">Master Audio:</td>' +
                  '<td style="padding: 6px 0; color: #FFFFFF; font-weight: 600;">' + audio + '</td>' +
                '</tr>' +
                '<tr>' +
                  '<td style="padding: 6px 0; color: #8F96A3;">Director:</td>' +
                  '<td style="padding: 6px 0; color: #FFFFFF; font-weight: 600;">' + director + '</td>' +
                '</tr>' +
                '<tr>' +
                  '<td style="padding: 6px 0; color: #8F96A3;">Genres:</td>' +
                  '<td style="padding: 6px 0; color: #E5A93C; font-weight: 600;">' + genres + '</td>' +
                '</tr>' +
                '<tr>' +
                  '<td style="padding: 6px 0; color: #8F96A3;">Ingested At:</td>' +
                  '<td style="padding: 6px 0; color: #ACB3BF;">' + nowStr + '</td>' +
                '</tr>' +
              '</table>' +
            '</div>' +

            '<p style="margin: 16px 0 24px 0; font-size: 14px; line-height: 1.6; color: #ACB3BF;">' + description + '</p>' +

            '<div style="padding: 14px 18px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 10px; margin-bottom: 24px;">' +
              '<p style="margin: 0; font-size: 13px; color: #4ADE80; font-weight: 600;">✓ Synced to Google Sheet & Live on Wi-Fi Broadcast</p>' +
              '<p style="margin: 4px 0 0 0; font-size: 11px; color: #86EFAC;">This film is instantly streamable across TV, tablet, phone, and PC.</p>' +
            '</div>' +

          '</div>' +

          '<div style="padding: 20px 24px; background: #0A0B0E; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">' +
            '<p style="margin: 0 0 6px 0; font-size: 12px; color: #8F96A3;">Sent automatically by <strong>Kirtan Cinema Cloud Ingest Engine</strong></p>' +
            '<p style="margin: 0; font-size: 11px; color: #525866;">Google Sheets Backend • Real-time Notification System</p>' +
          '</div>' +

        '</div>' +
      '</div>';

    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      htmlBody: htmlBody
    });
    Logger.log('Email notification successfully sent to ' + recipient);
    return true;
  } catch (err) {
    Logger.log('Failed to send email: ' + err.toString());
    return false;
  }
}
