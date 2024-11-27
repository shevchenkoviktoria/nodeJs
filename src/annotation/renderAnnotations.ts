import sharp from "sharp";
import axios from "axios";
import fs from "fs";
import { Annotation } from "./types/domain";

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

module.exports = async function renderAnnotations(
  imageUrl: string,
  outputPath: string,
  annotations: Annotation[],
  bounds: Bounds
) {
  try {
    const tempImagePath = "temp_image.jpeg";

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

    // Initialize a blank overlay for annotations
    const overlay = sharp({
      create: {
        width: cropArea.width,
        height: cropArea.height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    });

    // Collect SVG elements for all annotations
    const svgElements: string[] = annotations.map((annotation) => {
      const { geometry, attributes, type } = annotation;
      const [x, y] = geometry.coordinates as [number, number];

      switch (type) {
        case "text":
          return `<text x="${x}" y="${y}" font-size="${attributes?.fontSize}" fill="${attributes?.color}">${attributes?.text}</text>`;
        case "rect":
          return `<rect x="${x}" y="${y}" width="${attributes?.width}" height="${attributes?.height}" stroke="${attributes?.strokeColor}" stroke-width="${attributes?.strokeWidth}" fill="none" />`;
        case "arrow":
          // Add SVG representation for arrow
          return `<line x1="${x}" y1="${y}" x2="${x + (attributes?.width || 0)}" y2="${y + (attributes?.height || 0)}" stroke="${attributes?.strokeColor}" stroke-width="${attributes?.strokeWidth}" marker-end="url(#arrowhead)" />`;
        case "line":
          // Add SVG representation for line
          return `<line x1="${x}" y1="${y}" x2="${x + (attributes?.width || 0)}" y2="${y + (attributes?.height || 0)}" stroke="${attributes?.strokeColor}" stroke-width="${attributes?.strokeWidth}" />`;
        default:
          return "";
      }
    });

    // Combine all SVG elements into a single SVG overlay
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" 
           width="${cropArea.width}" height="${cropArea.height}">
        ${svgElements.join("\n")}
      </svg>`;

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
      .jpeg({ quality: 80 }) // Reduce quality to optimize performance
      .toFile(outputPath);

    console.log("Annotated image saved at:", outputPath);

    // Clean up temporary image
    fs.unlinkSync(tempImagePath);
  } catch (error) {
    console.error("Error rendering annotations:", error);
    throw new Error(
      "Rendering annotations failed: " + (error as Error).message
    );
  }
};
