"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
function renderAnnotations(inputPath, outputPath, annotations, observation) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        try {
            // Load the input image
            const image = (0, sharp_1.default)(inputPath);
            // Get image metadata to validate coordinates
            const metadata = yield image.metadata(); // sharp.Metadata is inferred here
            const width = metadata.width;
            const height = metadata.height;
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
            const overlay = (0, sharp_1.default)({
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
                            input: Buffer.from(`<svg>
                <text x="${annotation.geometry.coordinates[0]}" y="${annotation.geometry.coordinates[1]}" font-size="${((_a = annotation.attributes) === null || _a === void 0 ? void 0 : _a.fontSize) || 20}" fill="${((_b = annotation.attributes) === null || _b === void 0 ? void 0 : _b.color) || "red"}">${((_c = annotation.attributes) === null || _c === void 0 ? void 0 : _c.value) || ""}</text>
              </svg>`),
                            top: 0,
                            left: 0,
                        },
                    ]);
                }
                else if (annotation.type === "rect" || annotation.type === "line") {
                    const geometry = annotation.geometry; // Type casting to handle geometry
                    const [x, y] = geometry.coordinates[0];
                    if (annotation.type === "rect") {
                        overlay.composite([
                            {
                                input: Buffer.from(`<svg>
                  <rect x="${x}" y="${y}" width="${((_d = annotation.attributes) === null || _d === void 0 ? void 0 : _d.textWidth) || 100}" height="${((_e = annotation.attributes) === null || _e === void 0 ? void 0 : _e.strokeWidth) || 50}" fill="${((_f = annotation.attributes) === null || _f === void 0 ? void 0 : _f.color) || "transparent"}" stroke="${((_g = annotation.attributes) === null || _g === void 0 ? void 0 : _g.strokeWidth) || "blue"}" stroke-width="${((_h = annotation.attributes) === null || _h === void 0 ? void 0 : _h.strokeWidth) || 2}" />
                </svg>`),
                                top: 0,
                                left: 0,
                            },
                        ]);
                    }
                    else if (annotation.type === "line") {
                        const lineCoordinates = annotation.geometry
                            .coordinates;
                        overlay.composite([
                            {
                                input: Buffer.from(`<svg>
                  <line x1="${lineCoordinates[0][0]}" y1="${lineCoordinates[0][1]}" x2="${lineCoordinates[1][0]}" y2="${lineCoordinates[1][1]}" stroke="${((_j = annotation.attributes) === null || _j === void 0 ? void 0 : _j.color) || "blue"}" stroke-width="${((_k = annotation.attributes) === null || _k === void 0 ? void 0 : _k.strokeWidth) || 2}" />
                </svg>`),
                                top: 0,
                                left: 0,
                            },
                        ]);
                    }
                }
            }
            // Merge annotations with the cropped image
            yield croppedImage
                .composite([{ input: yield overlay.toBuffer(), blend: "over" }])
                .jpeg({ quality: 80 }) // Save as JPEG with quality optimization
                .toFile(outputPath); // The output path should have .jpeg extension
            console.log("Annotated image saved at:", outputPath);
        }
        catch (error) {
            console.error("Error rendering annotations:", error);
            throw new Error("Rendering annotations failed: " + error.message);
        }
    });
}
exports.default = renderAnnotations;
//# sourceMappingURL=renderAnnotations.js.map