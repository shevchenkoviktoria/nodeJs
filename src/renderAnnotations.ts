import sharp from "sharp";
import { addAnnotations } from "./addAnnotation";
import { AnnotationType, Bounds } from "./types/domain";

export async function renderAnnotations(
  imageUrl: string,
  outputPath: string,
  annotations: AnnotationType[],
  bounds: Bounds
) {
  try {
    // Load the image
    const sharpImage = sharp(imageUrl);

    // Get image metadata to validate bounds
    const metadata = await sharpImage.metadata();
    let annotatedImageBuffer = await addAnnotations(
      sharpImage,
      annotations,
      metadata
    );

    // Ensure bounds are within image dimensions
    const cropArea = {
      left: bounds.x,
      top: bounds.y,
      width: bounds.width,
      height: bounds.height,
    };

    // Save the cropped annotated image with reduced quality
    console.log({ outputPath });
    await sharp(annotatedImageBuffer)
      .extract(cropArea)
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    console.log("Annotated and cropped image saved at:", outputPath);
  } catch (error) {
    console.error("Error rendering annotations:", error);
    throw new Error(
      "Rendering annotations failed: " + (error as Error).message
    );
  }
}
