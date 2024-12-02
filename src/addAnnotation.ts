import sharp from "sharp";
import { AnnotationType } from "./types/domain";

export const addAnnotations = (
  image: sharp.Sharp,
  annotations: AnnotationType[]
): sharp.Sharp => {
  let annotationPipeline = image;

  annotations.forEach((annotation) => {
    const { type, geometry, attributes } = annotation;

    switch (type) {
      case "rect":
        annotationPipeline = annotationPipeline.composite([
          {
            input: Buffer.from(
              `<svg><polygon points="${geometry.coordinates[0]
                .map((point) => {
                  if (point.length === 2) {
                    const [x, y] = point;
                    return `${x},${y}`;
                  }
                  return "";
                })
                .join(" ")}" fill="transparent" stroke="${
                attributes?.strokeColor
              }" stroke-width="${attributes?.strokeWidth}"/></svg>`
            ),
            blend: "over",
          },
        ]);
        break;
      case "arrow":
        const [[ax1, ay1], [ax2, ay2]] = geometry.coordinates[0];
        annotationPipeline = annotationPipeline.composite([
          {
            input: Buffer.from(
              `<svg>
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" />
                  </marker>
                </defs>
                <line x1="${ax1}" y1="${ay1}" x2="${ax2}" y2="${ay2}" stroke="${attributes?.strokeColor}" stroke-width="${attributes?.strokeWidth}" marker-end="url(#arrowhead)" />
              </svg>`
            ),
            blend: "over",
          },
        ]);
        break;
      case "line":
        const [[lx1, ly1], [lx2, ly2]] = geometry.coordinates[0];
        annotationPipeline = annotationPipeline.composite([
          {
            input: Buffer.from(
              `<svg>
                <line x1="${lx1}" y1="${ly1}" x2="${lx2}" y2="${ly2}" stroke="${attributes?.strokeColor}" stroke-width="${attributes?.strokeWidth}" />
              </svg>`
            ),
            blend: "over",
          },
        ]);
        break;
      case "text":
        const [tx, ty] = geometry.coordinates[0][0];
        annotationPipeline = annotationPipeline.composite([
          {
            input: Buffer.from(
              `<svg>
                <text x="${tx}" y="${ty}" font-size="${attributes?.fontSize}" fill="${attributes?.color}">${attributes?.text}</text>
              </svg>`
            ),
            blend: "over",
          },
        ]);
        break;
      case "view":
        const [[vx1, vy1], [vx2, vy2]] = geometry.coordinates[0];
        const vwidth = vx2 - vx1;
        const vheight = vy2 - vy1;
        annotationPipeline = annotationPipeline.composite([
          {
            input: Buffer.from(
              `<svg>
                <rect x="${vx1}" y="${vy1}" width="${vwidth}" height="${vheight}" fill="${attributes?.color}" />
              </svg>`
            ),
            blend: "over",
          },
        ]);
        break;
      case "pin":
        const [px, py] = geometry.coordinates[0][0];
        annotationPipeline = annotationPipeline.composite([
          {
            input: Buffer.from(
              `<svg>
                <path stroke="${
                  attributes?.strokeColor
                }" stroke-opacity="${0.2}" stroke-width="${
                attributes?.strokeWidth
              }" d="M${px} ${py}h3a3 3 0 10-3-3v3z" />
              </svg>`
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
