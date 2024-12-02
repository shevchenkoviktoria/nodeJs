import sharp from "sharp";
import axios from "axios";
import fs from "fs";
import { Annotation } from "./types/domain";
import { addAnnotations } from "./addAnnotation";

type Bounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

async function downloadImage(url: string, path: string) {
  const response = await axios({
    url,
    responseType: "stream",
  });
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(path);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

export async function renderAnnotations(
  imageUrl: string,
  outputPath: string,
  annotations: Annotation[],
  bounds: Bounds
) {
  const tempImagePath = "temp_image.jpeg";

  try {
    // Download the image
    await downloadImage(imageUrl, tempImagePath);

    const sharpImage = sharp(tempImagePath);

    // Get image metadata to validate bounds
    const metadata = await sharpImage.metadata();
    const imageWidth = metadata.width!;
    const imageHeight = metadata.height!;

    // Ensure bounds are within image dimensions
    const cropArea = {
      left: Math.max(0, bounds.x),
      top: Math.max(0, bounds.y),
      width: Math.min(bounds.width, imageWidth - bounds.x),
      height: Math.min(bounds.height, imageHeight - bounds.y),
    };

    // Crop the image according to the bounds
    const croppedImage = sharpImage.extract(cropArea);

    // Use the addAnnotations function to apply annotations to the cropped image
    const annotatedImage = addAnnotations(croppedImage, annotations);

    // Save the annotated image
    await annotatedImage.jpeg({ quality: 80 }).toFile(outputPath);

    console.log("Annotated image saved at:", outputPath);
  } catch (error) {
    console.error("Error rendering annotations:", error);
    throw new Error(
      "Rendering annotations failed: " + (error as Error).message
    );
  } finally {
    // Clean up temporary image
    if (fs.existsSync(tempImagePath)) {
      fs.unlinkSync(tempImagePath);
    }
  }
}
