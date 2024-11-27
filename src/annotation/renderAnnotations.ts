import sharp from "sharp";
import { Polygon, LineString, Point } from "geojson";
import { Annotation, IssueImage } from "./types/domain";


type Bounds = {
  x: number
  y: number
  width: number
  height: number
}

module.exports = async function renderAnnotations(
  inputPath: string,
  outputPath: string,
  annotations: Annotation[],
  bounds: Bounds
) {
  try {
    
    const imageBounds = bounds;

    if (!imageBounds) {
      throw new Error("Image bounds are not defined.");
    }
    if (!bounds) {
      throw new Error("Image bounds are not defined.");
    }

    // Load the input image
    const sharpImage = sharp(inputPath);

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

    // Collect SVG elements for all annotations
    const svgElements: string[] = annotations.map((annotation) => {
      const { geometry, attributes, type } = annotation;
      const [x, y] = geometry.coordinates as [number, number];

      switch (type) {
        case "text": {
          const fontSize = attributes?.fontSize || 20;
          const color = attributes?.color || "red";
          const text = attributes?.value || "";

          return `
            <text x="${x - cropArea.left}" y="${y - cropArea.top}" 
                  font-size="${fontSize}" fill="${color}">
              ${text}
            </text>`;
        }
        case "rect": {
          const annotation = {
            type: "rect", // or "line"
            geometry: {
              type: "Polygon", // or "LineString"
              coordinates: [
                [10, 20],
                [30, 40],
              ],
            },
          };
          if (annotation.type === "rect" || annotation.type === "line") {
            const geometry = annotation.geometry as Polygon | LineString;

            if (
              geometry.coordinates[0] &&
              geometry.coordinates[0].length >= 2
            ) {
              const [x, y] = geometry.coordinates[0] as [number, number];
              console.log("Coordinates:", x, y);
            } else {
              console.error(
                "Invalid geometry format or insufficient coordinates."
              );
            }
          }
          const width = attributes?.textWidth || 100;
          const height = attributes?.strokeWidth || 50;
          const color = attributes?.color || "transparent";
          const strokeWidth = attributes?.strokeWidth || 2;

          const rectX = x;
          const rectY = y;

          return `
            <rect x="${rectX - cropArea.left}" y="${rectY - cropArea.top}" 
                  width="${width}" height="${height}" 
                  fill="${color}" stroke="black" stroke-width="${strokeWidth}" />`;
        }
        case "line": {
          const lineCoordinates = (geometry as LineString).coordinates;
          const x1 = lineCoordinates[0][0] - cropArea.left;
          const y1 = lineCoordinates[0][1] - cropArea.top;
          const x2 = lineCoordinates[1][0] - cropArea.left;
          const y2 = lineCoordinates[1][1] - cropArea.top;
          const color = attributes?.color || "blue";
          const strokeWidth = attributes?.strokeWidth || 2;

          return `
            <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                  stroke="${color}" stroke-width="${strokeWidth}" />`;
        }
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
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    console.log("Annotated image saved at:", outputPath);
  } catch (error) {
    console.error("Error rendering annotations:", error);
    throw new Error("Rendering annotations failed: " + error.message);
  }
};
