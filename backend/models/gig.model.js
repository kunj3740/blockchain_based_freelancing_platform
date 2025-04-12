import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: [true, "Package price is required"],
  },
  deliveryTime: {
    type: Number,
    required: [true, "Delivery time is required"],
  },
  description: {
    type: String,
    required: [true, "Package description is required"],
  },
  revisions: {
    type: Number,
    default: 1,
  },
  features: [String], // optional: to add list of features per package
});

const gigSchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelancer",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    packages: {
      basic: {
        type: packageSchema,
        required: true,
      },
      standard: {
        type: packageSchema,
        required: true,
      },
      premium: {
        type: packageSchema,
        required: true,
      },
    },
    images: [String],
    tags: [String],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Gig", gigSchema);
