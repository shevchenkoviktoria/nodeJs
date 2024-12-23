import sharp from 'sharp';
import axios from 'axios';

async function getImageUrl(image: {
  fileUrl?: string;
  attributes: { _cogUrl?: string };
}): Promise<string> {
  const imageUrl = image.fileUrl || image.attributes._cogUrl;
  if (!imageUrl) {
    throw new Error('No valid URL found for the image.');
  }
  return imageUrl;
}

async function downloadImageBuffer(imageUrl: string): Promise<Buffer> {
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
}

export async function renderImage(
  image: { fileUrl?: string; attributes: { _cogUrl?: string } },
  outputPath: string
): Promise<void> {
  try {
    // Resolve the image URL
    const imageUrl = await getImageUrl(image);

    // Download the image as a Buffer
    const imageBuffer = await downloadImageBuffer(imageUrl);

    // Process the image using Sharp
    const sharperImage = sharp(imageBuffer);
    const metadata = await sharperImage.metadata();

    if (!metadata.width) {
      throw new Error('Unable to determine image width.');
    }

    if (metadata.width > 2000) {
      console.log('Image width exceeds 2000 pixels. Resizing...');
      await sharperImage
        .resize({ width: 2000 }) 
        .jpeg({ quality: 80 })
        .toFile(outputPath);
      console.log('Scaled image saved at:', outputPath);
    } else {
      console.log('Image width is within limits. No resizing needed.');
      await sharperImage
        .jpeg({ quality: 80 })
        .toFile(outputPath);
      console.log('Image saved at:', outputPath);
    }
  } catch (error) {
    console.error('Error rendering image:', error);
    throw new Error(
      'Rendering image failed: ' + (error instanceof Error ? error.message : String(error))
    );
  }
}
