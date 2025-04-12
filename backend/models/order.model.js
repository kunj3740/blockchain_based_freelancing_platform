// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
    },
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelancer",
      required: true,
    },
    package: {
      type: String,
      enum: ["basic", "standard", "premium"],
      required: true,
    },
    packageDetails: {
      description: String,
      deliveryTime: Number,
      price: Number,
      revisions: Number,
      features: [String],
    },

    deliverables: [
      {
        description: String,
        attachments: [
          {
            name: String,
            url: String,
            type: String,
          },
        ],
        submittedAt: Date,
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
      },
    ],
    status: {
      type: String,
      enum: [
        "pending",
        "in_progress",
        "delivered",
        "revision_requested",
        "completed",
        "cancelled",
        "disputed",
      ],
      default: "pending",
    },
    timeline: {
      ordered: {
        type: Date,
        default: Date.now,
      },
      started: Date,
      delivered: Date,
      completed: Date,
    },
    payment: {
      amount: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "completed", "refunded"],
        default: "pending",
      },
      transactionId: String,
    },
    // revision: {
    //   count: {
    //     type: Number,
    //     default: 0,
    //   },
    //   available: {
    //     type: Number,
    //     required: true,
    //   },
    // },
    // review: {
    //   rating: {
    //     type: Number,
    //     min: 1,
    //     max: 5,
    //   },
    //   comment: String,
    //   createdAt: Date,
    // },
  },
  {
    timestamps: true,
  }
);

// Generate order number before saving
// orderSchema.pre("save", function (next) {
//   if (!this.orderNumber) {
//     this.orderNumber =
//       "ORD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
//   }
//   next();
// });

const OrderModel = mongoose.model("Order", orderSchema);

export default OrderModel;
