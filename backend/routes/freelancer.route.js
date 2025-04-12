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
  getAllFreelancer,
  addEducation,
  addExperience
} from "../controllers/freelancerController.js";

// Profile Routes
router.get("/profile", auth, isFreelancer, getProfile);
router.get("/getAllFreelancer", auth, getAllFreelancer);

// Portfolio & Skills
router.put("/portfolio/:id", auth, isFreelancer, updatePortfolioItem);
router.delete("/portfolio/:id", auth, isFreelancer, deletePortfolioItem);
// routes/freelancerRoutes.js
router.post("/education", auth, isFreelancer, addEducation);
router.post('/experience', auth, addExperience);
router.post('/portfolio', auth, addPortfolioItem);
router.put("/skills", auth, isFreelancer, updateSkills);

// Earnings & Analytics
router.get("/earnings", auth, isFreelancer, getEarnings);

export default router;
