const renderAnnotations = require("./renderAnnotations");

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
      strokeColor: "blue",
      strokeWidth: 2,
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
