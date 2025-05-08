import express from "express";
import { protect } from "../middleware/authmiddleware.js";
import { getDashboardData, getAdminDashboardData } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/", protect, getDashboardData);
router.get("/admin", protect, getAdminDashboardData);

export default router;
