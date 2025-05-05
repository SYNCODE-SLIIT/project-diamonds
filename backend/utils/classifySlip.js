import fs from 'fs';
import {PredictionServiceClient} from '@google-cloud/automl';
import path from 'path';

// Set the correct path to your Google Cloud service account key JSON file
const client = new PredictionServiceClient({
  keyFilename: path.resolve(__dirname, '../gcloud-key.json')
});

async function classifyImage(imagePath) {
  const projectId = 'inspiring-hope-457719-s7';
  const location = 'us-central1';
  const modelId = '5533654006108258304'; // Replace with your deployed model ID

  const content = fs.readFileSync(imagePath, 'base64');
  const request = {
    name: client.modelPath(projectId, location, modelId),
    payload: { image: { imageBytes: content } }
  };
  const [response] = await client.predict(request);
  return response.payload; // Contains classification results
}

module.exports = { classifyImage };