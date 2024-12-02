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
    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);
      writer.on("finish", resolve);
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
    const tempImagePath = "temp_image.tif";

    console.log(`Image URL being passed: ${imageUrl}`);
    console.log(`Downloading image from URL: ${imageUrl}`);
    await downloadImage(imageUrl, tempImagePath);

    const sharpImage = sharp(tempImagePath);

    // Get image metadata to validate bounds
    const metadata = await sharpImage.metadata();
    const imageWidth = metadata.width!;
    const imageHeight = metadata.height!;

    // Ensure bounds are within image dimensions
    const cropArea = {
      left: Math.max(0, Math.round(bounds.x)),
      top: Math.max(0, Math.round(bounds.y)),
      width: Math.min(Math.round(bounds.width), imageWidth - Math.round(bounds.x)),
      height: Math.min(Math.round(bounds.height), imageHeight - Math.round(bounds.y)),
    };

    // Crop the image according to the bounds
    let croppedImage = sharpImage.extract(cropArea);

    // Add annotations
    croppedImage = addAnnotations(croppedImage, annotations);

    // Save the annotated image with reduced quality
    await croppedImage.jpeg({ quality: 80 }).toFile(outputPath);

    console.log("Annotated image saved at:", outputPath);

    // Clean up temporary image
    if (fs.existsSync(tempImagePath)) {
      fs.unlinkSync(tempImagePath);
    }
  } catch (error) {
    console.error("Error rendering annotations:", error);
    throw new Error("Rendering annotations failed: " + (error as Error).message);
  }
}

// Example usage
const imageUrl = "file:///Users/vshevchenko/nodeJs/input.jpeg";
const outputPath = "output_image.jpeg";
const annotations: AnnotationType[] = [
  {
    type: "rect",
    geometry: {
      coordinates: [
        [
          [3362.177317397073, 802.7027164736265],
          [4102.10143755534, 802.7027164736265],
          [4102.10143755534, 1326.4984191570325],
          [3362.177317397073, 1326.4984191570325],
          [3362.177317397073, 802.7027164736265]
        ]
      ],
      type: "Polygon"
    },
    attributes: {
      strokeWidth: "3"
    }
  }
];

const bounds = {
  x: 2888,
  y: 558,
  width: 1686,
  height: 1012
};

renderAnnotations(imageUrl, outputPath, annotations, bounds)
  .then(() => console.log("Annotations rendered successfully"))
  .catch((error) => console.error("Failed to render annotations:", error));