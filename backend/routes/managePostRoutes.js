import express from "express";
import multer from "multer";
import {
  createMedia,
  getAllMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
} from "../controllers/managePostController.js";

const   router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

// File filter to allow only image or video files
const fileFilter = (req, file, cb) => {
  // Allow images and videos
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and videos are allowed."), false);
  }
};

const upload = multer({ storage, fileFilter });

// Define Routes
router.post("/createmedia", upload.single("file"), createMedia);
router.get("/viewmedia", getAllMedia);
router.get("/view/:id", getMediaById);
router.put("/update/:id", upload.single("file"), updateMedia);
router.delete("/delete/:id", deleteMedia);
  

export default router;
