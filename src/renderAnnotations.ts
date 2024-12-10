import sharp from "sharp";
import path from "path";
import { addAnnotations } from "./addAnnotation";
import { AnnotationType, Bounds } from "./types/domain";

export async function renderAnnotations(
  imageUrl: string,
  outputPath: string,
  annotations: AnnotationType[],
  bounds: Bounds
) {
  try {
    console.log("Starting renderAnnotations");
    // Load the image
    const sharpImage = sharp(imageUrl);

    // Add annotations to the entire image

    // Get image metadata to validate bounds
    const metadata = await sharpImage.metadata();
    let annotatedImage = addAnnotations(sharpImage, annotations, metadata);
    const imageWidth = metadata.width!;
    const imageHeight = metadata.height!;
    console.log(`Image dimensions: ${imageWidth}x${imageHeight}`);

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
    let croppedImage = annotatedImage.extract(cropArea);

    // Save the cropped annotated image with reduced quality
    console.log({ outputPath });
    await croppedImage.jpeg({ quality: 80 }).toFile(outputPath);

    console.log("Annotated and cropped image saved at:", outputPath);
  } catch (error) {
    console.error("Error rendering annotations:", error);
    throw new Error(
      "Rendering annotations failed: " + (error as Error).message
    );
  }
}
