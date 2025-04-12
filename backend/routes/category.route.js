// routes/categoryRoutes.js
import { Router } from "express";
const router = Router();
import { auth, isAdmin } from "../middleware/auth.js";
import {
  getAllCategories,
  getCategoryById,
  // getGigsByCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
} from "../controllers/categoryController.js";

// Public Routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
// router.get("/:id/gigs", getGigsByCategory);

// Admin Only Routes
router.post("/", auth, createCategory);
router.put("/:id", auth, updateCategory);
router.delete("/:id", auth, deleteCategory);
router.post("/:id/subcategories", auth, addSubcategory);

export default router;
