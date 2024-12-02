import { Annotation } from "./types/domain";
import { renderAnnotations } from "./renderAnnotations";
import fs from "fs";

describe("renderAnnotations", () => {
  const testImageUrl = "`file:///Users/vshevchenko/nodeJs/input.jpeg`";
  const outputPath = "file:///Users/vshevchenko/nodeJs/output_image.jpeg"; 
  const bounds = { x: 50, y: 50, width: 200, height: 150 }; // Crop bounds
  const annotations: Annotation[] = [
    {
      geometry: { type: "Point", coordinates: [60, 70] },
      attributes: { text: "Sample", fontSize: "12", color: "red" },
      type: "text",
    },
    {
      geometry: { type: "Point", coordinates: [80, 90] },
      attributes: {
        width: 50,
        height: 30,
        strokeColor: "blue",
        strokeWidth: 2,
      },
      type: "rect",
    },
  ];

  // Ensure output directory exists
  beforeAll(() => {
    if (!fs.existsSync("output")) {
      fs.mkdirSync("output");
    }
  });

  it("should crop the image, add annotations, and save it locally", async () => {
    try {
      // Call the function
      await renderAnnotations(testImageUrl, outputPath, annotations, bounds);

      // Check if the output file was created
      expect(fs.existsSync(outputPath)).toBe(true);

      // Additional checks can be performed, such as verifying dimensions
      const sharp = require("sharp");
      const metadata = await sharp(outputPath).metadata();

      expect(metadata.width).toBe(bounds.width);
      expect(metadata.height).toBe(bounds.height);
    } catch (error) {
      console.error("Test failed:", error);
      throw error;
    }
  });

  // Clean up after tests
  afterAll(() => {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  });
});
