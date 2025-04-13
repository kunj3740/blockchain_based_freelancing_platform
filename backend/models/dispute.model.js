import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelancer",
      required: true,
    },
    issueDescription: {
      type: String,
      required: true,
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message", // message IDs related to the contract
      },
    ],
    status: {
      type: String,
      enum: ["pending", "under_review", "resolved"],
      default: "pending",
    },
    jurors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Juror",
      },
    ],
    votes: [
      {
        jurorId: { type: mongoose.Schema.Types.ObjectId, ref: "Juror" },
        votedFor: { type: String, enum: ["client", "freelancer"] },
        comment: String,
      },
    ],
    resolution: {
      winner: { type: String, enum: ["client", "freelancer", "none"], default: "none" },
      resolvedAt: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Dispute", disputeSchema);
