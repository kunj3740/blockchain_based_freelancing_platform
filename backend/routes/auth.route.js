// routes/authRoutes.js
import { Router } from "express";
const router = Router();
// import { auth } from "../middleware/auth";
import {
  registerBuyer,
  registerFreelancer,
  loginFreelancer,
  loginClient,
  // getMe,
  // updatePassword,
} from "../controllers/authController.js";

// Authentication Routes
router.post("/register/client", registerBuyer);
router.post("/register/freelancer", registerFreelancer);
router.post("/login/freelancer", loginFreelancer);
router.post("/login/client", loginClient);

// router.get("/me", auth, getMe);
// router.put("/update-password", auth, updatePassword);

export default router;
