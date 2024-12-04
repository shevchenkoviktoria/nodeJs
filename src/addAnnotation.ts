import sharp from "sharp";
import { AnnotationType } from "./types/domain";

export const addAnnotations = (
  image: sharp.Sharp,
  annotations: AnnotationType[],
  metadata: sharp.Metadata
): sharp.Sharp => {
  let annotationPipeline = image;

  annotations.forEach((annotation) => {
    const { type, geometry, attributes } = annotation;

    console.log(annotations, "Adding the annotations");

    const defaultColor = "#f71212";

    // Handle different annotation types
    //generate new sript render rec annotation on the img (maybe missing svg paramenters) svg in the
    switch (type) {
      case "rect": {
        const points = geometry.coordinates[0]
          .map(([x, y]) => `${x},${y}`)
          .join(" ");
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${metadata.width}" height="${metadata.height}">
            <polygon points="${points}" fill="transparent" stroke="${attributes?.color || defaultColor}" stroke-width="${attributes?.strokeWidth || 1}" />
          </svg>
        `;
        annotationPipeline = annotationPipeline.composite([{ input: Buffer.from(svg) }]);
        break;
      }
      case "arrow": {
        const [[ax1, ay1], [ax2, ay2]] = geometry.coordinates[0];
        //specify the svg widht and height
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${metadata.width}" height="${metadata.height}"> 
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="${attributes?.color || defaultColor}" />
              </marker>
            </defs>
            <line x1="${ax1}" y1="${ay1}" x2="${ax2}" y2="${ay2}" stroke="${attributes?.color || defaultColor}" stroke-width="${attributes?.strokeWidth || 1}" marker-end="url(#arrowhead)" />
          </svg>
        `;
        annotationPipeline = annotationPipeline.composite([{ input: Buffer.from(svg) }]);
        break;
      }
      case "line": {
        const [[lx1, ly1], [lx2, ly2]] = geometry.coordinates[0];
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${metadata.width}" height="${metadata.height}">
            <line x1="${lx1}" y1="${ly1}" x2="${lx2}" y2="${ly2}" stroke="${attributes?.strokeColor || defaultColor}" stroke-width="${attributes?.strokeWidth || 1}" />
          </svg>
        `;
        annotationPipeline = annotationPipeline.composite([{ input: Buffer.from(svg) }]);
        break;
      }
      case "text": {
        const [tx, ty] = geometry.coordinates[0][0];
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${metadata.width}" height="${metadata.height}">
            <text x="${tx}" y="${ty}" font-size="${attributes?.fontSize || 12}" fill="${attributes?.color || defaultColor}" text-anchor="start">${attributes?.value || ""}</text>
          </svg>
        `;
        annotationPipeline = annotationPipeline.composite([{ input: Buffer.from(svg) }]);
        break;
      }
      case "view": {
        const [[vx1, vy1], [vx2, vy2]] = geometry.coordinates[0];
        const vwidth = vx2 - vx1;
        const vheight = vy2 - vy1;
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${metadata.width}" height="${metadata.height}">
            <rect x="${vx1}" y="${vy1}" width="${vwidth}" height="${vheight}" fill="${attributes?.color || defaultColor}" />
          </svg>
        `;
        annotationPipeline = annotationPipeline.composite([{ input: Buffer.from(svg) }]);
        break;
      }
      default:
        console.error(`Unsupported annotation type: ${type}`);
        break;
    }
  });

  return annotationPipeline;
};
