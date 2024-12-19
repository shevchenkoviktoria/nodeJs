import sharp from "sharp";
import axios from "axios";


const imageUrl = "https://sharpershape-eu-dataset.s3.eu-central-1.amazonaws.com/companyId%3D5b1698ff144800cdf87aa139/datasetId%3D645d164e5c5eb706a6c88284/DATASET/UPLOADED_IMAGES/67446c37dcc28f716b2e10dc-image-autoprocess?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAQMMTKUCMPDJZPWWA%2F20241218%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20241218T114028Z&X-Amz-Expires=21600&X-Amz-Security-Token=FwoGZXIvYXdzEKP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDNsWQDITEKMZJzRLJCKWBAqAlryUVJQn9fWwPEcUu%2FRLMQtEOKY0lOcXA5IPTwG8gWvKtiHPQg%2BpmyQF7dIPNuhWQtCL31s8YlV7wBN6Kj0FEbfcWUqA1vMvS63G%2Bw9fbSOFL5m%2FS7ex1GQmXJw7X23qRlZfGxvfBZ6%2FoWNLB6cjpwC%2FOufO%2FOXkzr04%2F%2Btp%2BhuPNS%2BIDCxCk45rrry2K7vDmuBPP1Kh2i7kj%2BIheXe9%2FaGVXWrmIldb8vaKvubROLjfobGgCIzdMn6WlRkEnrXQxzbpKTvEhEmKiq2ZbW%2BAVXfScfJ9UtGtvxiU5FpXu%2F0vslu49AqNg%2FoHV2ZYP0OFQ7%2BcDIXv60ZQa6bDAkL0rvDF8ar9P1bbigNS1WSepnAzI%2Bd%2FayUUlgQp5GqR%2FeBsSdmgnYN6wFWgbdrzna1AeG9CvrBsPAKl1VV0eupZzutRqpoZfMPZ6RdmDW%2BTgKdsicYRFCDcDfmvlqdQa2XhlWW%2F2xp55oE36T0GtixaUdN0JqHuW6bhc2OvwxPdg2J4SSVAhehOUvgzIU3andrCTYpV4O42hVfKsacpYUWvTMH6hXspGOZwLygUePH97ud8uZ0BQtyifKWTg8UcZ1tYmHsDAvbap%2BsiYpBcJCAVnSiriO1qBZsuFlxLICTXtPfAP2oEPHMv0vS%2FFCzNLOizgcaNOVfXZX54A5Y%2B8hqIf9LK%2FV28scGW%2FkGbqd%2BkWlf2tqLT1SjaoYq7BjIqGuQu8Hh6Nx5ylUagX4CzSZhP4JQG3%2B7iJCyGtUuBweFCmX0ibaHtf8Km&X-Amz-SignedHeaders=host&X-Amz-Signature=9eefe4b57f07558a9142a14ea0ce464c632fb543d7b78652bb80d3a5250f5a15";
const outputPath = "./output/scaled-image.jpg";

async function downloadImageBuffer(imageUrl: string) {
  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
  return Buffer.from(response.data);
}

export async function renderAnnotations(imageUrl: string, outputPath: string) {
  try {
    // Step 1: Download the image as a buffer
    const imageBuffer = await downloadImageBuffer(imageUrl);

    // Step 2: Load the image into Sharp
    const sharperImage = sharp(imageBuffer);

    // Step 3: Get image metadata to ensure processing
    const metadata = await sharperImage.metadata();

    console.log("Original image dimensions:", metadata.width, "x", metadata.height);

    // Step 4: Resize the image to 2000 pixels width, maintaining aspect ratio
    await sharperImage
      .resize({ width: 2000 }) // Resize width to 2000 pixels, height adjusts automatically
      .jpeg({ quality: 80 }) // Save as JPEG with 80% quality
      .toFile(outputPath); // Save the resized image to the output path

    console.log("Scaled image saved at:", outputPath);
  } catch (error) {
    console.error("Error rendering annotations:", error);
    if (error instanceof Error) {
      throw new Error("Rendering annotations failed: " + error.message);
    } else {
      throw new Error("Rendering annotations failed: " + String(error));
    }
  }
}

renderAnnotations(imageUrl, outputPath);
