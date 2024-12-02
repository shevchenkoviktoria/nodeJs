import { renderAnnotations } from './renderAnnotations';
import fs from 'fs';
import path from 'path';

describe('renderAnnotations', () => {
  it('should crop the image, add annotations, and save it locally', async () => {
    const imageUrl = path.resolve(__dirname, '../input.jpeg'); // Adjust the path as needed
    const outputPath = path.resolve(__dirname, 'output_image.jpeg');
    const annotations = [
      {
        type: "rect" as "rect",
        geometry: {
          coordinates: [
            [
              [3362.177317397073, 802.7027164736265],
              [4102.10143755534, 802.7027164736265],
              [4102.10143755534, 1326.4984191570325],
              [3362.177317397073, 1326.4984191570325],
              [3362.177317397073, 802.7027164736265]
            ]
          ],
          type: "Polygon" as "Polygon"
        },
        attributes: {
          strokeWidth: "3"
        }
      }
    ];
    const bounds = {
      x: 2888,
      y: 558,
      width: 1686,
      height: 1012
    };

    try {
      await renderAnnotations(imageUrl, outputPath, annotations, bounds);
      console.log("Annotated image saved at:", outputPath);

      // Verify the output file exists
      expect(fs.existsSync(outputPath)).toBe(true);

      // Optionally, you can add more checks to verify the contents of the output image
    } catch (error) {
      console.error("Test failed:", error);
      throw error;
    }
  });
});