import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure upload directory - make it configurable
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "../uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Improved filename format: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

// Enhanced file filter with better MIME type checking
const fileFilter = (req, file, cb) => {
  // Define allowed MIME types
  const allowedMimeTypes = {
    'image/jpeg': true,
    'image/png': true,
    'image/jpg': true,
    'application/pdf': true
  };
  
  // Check file extension for PDFs
  const fileExt = path.extname(file.originalname).toLowerCase();
  const isPDF = fileExt === '.pdf';
  
  // For PDFs, ensure both MIME type and extension match
  if (isPDF && file.mimetype !== 'application/pdf') {
    return cb(new Error('Invalid PDF file. File extension and MIME type must match.'), false);
  }
  
  if (allowedMimeTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only .jpeg, .jpg, .png, and .pdf formats are allowed. Received: ${file.mimetype}`), false);
  }
};

// Configure multer with file size limits and error handling
const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit to match frontend
    files: 1 // Limit to 1 file per request
  }
});

// Add memory storage for special routes (like bank slip prediction)
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File too large. Maximum size is 5MB.' 
      });
    }
    return res.status(400).json({ 
      success: false, 
      message: `Upload error: ${err.message}` 
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(500).json({ 
      success: false, 
      message: `Server error: ${err.message}` 
    });
  }
  // Everything went fine
  next();
};

export { upload, memoryUpload, handleMulterError };
export default upload;
