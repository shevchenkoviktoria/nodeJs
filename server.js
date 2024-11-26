const express = require("express");
const path = require("path");
const renderAnnotations = require("./annotations/renderAnnotations");

const app = express();
const port = 3000;

// Route for rendering annotations on an image
app.post("/render-annotations", async (req, res) => {
  // Example input data - you'd get these from the request body or other sources
  const inputImage = path.join(__dirname, "images", "input-image.jpeg");  // Your input image
  const outputImage = path.join(__dirname, "output", "output-image.jpeg");  // The output path
  const annotations = [
    {
      type: "text",
      x: 50,
      y: 50,
      options: {
        text: "Example Text",
        fontSize: 20,
        color: "blue",
      },
    },
    {
      type: "rectangle",
      x: 100,
      y: 100,
      options: {
        width: 50,
        height: 50,
        fill: "transparent",
        stroke: "red",
        strokeWidth: 3,
      },
    },
  ];
  const observation = {
    geometry: {
      coordinates: [150, 150],  // Coordinates for cropping based on the observation
    },
  };

  try {
    await renderAnnotations(inputImage, outputImage, annotations, observation);
    res.send("Image with annotations has been saved successfully.");
  } catch (error) {
    res.status(500).send("Error rendering annotations: " + error.message);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
