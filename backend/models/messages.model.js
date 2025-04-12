// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderType",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "receiverType",
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
    readyToMake: {
      isReady: {
        type: Boolean,
        default: false,
      },
      amount: {
        type: Number,
      },
      isPaid: {
        type: Boolean,
        default: false,
      },
      finalMessage: {
        type: String,
      },
    },
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
