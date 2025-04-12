import express from "express";
import { auth, isFreelancer } from "../middleware/auth.js";
import {
  createGig,
  getAllGigs,
  getGigById,
  updateGig,
  deleteGig,
} from "../controllers/gigController.js";

const router = express.Router();

// Public routes
router.get("/", getAllGigs);
router.get("/:id", getGigById);

// Protected routes (Freelancer only)
router.post("/", auth, isFreelancer, createGig);
router.put("/:id", auth, isFreelancer, updateGig);
router.delete("/:id", auth, isFreelancer, deleteGig);

export default router;
