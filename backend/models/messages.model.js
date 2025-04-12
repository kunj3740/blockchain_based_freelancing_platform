// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderType",
      required: true,
    },
    senderType: {
      type: String,
      enum: ["Buyer", "Freelancer"],
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "receiverType",
      required: true,
    },
    receiverType: {
      type: String,
      enum: ["Buyer", "Freelancer"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
    metadata: {
      type: {
        type: String,
        enum: ["text", "offer", "order", "delivery"],
        default: "text",
      },
      relatedId: mongoose.Schema.Types.ObjectId,
      additionalData: Object,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });

const MessageModel = mongoose.model("Message", messageSchema);

export default MessageModel;
