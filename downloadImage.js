import axios from 'axios';
import path from 'path';

async function downloadImage(imagePath) {
  const fileUrl = `file://${path.resolve(imagePath)}`; // Convert to file URL
  try {
    console.log("Downloading image from URL:", fileUrl);
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    return response.data;
  } catch (error) {
    console.error("Error downloading image:", error);
    throw error;
  }
}
