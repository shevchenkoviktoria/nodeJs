const express = require("express");
const path = require("path");
const renderAnnotations = require("./annotation/renderAnnotations");

const app = express();
const port = 3000;

app.post("/render-annotations", async (req, res) => {
  try {
    const inputImage = "input.jpeg";
    const outputImage = "output.jpeg";
    const annotations = [
      {
        type: "text",
        x: 50,
        y: 100,
        options: {
          text: "Observation 1",
          fontSize: 24,
          color: "red",
        },
      },
      {
        type: "rectangle",
        x: 200,
        y: 300,
        options: {
          width: 100,
          height: 50,
          color: "blue",
          strokeWidth: 3,
        },
      },
    ];
    const observation = { geometry: { coordinates: [150, 150] } };

    // Correct function call
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
