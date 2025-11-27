// main/metadata.js
const mm = require('music-metadata');
const fs = require('fs');

async function getMetadataFromFile(filePath) {
  try {
    // parseFile membaca file dari disk (asynchronous)
    const metadata = await mm.parseFile(filePath, { skipCovers: false });

    // Ambil fields yang umum
    const common = metadata.common || {};
    const format = metadata.format || {};
    // cover handling (bisa berupa array)
    let picture = null;
    if (common.picture && common.picture.length > 0) {
      const image = metadata.common.picture[0];
      const base64 = image.data.toString("base64");
      picture = `data:${image.format};base64,${base64}`;
    }

    return {
      title: common.title || getFilename(filePath),
      artist: common.artists ? common.artists.join(', ') : (common.artist || 'Unknown'),
      album: common.album || 'Unknown',
      year: common.year || null,
      track: common.track && common.track.no ? common.track.no : null,
      duration: format.duration || null,
      bitrate: format.bitrate || null,
      sampleRate: format.sampleRate || null,
      codec: format.codec || null,
      picture,
      albumArtist: common.albumartist || 'Unknown',
      filePath,
    };
  } catch (err) {
    console.error('Error parsing metadata for', filePath, err.message);
    return {
      title: getFilename(filePath),
      artist: 'Unknown',
      album: 'Unknown',
      duration: null,
      picture: null,
      filePath,
      error: err.message,
    };
  }
}

function getFilename(p) {
  return require('path').basename(p);
}

module.exports = { getMetadataFromFile };
