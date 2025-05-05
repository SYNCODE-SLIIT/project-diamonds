import vision from '@google-cloud/vision';
import path from 'path';

// TODO: Set the correct path to your Google Cloud service account key JSON file
const client = new vision.ImageAnnotatorClient({
  keyFilename: path.resolve(__dirname, '../gcloud-key.json') // <-- update this path if needed
});

async function extractTextFromImage(imagePath) {
  const [result] = await client.textDetection(imagePath);
  const detections = result.textAnnotations;
  return detections[0] ? detections[0].description : '';
}

module.exports = { extractTextFromImage };