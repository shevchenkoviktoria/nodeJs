const sharp = require("sharp");
const downloadImage = require("./downloadImage");
const fs = require("fs");
const path = "./image.jpeg";
const imageUrl =
  "https://cdn.us-1.sharpershape.services/cog/companyId=601a68bf2c3ff80001471317/datasetId=620268227bdd0b231b3e5326/66cdb01f5a451c56259dbd0d.tif"; // Your image URL

const annotations = [
  {
    type: "rect",
    geometry: { coordinates: [100, 100, 300, 300] },
    attributes: { strokeColor: "red", strokeWidth: 3 },
  },
  {
    type: "line",
    geometry: { coordinates: [50, 50, 300, 300] },
    attributes: { strokeColor: "blue", strokeWidth: 2 },
  },
  {
    type: "text",
    geometry: { coordinates: [200, 200] },
    attributes: { fontSize: 30, color: "green", text: "Sample Text" },
  },
];

// Function to apply annotations
function applyAnnotations(image, annotations) {
  let annotatedImage = image;

  annotations.forEach((annotation) => {
    const { type, geometry, attributes } = annotation;

    switch (type) {
      case "rect":
        annotatedImage = annotatedImage.composite([
          {
            input: Buffer.from(
              `<svg><polygon points="${geometry.coordinates.join(
                " "
              )}" fill="transparent" stroke="${
                attributes?.strokeColor
              }" stroke-width="${attributes?.strokeWidth}"/></svg>`
            ),
            blend: "over",
          },
        ]);
        break;

      case "line":
        annotatedImage = annotatedImage.composite([
          {
            input: Buffer.from(
              `<svg><line x1="${geometry.coordinates[0]}" y1="${geometry.coordinates[1]}" x2="${geometry.coordinates[2]}" y2="${geometry.coordinates[3]}" stroke="${attributes?.strokeColor}" stroke-width="${attributes?.strokeWidth}"/></svg>`
            ),
            blend: "over",
          },
        ]);
        break;

      case "text":
        annotatedImage = annotatedImage.composite([
          {
            input: Buffer.from(
              `<svg><text x="${geometry.coordinates[0]}" y="${geometry.coordinates[1]}" font-size="${attributes?.fontSize}" fill="${attributes?.color}">${attributes?.text}</text></svg>`
            ),
            blend: "over",
          },
        ]);
        break;

      default:
        break;
    }
  });

  return annotatedImage;
}

// Process the image
downloadImage(imageUrl, path)
  .then(() => {
    console.log("Image downloaded successfully");

    // Start image processing with Sharp
    sharp(path)
      .metadata()
      .then((metadata) => {
        // Log image metadata
        console.log("Image metadata:", metadata);

        // Apply annotations
        let imageWithAnnotations = sharp(path);
        imageWithAnnotations = applyAnnotations(
          imageWithAnnotations,
          annotations
        );

        // Save the image with annotations
        const outputPath = "./output_annotated_image.tif";
        imageWithAnnotations.toFile(outputPath, (err, info) => {
          if (err) {
            console.error("Error saving annotated image:", err);
          } else {
            console.log("Annotated image saved:", info);
          }
        });
      })
      .catch((err) => {
        console.error("Error processing image metadata:", err);
      });
  })
  .catch((err) => {
    console.error("Error downloading image:", err);
  });
