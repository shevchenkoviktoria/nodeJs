const express = require("express");
const path = require("path");
const fs = require("fs");
const renderAnnotations = require("./renderAnnotations");

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Route to handle annotation requests
app.post("/annotate-image", async (req, res) => {
  try {
    const { inputImagePath, outputImagePath, annotations, observation } = req.body;

    // Check if paths and data are provided
    if (!inputImagePath || !outputImagePath || !annotations || !observation) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Resolve input image path and check if it exists
    const inputImage = path.resolve(inputImagePath);
    if (!fs.existsSync(inputImage)) {
      return res.status(404).json({ error: "Input image not found" });
    }

    // Validate annotations and observation structure (basic checks)
    if (!Array.isArray(annotations)) {
      return res.status(400).json({ error: "Annotations must be an array" });
    }

    if (typeof observation !== "object" || !observation.geometry || !Array.isArray(observation.geometry.coordinates)) {
      return res.status(400).json({ error: "Invalid observation data" });
    }

    // Resolve output image path to save the annotated image
    const outputImage = path.resolve(outputImagePath);

    // Call renderAnnotations function
    await renderAnnotations(inputImage, outputImage, annotations, observation);

    res
      .status(200)
      .json({ message: "Image annotated successfully!", outputImagePath: outputImage });
  } catch (error) {
    console.error("Error in /annotate-image route:", error);
    res.status(500).json({
      error: "Failed to annotate the image",
      details: error.message,
    });
  }
});

// Serve static files (images) from the /images folder
app.use("/images", express.static(path.join(__dirname, "../images")));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
