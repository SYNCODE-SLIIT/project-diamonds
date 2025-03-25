import express from "express";
import multer from "multer";
import {
  createMedia,
  getAllMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
} from "../controllers/managePostController.js";

const router = express.Router();

// File upload configuration using Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), // Uploads folder
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// Define Routes
router.post("/createmedia", upload.single("file"), createMedia);
router.get("/viewmedia", getAllMedia);
router.get("/view/:id", getMediaById);
router.put("/upload:id", upload.single("file"), updateMedia);
router.delete("/delete:id", deleteMedia);


export default router;
