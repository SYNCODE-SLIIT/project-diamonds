import { PredictionServiceClient } from '@google-cloud/aiplatform';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config(); 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the Vertex AI client
const client = new PredictionServiceClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: path.resolve(__dirname, '../gcloud-key.json'),
});

// Function to predict bank slip authenticity
export async function predictBankSlip(imageBuffer) {
  try {
    const endpoint = `projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/locations/${process.env.GOOGLE_CLOUD_LOCATION}/endpoints/${process.env.GOOGLE_CLOUD_ENDPOINT_ID}`;
    
    // Convert image to base64
    const base64Image = imageBuffer.toString('base64');
    
    const instance = {
      content: base64Image,
    };

    const request = {
      endpoint,
      instances: [instance],
    };

    const [response] = await client.predict(request);
    return response;
  } catch (error) {
    console.error('Error predicting bank slip:', error);
    throw error;
  }
}

// Function to interpret prediction results
export function interpretPrediction(prediction) {
  try {
    if (!prediction || !prediction.predictions || !prediction.predictions[0]) {
      return {
        isAuthentic: false,
        confidence: 0,
        error: 'Invalid prediction response'
      };
    }

    const result = prediction.predictions[0];
    const realIndex = result.displayNames.indexOf('real');
    const fakeIndex = result.displayNames.indexOf('fake');
    
    const realConfidence = realIndex !== -1 ? result.confidences[realIndex] : 0;
    const fakeConfidence = fakeIndex !== -1 ? result.confidences[fakeIndex] : 0;
    
    return {
      isAuthentic: realConfidence > fakeConfidence,
      confidence: Math.max(realConfidence, fakeConfidence),
      realConfidence,
      fakeConfidence,
      prediction: realConfidence > fakeConfidence ? 'real' : 'fake'
    };
  } catch (error) {
    console.error('Error interpreting prediction:', error);
    return {
      isAuthentic: false,
      confidence: 0,
      error: error.message
    };
  }
} 