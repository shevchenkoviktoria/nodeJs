"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
function downloadImage(url, path) {
  return __awaiter(this, void 0, void 0, function* () {
    const response = yield (0, axios_1.default)({
      url,
      responseType: "stream",
    });
    return new Promise((resolve, reject) => {
      const writer = fs_1.default.createWriteStream(path);
      response.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  });
}
module.exports = function renderAnnotations(
  imageUrl,
  outputPath,
  annotations,
  bounds
) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const tempImagePath = "temp_image.jpeg";
      // Download the image
      yield downloadImage(imageUrl, tempImagePath);
      const sharpImage = (0, sharp_1.default)(tempImagePath);
      // Get image metadata to validate bounds
      const metadata = yield sharpImage.metadata();
      const imageWidth = metadata.width;
      const imageHeight = metadata.height;
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
      const overlay = (0, sharp_1.default)({
        create: {
          width: cropArea.width,
          height: cropArea.height,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      });
      // Collect SVG elements for all annotations
      const svgElements = annotations.map((annotation) => {
        const { geometry, attributes, type } = annotation;
        const [x, y] = geometry.coordinates;
        switch (type) {
          case "text":
            return `<text x="${x}" y="${y}" font-size="${
              attributes === null || attributes === void 0
                ? void 0
                : attributes.fontSize
            }" fill="${
              attributes === null || attributes === void 0
                ? void 0
                : attributes.color
            }">${
              attributes === null || attributes === void 0
                ? void 0
                : attributes.text
            }</text>`;
          case "rect":
            return `<rect x="${x}" y="${y}" width="${
              attributes === null || attributes === void 0
                ? void 0
                : attributes.width
            }" height="${
              attributes === null || attributes === void 0
                ? void 0
                : attributes.height
            }" stroke="${
              attributes === null || attributes === void 0
                ? void 0
                : attributes.strokeColor
            }" stroke-width="${
              attributes === null || attributes === void 0
                ? void 0
                : attributes.strokeWidth
            }" fill="none" />`;
          case "arrow":
            // Add SVG representation for arrow
            return `<line x1="${x}" y1="${y}" x2="${
              x +
              ((attributes === null || attributes === void 0
                ? void 0
                : attributes.width) || 0)
            }" y2="${
              y +
              ((attributes === null || attributes === void 0
                ? void 0
                : attributes.height) || 0)
            }" stroke="${
              attributes === null || attributes === void 0
                ? void 0
                : attributes.strokeColor
            }" stroke-width="${
              attributes === null || attributes === void 0
                ? void 0
                : attributes.strokeWidth
            }" marker-end="url(#arrowhead)" />`;
          case "line":
            // Add SVG representation for line
            return `<line x1="${x}" y1="${y}" x2="${
              x +
              ((attributes === null || attributes === void 0
                ? void 0
                : attributes.width) || 0)
            }" y2="${
              y +
              ((attributes === null || attributes === void 0
                ? void 0
                : attributes.height) || 0)
            }" stroke="${
              attributes === null || attributes === void 0
                ? void 0
                : attributes.strokeColor
            }" stroke-width="${
              attributes === null || attributes === void 0
                ? void 0
                : attributes.strokeWidth
            }" />`;
          case "line":
            // Add SVG representation for point
            return `<circle stroke-width="${4}" stroke-opacity="${0.2}" cx="${x}" cy="${y}" r="${attributes?.radius}" fill="${attributes?.color}" />`;
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
      yield croppedImage
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
      fs_1.default.unlinkSync(tempImagePath);
    } catch (error) {
      console.error("Error rendering annotations:", error);
      throw new Error("Rendering annotations failed: " + error.message);
    }
  });
};
