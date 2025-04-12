// models/Category.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
    },
    description: {
      type: String,
      required: [true, "Category description is required"],
    },

    subCategories: [
      {
        name: {
          type: String,
          required: true,
        },

        description: String,
      },
    ],

    metadata: {
      gigCount: {
        type: Number,
        default: 0,
      },
      freelancerCount: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate slug
// categorySchema.pre("save", function (next) {
//   this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
//   next();
// });

const CategoryModel = mongoose.model("Category", categorySchema);

export default CategoryModel;
