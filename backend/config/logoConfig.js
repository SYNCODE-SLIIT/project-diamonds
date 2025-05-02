import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the frontend logo
export const LOGO_PATH = path.join(__dirname, '../../frontend/src/assets/logos/Realistic_Golden_Logo_Mockup.png');

// Fallback logo path (if frontend logo is not accessible)
export const FALLBACK_LOGO_PATH = path.join(__dirname, '../../frontend/src/assets/logos/logo.jpeg'); 