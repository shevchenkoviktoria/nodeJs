import sharp from "sharp";
import { Polygon, LineString } from "geojson";
import { Annotation } from "./types/domain";


module.exports = async function renderAnnotations(
  inputPath: any,
  outputPath: any,
  annotations: any,
  observation: { geometry: { coordinates: number[]; }; }
) {
  try {
    // Load the input image
    const image = sharp(inputPath);

    // Get image metadata to validate coordinates
    const metadata = await image.metadata(); // sharp.Metadata is inferred here
    const width = metadata.width!;
    const height = metadata.height!;

    // Ensure coordinates for cropping are within bounds
    const cropArea = {
      left: Math.max(0, observation.geometry.coordinates[0] - 100),
      top: Math.max(0, observation.geometry.coordinates[1] - 100),
      width: Math.min(200, width - 100), // Ensure we don't crop outside the image bounds
      height: Math.min(200, height - 100),
    };

    // Crop the image according to observation coordinates
    const croppedImage = image.extract(cropArea);

    // Initialize a blank overlay for annotations
    const overlay = sharp({
      create: {
        width: cropArea.width,
        height: cropArea.height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    });

    // Render annotations on the overlay
    for (const annotation of annotations) {
      if (annotation.type === "text") {
        overlay.composite([
          {
            input: Buffer.from(
              `<svg>
                <text x="${annotation.geometry.coordinates[0]}" y="${
                annotation.geometry.coordinates[1]
              }" font-size="${annotation.attributes?.fontSize || 20}" fill="${
                annotation.attributes?.color || "red"
              }">${annotation.attributes?.value || ""}</text>
              </svg>`
            ),
            top: 0,
            left: 0,
          },
        ]);
      } else if (annotation.type === "rect" || annotation.type === "line") {
        const geometry = annotation.geometry as Polygon | LineString;
        const [x, y] = geometry.coordinates[0] as [number, number];

        if (annotation.type === "rect") {
          overlay.composite([
            {
              input: Buffer.from(
                `<svg>
                  <rect x="${x}" y="${y}" width="${
                  annotation.attributes?.textWidth || 100
                }" height="${annotation.attributes?.strokeWidth || 50}" fill="${
                  annotation.attributes?.color || "transparent"
                }" stroke-width="${annotation.attributes?.strokeWidth || 2}" />
                </svg>`
              ),
              top: 0,
              left: 0,
            },
          ]);
        } else if (annotation.type === "line") {
          const lineCoordinates = (annotation.geometry as LineString)
            .coordinates;
          overlay.composite([
            {
              input: Buffer.from(
                `<svg>
                  <line x1="${lineCoordinates[0][0]}" y1="${
                  lineCoordinates[0][1]
                }" x2="${lineCoordinates[1][0]}" y2="${
                  lineCoordinates[1][1]
                }" stroke="${
                  annotation.attributes?.color || "blue"
                }" stroke-width="${annotation.attributes?.strokeWidth || 2}" />
                </svg>`
              ),
              top: 0,
              left: 0,
            },
          ]);
        }
      }
    }

    // Merge annotations with the cropped image
    await croppedImage
      .composite([{ input: await overlay.toBuffer(), blend: "over" }])
      .jpeg({ quality: 80 }) // Save as JPEG with quality optimization
      .toFile(outputPath);

    console.log("Annotated image saved at:", outputPath);
  } catch (error) {
    console.error("Error rendering annotations:", error);
    throw new Error("Rendering annotations failed: " + error.message);
  }
}

