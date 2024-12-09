import sharp from "sharp";
import axios from "axios";
import fs from "fs";
import path from "path";
import { addAnnotations } from "./addAnnotation";
import { AnnotationType } from "./types/domain";

type Bounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

async function downloadImage(url: string, outputPath: string) {
  if (url.startsWith("http")) {
    const response = await axios({
      url,
      responseType: "stream",
    });
    return new Promise<void>((resolve, reject) => {
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);
      writer.on("finish", () => resolve());
      writer.on("error", reject);
    });
  } else {
    return new Promise<void>((resolve, reject) => {
      const localPath = url.startsWith("file://") ? url.slice(7) : url;
      fs.copyFile(localPath, outputPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export async function renderAnnotations(
  imageUrl: string,
  outputPath: string,
  annotations: AnnotationType[],
  bounds: Bounds
) {
  try {
    console.log("Starting renderAnnotations");

    console.log(`Image URL being passed: ${imageUrl}`);
    console.log(`Downloading image from URL: ${imageUrl}`);
    // await downloadImage(imageUrl, outputPath);

    const sharpImage = sharp(imageUrl);

    // Add annotations to the entire image

    // Get image metadata to validate bounds
    const metadata = await sharpImage.metadata();
    let annotatedImage = addAnnotations(sharpImage, annotations, metadata);
    const imageWidth = metadata.width!;
    const imageHeight = metadata.height!;

    // Ensure bounds are within image dimensions
    const cropArea = {
      left: Math.max(0, Math.round(bounds.x)),
      top: Math.max(0, Math.round(bounds.y)),
      width: Math.min(
        Math.round(bounds.width),
        imageWidth - Math.round(bounds.x)
      ),
      height: Math.min(
        Math.round(bounds.height),
        imageHeight - Math.round(bounds.y)
      ),
    };

    // Crop the annotated image according to the bounds
    // let croppedImage = annotatedImage.extract(cropArea);

    // Save the cropped annotated image with reduced quality
    console.log({ outputPath });
    await annotatedImage.jpeg({ quality: 80 }).toFile(outputPath);

    console.log("Annotated and cropped image saved at:", outputPath);

    // Clean up temporary image (commented out to keep the image for inspection)
    // if (fs.existsSync(tempImagePath)) {
    //   fs.unlinkSync(tempImagePath);
    // }
  } catch (error) {
    console.error("Error rendering annotations:", error);
    throw new Error(
      "Rendering annotations failed: " + (error as Error).message
    );
  }
}

// Example usage
// const imageUrl = "file:///Users/vshevchenko/nodeJs/input.jpeg";
// const outputPath = "output_image1.jpeg";

// Extracted from JSON data

// const bounds = {
//   x: 2888.740793552841,
//   y: 558.5614174613104,
//   width: 1686.7971678467313,
//   height: 1012.0783007080388,
// };

// renderAnnotations(imageUrl, outputPath, annotations, bounds)
//   .then(() => console.log("Annotations rendered successfully"))
//   .catch((error) => console.error("Failed to render annotations:", error));
