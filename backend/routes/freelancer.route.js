// routes/freelancerRoutes.js
import { Router } from "express";
const router = Router();
import { auth, isFreelancer } from "../middleware/auth.js";
import {
  getProfile,
  addPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  updateSkills,
  getEarnings,
} from "../controllers/freelancerController.js";

// Profile Routes
router.get("/profile", auth, isFreelancer, getProfile);

// Portfolio & Skills
router.post("/portfolio", auth, isFreelancer, addPortfolioItem);
router.put("/portfolio/:id", auth, isFreelancer, updatePortfolioItem);
router.delete("/portfolio/:id", auth, isFreelancer, deletePortfolioItem);
router.put("/skills", auth, isFreelancer, updateSkills);

// Earnings & Analytics
router.get("/earnings", auth, isFreelancer, getEarnings);

export default router;
