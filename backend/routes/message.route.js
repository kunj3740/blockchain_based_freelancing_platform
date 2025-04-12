import express from "express";
import { getMessage, sendMessage } from "../controllers/messageController.js";

const router = express.Router();

// POST /messages/send
router.post("/send", sendMessage);
router.post("/get", getMessage);

export default router;
