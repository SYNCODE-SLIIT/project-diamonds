import express from "express";
import { upload } from "../middleware/upload.js";
import {
  createMedia,
  getAllMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
  likeMedia,
  addComment,
  saveMedia,
} from "../controllers/managePostController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Media routes
router.post("/upload", verifyToken, upload.single("file"), createMedia);
router.get("/all", getAllMedia);
router.get("/view/:id", getMediaById);
router.put("/update/:id", verifyToken, upload.single("file"), updateMedia);
router.delete("/delete/:id", verifyToken, deleteMedia);

// Social features
router.post("/like/:id", verifyToken, likeMedia);
router.post("/comment/:id", verifyToken, addComment);
router.post("/save/:id", verifyToken, saveMedia);

export default router; 