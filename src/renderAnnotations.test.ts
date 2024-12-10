import { renderAnnotations } from "./renderAnnotations";
import fs from "fs";
import path from "path";
import { AnnotationType } from "./types/domain";

describe("renderAnnotations", () => {
  it("should add annotations and crop the image, and save it locally", async () => {
    const imageUrl = path.resolve(__dirname, "../input.jpeg");
    const outputPath = path.resolve(
      __dirname,
      `output_image${Math.random()}.jpeg`
    );
    const annotations: AnnotationType[] = [
      {
        type: "rect",
        geometry: {
          coordinates: [
            [
              [3362.177317397073, 802.7027164736265],
              [4102.10143755534, 802.7027164736265],
              [4102.10143755534, 1326.4984191570325],
              [3362.177317397073, 1326.4984191570325],
              [3362.177317397073, 802.7027164736265],
            ],
          ],
          type: "Polygon",
        },
        attributes: {
          strokeWidth: "3",
          color: "#FF0000",
        },
      },
      {
        type: "arrow",
        geometry: {
          coordinates: [
            [
              [2981.3841740048774, 1066.3287818779227],
              [3286.295353126672, 736.6352390088799],
            ],
          ],
          type: "LineString",
        },
        attributes: {
          strokeWidth: "3",
          color: "#FF0000",
        },
      },
      {
        type: "line",
        geometry: {
          coordinates: [
            [
              [3553.597775886592, 627.499707062865],
              [4155.885885007791, 626.6184553274771],
            ],
          ],
          type: "LineString",
        },
        attributes: {
          strokeWidth: "3",
          color: "#FF0000",
        },
      },
      {
        type: "text",
        geometry: {
          coordinates: [
            [
              [ 2697.785349184176, 394.534148312278945],
            ],
          ],
          type: "Point",
        },
        attributes: {
          strokeWidth: "3",
          color: "#FF0000",
          fontSize: "50",
          value: "test"
        },
      },
    ];
    const bounds = {
      x: 2888,
      y: 558,
      width: 1686,
      height: 1012,
    };

    try {
      await renderAnnotations(imageUrl, outputPath, annotations, bounds);
      // Verify the output file exists
      expect(fs.existsSync(outputPath)).toBe(true);

    } catch (error) {
      console.error("Test failed:", error);
      throw error;
    }
  });
});
