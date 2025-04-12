// routes/messageRoutes.js
import { Router } from "express";
const router = Router();
import { auth } from "../middleware/auth";
import {
  getConversations,
  getConversationById,
  createConversation,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  uploadAttachment,
} from "../controllers/messageController";

// Conversation Routes
router.get("/conversations", auth, getConversations);
router.get("/conversations/:id", auth, getConversationById);
router.post("/conversations", auth, createConversation);

// Message Routes
router.get("/conversations/:conversationId/messages", auth, getMessages);
router.post("/conversations/:conversationId/messages", auth, sendMessage);
router.put("/messages/:id/read", auth, markAsRead);
router.delete("/messages/:id", auth, deleteMessage);

// Attachments
router.post(
  "/conversations/:conversationId/attachments",
  auth,
  uploadAttachment
);

export default router;
