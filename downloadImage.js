const fs = require('fs');
const https = require('https');

/**
 * Downloads an image from a URL and saves it to a local file.
 * @param {string} url - The URL of the image to download.
 * @param {string} path - The local file path to save the image.
 * @returns {Promise} - Resolves when the download is complete.
 */
const downloadImage = (url, path) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlinkSync(path); // Delete the file in case of error
      reject(err);
    });
  });
};

module.exports = downloadImage;
