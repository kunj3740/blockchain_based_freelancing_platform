// routes/buyerRoutes.js
import { Router } from "express";
const router = Router();
import { auth, isBuyer } from "../middleware/auth.js";
import {
  getProfile,
  // updateProfile,
  // deleteProfile,
  getMyOrders,
  // getPaymentHistory,
  addPaymentMethod,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  // createReview,
} from "../controllers/buyerController.js";

// Profile Routes
router.get("/profile", auth, isBuyer, getProfile);
// router.put("/profile", auth, isBuyer, updateProfile);
// router.delete("/profile", auth, isBuyer, deleteProfile);

// Orders & Payments
router.get("/orders", auth, isBuyer, getMyOrders);
// router.get("/payments", auth, isBuyer, getPaymentHistory);
router.post("/payment-methods", auth, isBuyer, addPaymentMethod);

// Favorites & Reviews
router.get("/favorites", auth, isBuyer, getFavorites);
router.post("/favorites/:gigId", auth, isBuyer, addToFavorites);
router.delete("/favorites/:gigId", auth, isBuyer, removeFromFavorites);
// router.post("/reviews", auth, isBuyer, createReview);

export default router;
