// routes/orderRoutes.js
import { Router } from "express";
const router = Router();
import { auth } from "../middleware/auth.js";
import {
  createOrder,
  getOrderById,
  // updateRequirements,
  // startOrder,
  deliverOrder,
  acceptDelivery,
  requestRevision,
  getFreelancerOrder,
  // cancelOrder,
  // sendMessage,
  // uploadAttachment,
  // createDispute,
  // updateDispute,
} from "../controllers/orderController.js";

// Order Creation & Management
router.post("/", auth, createOrder);
router.get("/:id", auth, getOrderById);
router.get("/freelancerOrder/:id", auth, getFreelancerOrder);
// router.put("/:id/requirements", auth, updateRequirements);

// Order Status Updates
// router.put("/:id/start", auth, startOrder);
router.put("/:id/deliver", auth, deliverOrder);
router.put("/:id/accept", auth, acceptDelivery);
router.put("/:id/request-revision", auth, requestRevision);
// router.put("/:id/cancel", auth, cancelOrder);

// Order Communication
// router.post("/:id/message", auth, sendMessage);
// router.post("/:id/attachment", auth, uploadAttachment);

// // Dispute Handling
// router.post("/:id/dispute", auth, createDispute);
// router.put("/:id/dispute", auth, updateDispute);

export default router;
