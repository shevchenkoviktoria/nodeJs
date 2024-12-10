import sharp from "sharp";
import { AnnotationType } from "./types/domain";

export const addAnnotations = (
  image: sharp.Sharp,
  annotations: AnnotationType[],
  metadata: sharp.Metadata
): sharp.Sharp => {
  const defaultColor = "#f71212";

  const svgElements = annotations
    .map((annotation) => {
      const { type, geometry, attributes } = annotation;

      switch (type) {
        case "rect": {
          const points = geometry.coordinates[0]
            .map(([x, y]) => `${x},${y}`)
            .join(" ");
          return `
        <polygon 
          points="${points}" 
          fill="transparent" 
          stroke="${attributes?.color || defaultColor}" 
          stroke-width="${attributes?.strokeWidth || 1}" 
        />
      `;
        }

        case "arrow": {
          const [[ax1, ay1], [ax2, ay2]] = geometry.coordinates[0];
          const arrowColor = attributes?.color || defaultColor;
          const markerId = `arrowhead-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          return `
        <defs>
          <marker id="${markerId}" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="${arrowColor}" />
          </marker>
        </defs>
        <line 
          x1="${ax1}" 
          y1="${ay1}" 
          x2="${ax2}" 
          y2="${ay2}" 
          stroke="${arrowColor}" 
          stroke-width="${attributes?.strokeWidth || 1}" 
          marker-end="url(#${markerId})" 
        />
      `;
        }

        case "line": {
          const [[lx1, ly1], [lx2, ly2]] = geometry.coordinates[0];
          return `
        <line 
          x1="${lx1}" 
          y1="${ly1}" 
          x2="${lx2}" 
          y2="${ly2}" 
          stroke="${attributes?.strokeColor || defaultColor}" 
          stroke-width="${attributes?.strokeWidth || 1}" 
        />
      `;
        }

        case "text": {
          const [tx, ty] = geometry.coordinates[0][0];
          return `
        <text 
          x="${tx}" 
          y="${ty}" 
          font-size="${attributes?.fontSize || 12}" 
          fill="${attributes?.color || defaultColor}" 
          text-anchor="start"
        >
          ${attributes?.value || ""}
        </text>
      `;
        }

        case "view": {
          const [[vx1, vy1], [vx2, vy2]] = geometry.coordinates[0];
          const vwidth = vx2 - vx1;
          const vheight = vy2 - vy1;
          return `
        <rect 
          x="${vx1}" 
          y="${vy1}" 
          width="${vwidth}" 
          height="${vheight}" 
          fill="${attributes?.color || defaultColor}" 
        />
      `;
        }

        default:
          console.error(`Unsupported annotation type: ${type}`);
          return "";
      }
    })
    .join("\n");

  // Combine all annotation elements into a single SVG
  const finalSVG = `
<svg 
  xmlns="http://www.w3.org/2000/svg" 
  width="${metadata.width}" 
  height="${metadata.height}"
>
  ${svgElements}
</svg>
`;
console.log("Final SVG Content:", finalSVG)
  
  // Composite once with the constructed SVG containing all annotations
  return image.composite([{ input: Buffer.from(finalSVG) }]);
};
