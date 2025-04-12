import { getReceiverSocketId } from "../lib/socket.js";
import MessageModel from "../models/messages.model.js";
// import UserModel from "../models/user.model.js"; // Assuming you have a User model
import { io } from "../lib/socket.js";
import ClientModel from "../models/client.model.js";
import FreelancerModel from "../models/freelancer.model.js";
import mongoose from "mongoose";

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

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiver);
    // const senderSocketId = getReceiverSocketId(sender);

    io.to(receiverSocketId).emit("newMessage", newMessage);
    // io.to(senderSocketId).emit("newMessage", newMessage);

    return res.status(201).json({ message: "Message sent", data: newMessage });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessage = async (req, res) => {
  try {
    const { sender, receiver } = req.body;

    if (!sender || !receiver) {
      return res.status(400).json({ message: "Missing sender or receiver" });
    }

    const messages = await MessageModel.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 }); // oldest to newest

    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// New controller method to get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = req.user;

    // console.log(`Starting getConversations for userId: ${userId}`);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Debug log
    // console.log(`User role from request: ${user?.role}`);

    // First, get all messages where the user is either sender or receiver
    const allMessages = await MessageModel.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).sort({ createdAt: -1 }); // Sort by newest first

    // console.log(`Found ${allMessages.length} total messages`);

    // Track unique partners and their latest messages
    const uniquePartners = [];
    const processedIds = new Set();

    for (const message of allMessages) {
      const senderId = message.sender.toString();
      const receiverId = message.receiver.toString();

      // Determine the partner ID (the one that's not the current user)
      const partnerId = senderId === userId.toString() ? receiverId : senderId;

      // console.log(
      //   `Processing message: sender=${senderId}, receiver=${receiverId}, partner=${partnerId}`
      // );

      // Skip if we've already processed this partner
      if (processedIds.has(partnerId)) {
        continue;
      }

      // Mark this partner as processed
      processedIds.add(partnerId);
      uniquePartners.push(partnerId);

      // console.log(`Added partner ${partnerId} to unique partners list`);
    }

    // console.log(`Unique conversation partners: ${uniquePartners.length}`);
    // console.log(`Partner IDs: ${uniquePartners.join(", ")}`);

    // Fetch user details and build conversations
    const conversations = [];

    for (const partnerId of uniquePartners) {
      // Get the latest message for this conversation
      const latestMessage = await MessageModel.findOne({
        $or: [
          { sender: userId, receiver: partnerId },
          { sender: partnerId, receiver: userId },
        ],
      }).sort({ createdAt: -1 });

      // console.log(`Fetching user details for partnerId: ${partnerId}`);

      // Try client model first
      let userDetails = await ClientModel.findById(partnerId).select(
        "firstName lastName email profilePicture status"
      );

      if (userDetails) {
        console
          .log
          // `Found user in ClientModel: ${userDetails.firstName} ${userDetails.lastName}`
          ();
      } else {
        // Try freelancer model
        userDetails = await FreelancerModel.findById(partnerId).select(
          "firstName lastName email profilePicture status"
        );

        if (userDetails) {
          // console.log(
          //   `Found user in FreelancerModel: ${userDetails.firstName} ${userDetails.lastName}`
          // );
        } else {
          console.log(`⚠️ User with ID ${partnerId} not found in any model`);
          continue;
        }
      }

      // Get unread count
      const unreadCount = await MessageModel.countDocuments({
        sender: partnerId,
        receiver: userId,
        read: false,
      });

      conversations.push({
        user: userDetails,
        latestMessage,
        unreadCount,
      });

      console
        .log
        // `Added conversation with ${userDetails.firstName} ${userDetails.lastName}`
        ();
    }

    // Sort by latest message date
    conversations.sort(
      (a, b) =>
        new Date(b.latestMessage?.createdAt || 0) -
        new Date(a.latestMessage?.createdAt || 0)
    );

    // console.log(`Returning ${conversations.length} conversations`);
    res.json(conversations);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    console.error(err.stack);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

export async function getReceiver(req, res) {
  try {
    const { userId } = req.params;

    let user = await FreelancerModel.findById(userId).select("-password");
    if (!user) {
      user = await ClientModel.findById(userId).select("-password");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching receiver:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
