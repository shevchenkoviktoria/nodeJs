const renderAnnotations = require("./annotation/renderAnnotations");

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
      // Add rectangle options here
    },
  },
];

// Call the renderAnnotations function with the necessary parameters
renderAnnotations(inputImage, outputImage, annotations)
  .then(() => {
    console.log("Annotations rendered successfully.");
  })
  .catch((error) => {
    console.error("Error rendering annotations:", error);
  });
