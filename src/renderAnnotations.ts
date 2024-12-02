import sharp from "sharp";
import axios from "axios";
import fs from "fs";  
import { Annotation } from "./types/domain";

// Add logging to verify each step
console.log("Starting renderAnnotations");

type Bounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

async function downloadImage(url: string, path: string) {
  console.log("Downloading image from URL:", url);
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

// Main renderAnnotations function
export async function renderAnnotations(
  imageUrl: string,
  outputPath: string,
  annotations: Annotation[],
  bounds: Bounds
) {
  console.log("Render annotations started");
  const tempImagePath = "temp_image.jpeg";

  try {
    console.log("Downloading image...");
    // Download the image
    await downloadImage(imageUrl, tempImagePath);
    console.log("Image downloaded.");

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

    console.log("Cropping image...");
    // Crop the image according to the bounds
    const croppedImage = sharpImage.extract(cropArea);

    // Collect SVG elements for all annotations
    const svgElements: string[] = annotations.map((annotation) => {
      const { geometry, attributes, type } = annotation;
      const [relativeX, relativeY] = geometry.coordinates as [number, number];

      switch (type) {
        case "text":
          return `<text x="${relativeX}" y="${relativeY}" font-size="${attributes?.fontSize}" fill="${attributes?.color}">${attributes?.text}</text>`;
        case "rect":
          return `<rect x="${relativeX}" y="${relativeY}" width="${attributes?.width}" height="${attributes?.height}" stroke="${attributes?.strokeColor}" stroke-width="${attributes?.strokeWidth}" fill="none" />`;
        case "arrow":
          return `<line x1="${relativeX}" y1="${relativeY}" x2="${relativeX + (attributes?.width || 0)}" y2="${relativeY + (attributes?.height || 0)}" stroke="${attributes?.strokeColor}" stroke-width="${attributes?.strokeWidth}" marker-end="url(#arrowhead)" />`;
        case "line":
          return `<line x1="${relativeX}" y1="${relativeY}" x2="${relativeX + (attributes?.width || 0)}" y2="${relativeY + (attributes?.height || 0)}" stroke="${attributes?.strokeColor}" stroke-width="${attributes?.strokeWidth}" />`;
        default:
          return "";
      }
    });

    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" 
           width="${cropArea.width}" height="${cropArea.height}">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="black" />
          </marker>
        </defs>
        ${svgElements.join("\n")}
      </svg>`;

    console.log("Merging annotations with image...");
    // Merge annotations with the cropped image
    await croppedImage
      .composite([
        {
          input: Buffer.from(svgContent),
          top: 0,
          left: 0,
          blend: "over",
        },
      ])
      .jpeg({ quality: 80 })
      .toFile(outputPath);

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

console.log("Script complete.");
