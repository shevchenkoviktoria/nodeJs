const downloadImage = require("./downloadImage"); // Import the downloadImage function
const path = "./image.tif"; // Define the local path for saving the image
const imageUrl =
  "https://cdn.us-1.sharpershape.services/cog/companyId=601a68bf2c3ff80001471317/datasetId=620268227bdd0b231b3e5326/66cdb01f5a451c56259dbd0d.tif"; // Your image URL

// Call the function to download the image
downloadImage(imageUrl, path)
  .then(() => {
    console.log("Image downloaded successfully");
    // Continue with the image processing or annotation logic here
  })
  .catch((err) => {
    console.error("Error downloading image:", err);
  });
