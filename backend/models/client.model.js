// models/Buyer.js
import mongoose from "mongoose";

const buyerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone no is required"],
    },

    avatar: {
      type: String,
      default: "default-avatar.png",
    },

    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
    },
    address: {
      type: String,
    },

    // Buying History
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],

    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gig",
      },
    ],

    // Payment Information
    paymentMethods: [
      {
        type: {
          type: String,
          enum: ["credit_card", "paypal", "bank_account"],
        },
        details: Object,
        isDefault: Boolean,
      },
    ],
    contracts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contract",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ClientModel = mongoose.model("Buyer", buyerSchema);

export default ClientModel;
