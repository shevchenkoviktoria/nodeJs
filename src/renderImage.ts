import sharp from "sharp";
import axios from "axios";

// Example URL for testing
const outputPath = "./output/scaled-image.jpg";

// Function to determine the URL to download
async function getImageUrl(image: { fileUrl?: string; attributes: { _cogUrl?: string } }): Promise<string> {
  const imageUrl = image.fileUrl || image.attributes._cogUrl;
  if (!imageUrl) {
    throw new Error("No valid URL found for the image.");
  }
  return imageUrl;
}

// Function to download the image as a buffer
async function downloadImageBuffer(imageUrl: string) {
  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
  return Buffer.from(response.data);
}

// Function to process the image using Sharp
export async function renderAnnotations(image: { fileUrl?: string; attributes: { _cogUrl?: string } }, outputPath: string) {
  try {
    // Step 1: Resolve the image URL (fileUrl or _cogUrl)
    const imageUrl = await getImageUrl(image);

    // Step 2: Download the image as a buffer
    const imageBuffer = await downloadImageBuffer(imageUrl);

    // Step 3: Load the image into Sharp
    const sharperImage = sharp(imageBuffer);

    // Step 4: Get image metadata to ensure processing
    const metadata = await sharperImage.metadata();
    console.log("Original image dimensions:", metadata.width, "x", metadata.height);

    // Step 5: Resize the image to 2000 pixels width, maintaining aspect ratio
    await sharperImage
      .resize({ width: 2000 }) // Resize width to 2000 pixels, height adjusts automatically
      .jpeg({ quality: 80 }) // Save as JPEG with 80% quality
      .toFile(outputPath); // Save the resized image to the output path

    console.log("Scaled image saved at:", outputPath);
  } catch (error) {
    console.error("Error rendering annotations:", error);
    if (error instanceof Error) {
      throw new Error("Rendering annotations failed: " + error.message);
    } else {
      throw new Error("Rendering annotations failed: " + String(error));
    }
  }
}

// Example usage
const image = {
  fileUrl: undefined,
  attributes: {
    _cogUrl: "https://sharpershape-eu-dataset.s3.eu-central-1.amazonaws.com/companyId%3D...",
  },
};

renderAnnotations(image, outputPath).catch((err) => console.error(err));
