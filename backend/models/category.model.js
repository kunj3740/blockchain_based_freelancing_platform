// models/Category.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Category description is required"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    // Skills commonly associated with this category
    commonSkills: [
      {
        type: String,
        trim: true,
      }
    ],
    // Track freelancers in this category
    freelancers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Freelancer",
      },
    ],
    // Statistics for filtering and display
    metadata: {
      freelancerCount: {
        type: Number,
        default: 0,
      },
      averageHourlyRate: {
        type: Number,
        default: 0,
      },
      popularSkills: [String],
      // Distribution of freelancer levels in this category
      levelDistribution: {
        beginner: { type: Number, default: 0 },
        level1: { type: Number, default: 0 },
        level2: { type: Number, default: 0 },
        topRated: { type: Number, default: 0 },
      },
    },
    // For UI display
    icon: {
      type: String,
      default: "default-category-icon.svg",
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate slug
categorySchema.pre("save", function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
  }
  
  // Generate slugs for subcategories
  if (this.subCategories && this.subCategories.length > 0) {
    this.subCategories.forEach(subCategory => {
      if (!subCategory.slug) {
        subCategory.slug = subCategory.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
      }
    });
  }
  
  next();
});

// Update metadata whenever a freelancer is added or removed
categorySchema.methods.updateMetadata = async function() {
  const Freelancer = mongoose.model('Freelancer');
  
  // Count freelancers
  const freelancerCount = await Freelancer.countDocuments({ categories: this._id });
  
  // Calculate average hourly rate
  const rateData = await Freelancer.aggregate([
    { $match: { categories: this._id } },
    { $group: { _id: null, averageRate: { $avg: "$hourlyRate" } } }
  ]);
  
  // Get level distribution
  const levelDistribution = await Freelancer.aggregate([
    { $match: { categories: this._id } },
    { $group: { 
      _id: "$accountLevel", 
      count: { $sum: 1 } 
    }}
  ]);
  
  // Update popular skills
  const skillData = await Freelancer.aggregate([
    { $match: { categories: this._id } },
    { $unwind: "$skills" },
    { $group: { _id: "$skills", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  // Update metadata
  this.metadata.freelancerCount = freelancerCount;
  this.metadata.averageHourlyRate = rateData.length > 0 ? rateData[0].averageRate : 0;
  this.metadata.popularSkills = skillData.map(item => item._id);
  
  // Reset level counts
  this.metadata.levelDistribution = {
    beginner: 0,
    level1: 0,
    level2: 0,
    topRated: 0
  };
  
  // Update level distribution
  levelDistribution.forEach(level => {
    if (level._id === "Beginner") this.metadata.levelDistribution.beginner = level.count;
    else if (level._id === "Level 1") this.metadata.levelDistribution.level1 = level.count;
    else if (level._id === "Level 2") this.metadata.levelDistribution.level2 = level.count;
    else if (level._id === "Top Rated") this.metadata.levelDistribution.topRated = level.count;
  });
  
  return this.save();
};

const CategoryModel = mongoose.model("Category", categorySchema);

export default CategoryModel;