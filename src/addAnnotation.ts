import sharp from "sharp";

export const addAnnotations = (
  image: sharp.Sharp,
  annotations: any[]
): sharp.Sharp => {
  let annotationPipeline = image;

  annotations.forEach((annotation) => {
    const { type, geometry, attributes } = annotation;

    // Handle different annotation types (rectangles, lines, etc.)
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
      // Add cases for other annotation types as needed
      default:
        break;
    }
  });

  return annotationPipeline;
};