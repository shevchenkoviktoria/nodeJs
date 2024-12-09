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

export async function renderAnnotations(
  imageUrl: string,
  outputPath: string,
  annotations: AnnotationType[],
  bounds: Bounds
) {
  try {
    console.log("Starting renderAnnotations");

    const sharpImage = sharp(imageUrl);

    // Get image metadata
    const metadata = await sharpImage.metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error("Invalid image dimensions: width or height is undefined");
    }

    const imageWidth = metadata.width;
    const imageHeight = metadata.height;

    // Ensure bounds are within image dimensions
    const cropArea = {
      left: Math.max(0, Math.min(bounds.x, imageWidth)),
      top: Math.max(0, Math.min(bounds.y, imageHeight)),
      width: Math.max(1, Math.min(bounds.width, imageWidth - bounds.x)),
      height: Math.max(1, Math.min(bounds.height, imageHeight - bounds.y)),
    };

    console.log("Image dimensions:", { imageWidth, imageHeight });
    console.log("Crop area:", cropArea);

    // Add annotations to the entire image
    console.log("Adding annotations...");
    const annotatedImage = addAnnotations(sharpImage, annotations, metadata);

    // Now crop the annotated image
    console.log("Cropping the image...");
    const croppedImage = annotatedImage.extract(cropArea);

    // Save the cropped annotated image
    console.log("Saving the final image...");
    await croppedImage.jpeg({ quality: 80 }).toFile(outputPath);

    console.log("Annotated and cropped image saved at:", outputPath);
  } catch (error) {
    console.error("Error rendering annotations:", error);
    throw new Error(
      "Rendering annotations failed: " + (error as Error).message
    );
  }
}
