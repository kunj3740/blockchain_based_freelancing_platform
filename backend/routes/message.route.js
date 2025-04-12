import express from "express";
import {
  getConversations,
  getMessage,
  getReceiver,
  sendMessage,
} from "../controllers/messageController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// POST /messages/send
router.post("/send", sendMessage);
router.post("/get", getMessage);
router.get("/conversations/:userId", auth, getConversations);
router.get("/receiver/:userId", auth, getReceiver);

export default router;
