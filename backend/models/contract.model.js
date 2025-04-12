// models/Contract.js
import mongoose from "mongoose";

const contractSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "Freelancer",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "Buyer",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
contractSchema.index({ message: 1 });
contractSchema.index({ freelancer: 1 });
contractSchema.index({ client: 1 });
contractSchema.index({ isApproved: 1 });
contractSchema.index({ isCompleted: 1 });

const ContractModel = mongoose.model("Contract", contractSchema);

export default ContractModel;