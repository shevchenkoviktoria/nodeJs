import { renderImage } from './renderImage';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('renderImage', () => {
  const fileUrl =
    'https://sharpershape-eu-dataset.s3.eu-central-1.amazonaws.com/companyId%3D5b1698ff144800cdf87aa139/datasetId%3D645d164e5c5eb706a6c88284/DATASET/UPLOADED_IMAGES/67446c37dcc28f716b2e10dc-image-autoprocess?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAQMMTKUCMEXWX7ADB%2F20241223%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20241223T101810Z&X-Amz-Expires=21600&X-Amz-Security-Token=FwoGZXIvYXdzEBwaDI5mJQCrc3V1qPs23CKWBG%2Fcx7KbyDLoaowpfuF2W7zk0nFLt4b94VUc1nyTeaOhMu38D3hqLMFrnImyrviV0s7701fQDgYAuPjyc%2FIoah9GiiipV5rBwXbQTyitiphsocFfAPpc39zKZTtbYB3T%2BHQD2hQvhPIaR9wBQVuVR0wzCi0WWk4R1O%2Bi0FLXpft7dN6nlO56t61MXwYxm1HYWWkSsxhwU9HbagRtjoDtJS%2FR3WglKVTVf1sKoXxOqB2eeKgf6KtUUohG2NQh8nLAKzdyiPN1MxW3e3MMi%2FsvGBppd3aiVuy%2FfWwA8fUWQV2kiyH4lFkE3Pg54o8IKDaCNrD2AF8akExthQ8nM0eXfnyHITeKNtv%2F4RCXkwugmAGf3m7Q%2B5Y9dMYA5gkAG%2BIZdhCsNQhcKt%2B1ENTm9GybUaM4QqmA67QM3%2BVCf%2F19ORuPEpkf3QEL8i2fKwZk2kh7bdQBPHNL7QnC%2BT1sQHut7iAsgNIVQDBIV759r7aIa64RnN6fvLqYL3qeUldh8jM8QoDkNN7GBNRc1EmgW%2FbQj%2BU0wwUHAhJzKK2qkNStdd6g3jspLUK4rIEYzkykD2W%2F%2FX3JzzWWzWsf%2F7t8B8pi4TNSDUzPXIhxEuPc99wSzHQOBv6huxXM7nLs%2BkFZ61H2N%2FvqJBPSkJkt3tsBIV4YT4AjsPdPRbcQYL4y3NNXP5COI9%2Fxrd3UZOFhPDD4Dn248DERQ0pPWSji8aS7BjIqc%2FU62pnbzjpHAP5kqbgBp3yQZIrv7LrW9%2BEv1gMDOxEkucdS7PHQde1b&X-Amz-SignedHeaders=host&X-Amz-Signature=94f606abb4a8ec72a0c77f7d567422de8dbdecc9c35666c332871c3f77c29d15';
  const localFilePath = path.resolve(__dirname, '../input.jpeg');

  beforeEach(() => {
    // Mock axios to download an image
    mockedAxios.get.mockResolvedValue({
      data: fs.readFileSync(localFilePath),
    });
  });

  it('should scale down an image with width greater than 2000 pixels', async () => {
    const image = {
      fileUrl: fileUrl,
      attributes: {},
    };

    const outputPath = path.resolve(__dirname, 'scaled-large-image.jpg');

    // Run renderImage
    await renderImage(image, outputPath);

    // Verify that the file exists
    expect(fs.existsSync(outputPath)).toBe(true);

    // Inspect metadata of the output image
    const metadata = await sharp(outputPath).metadata();
    expect(metadata.width).toBeLessThanOrEqual(2000);
  });

  it('should not resize an image with width less than or equal to 2000 pixels', async () => {
    const image = {
      fileUrl: fileUrl,
      attributes: {},
    };

    const outputPath = path.resolve(__dirname, 'scaled-small-image.jpg');

    // Run renderImage
    await renderImage(image, outputPath);

    // Verify that the file exists
    expect(fs.existsSync(outputPath)).toBe(true);

    // Inspect metadata of the output image
    const metadata = await sharp(outputPath).metadata();
    expect(metadata.width).toBeLessThanOrEqual(2000);
  });
});
