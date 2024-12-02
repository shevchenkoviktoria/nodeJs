import sharp from "sharp";

export const addAnnotations = (
  image: sharp.Sharp,
  annotations: any[]
): sharp.Sharp => {
  let annotationPipeline = image;

  annotations.forEach((annotation) => {
    const { type, geometry, attributes } = annotation;

    //  annotation types (rectangles, lines, etc.)
    switch (type) {
      case "rect":
        annotationPipeline = annotationPipeline.composite([
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
        annotationPipeline = annotationPipeline.composite([
          {
            input: Buffer.from(
              `<svg><line x1="${geometry.coordinates[0]}" y1="${geometry.coordinates[1]}" x2="${geometry.coordinates[2]}" y2="${geometry.coordinates[3]}" stroke="${attributes?.strokeColor}" stroke-width="${attributes?.strokeWidth}"/></svg>`
            ),
            blend: "over",
          },
        ]);
        break;
      case "text":
        annotationPipeline = annotationPipeline.composite([
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

  return annotationPipeline;
};
