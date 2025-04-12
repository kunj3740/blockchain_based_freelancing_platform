import { getReceiverSocketId } from "../lib/socket.js";
import MessageModel from "../models/messages.model.js";
import { io } from "../lib/socket.js";

// Controller to send a message
export const sendMessage = async (req, res) => {
  try {
    const {
      sender,
      receiver,
      content,
      attachments = [],
      metadata = {},
    } = req.body;

    console.log(req.body);

    // Validate required fields
    if (!sender || !receiver || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newMessage = await MessageModel.create({
      sender,
      receiver,
      content,
      attachments,
      metadata,
    });

    const receiverSocketId = getReceiverSocketId(receiver);

    console.log(receiverSocketId);

    io.to(receiverSocketId).emit("newMessage", newMessage);

    return res.status(201).json({ message: "Message sent", data: newMessage });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
