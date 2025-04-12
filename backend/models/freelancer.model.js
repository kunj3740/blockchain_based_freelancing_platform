// models/Freelancer.js
import mongoose from "mongoose";

const freelancerSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },

    // Professional Information
    professionalTitle: {
      type: String,
      required: [true, "Professional title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    skills: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    primaryCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    subCategories: [
      {
        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
        subCategoryName: String,
      },
    ],

    // Profile Information
    avatar: {
      type: String,
      default: "default-avatar.png",
    },
    portfolio: [
      {

        title: {
              type: String,
              required: [true, "Project name is required"],
          },
          techStack: {
              type: [String], // Array of strings for tech stack
              required: [true, "Tech stack is required"],
          },
          description: {
              type: String,
              required: [true, "Description is required"],
          },
          link: String,
          category: String,
      },
  ],
    education: [
      {
        institution: String,
        degree: String,
        field: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        year: Number,
        url: String,
      },
    ],
    experience: [
      {
        title: String,
        company: String,
        location: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
        description: String,
      },
    ],

    // Location & Availability
    country: {
      type: String,
      required: true,
    },
    city: String,
    timezone: String,
    languages: [
      {
        language: String,
        proficiency: {
          type: String,
          enum: ["Basic", "Conversational", "Fluent", "Native"],
        },
      },
    ],
    availability: {
      status: {
        type: String,
        enum: ["Available", "Partially Available", "Not Available"],
        default: "Available",
      },
      hoursPerWeek: Number,
    },

    // Business Information
    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethods: [
      {
        type: String,
        details: Object,
        isDefault: Boolean,
      },
    ],

    // Statistics & Metrics
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
    },
    completedProjects: {
      type: Number,
      default: 0,
    },
    accountLevel: {
      type: String,
      enum: ["Beginner", "Level 1", "Level 2", "Top Rated"],
      default: "Beginner",
    },

    // Active Orders
    activeOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    
    // Search visibility options
    searchProfile: {
      isVisible: {
        type: Boolean,
        default: true,
      },
      keywords: [String],
      featuredWork: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Portfolio",
        }
      ],
    },
    
    // Last activity timestamp for sorting by recently active
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update category metadata when a freelancer updates their categories
freelancerSchema.pre('save', async function(next) {
  try {
    const CategoryModel = mongoose.model('Category');
    
    // If categories field was modified
    if (this.isModified('categories')) {
      // Get previously saved document
      let oldCategories = [];
      if (this._id) {
        const oldDoc = await mongoose.model('Freelancer').findById(this._id);
        if (oldDoc) {
          oldCategories = oldDoc.categories || [];
        }
      }
      
      // Find categories to remove and add
      const categoriesToRemove = oldCategories.filter(cat => 
        !this.categories.some(newCat => newCat.toString() === cat.toString())
      );
      
      const categoriesToAdd = this.categories.filter(cat => 
        !oldCategories.some(oldCat => oldCat.toString() === cat.toString())
      );
      
      // Update each category's freelancers array and metadata
      for (const catId of categoriesToRemove) {
        const category = await CategoryModel.findById(catId);
        if (category) {
          // Remove freelancer from category's freelancers array
          category.freelancers = category.freelancers.filter(
            id => id.toString() !== this._id.toString()
          );
          await category.updateMetadata();
        }
      }
      
      for (const catId of categoriesToAdd) {
        const category = await CategoryModel.findById(catId);
        if (category) {
          // Add freelancer to category's freelancers array if not already there
          if (!category.freelancers.includes(this._id)) {
            category.freelancers.push(this._id);
          }
          await category.updateMetadata();
        }
      }
    }
    
    // If hourly rate was modified, update metadata for all categories
    if (this.isModified('hourlyRate') || this.isModified('accountLevel')) {
      for (const catId of this.categories) {
        const category = await CategoryModel.findById(catId);
        if (category) {
          await category.updateMetadata();
        }
      }
    }
    
    next();
  } catch (err) {
    next(err);
  }
});

// Update lastActive timestamp when the freelancer logs in or performs an action
freelancerSchema.methods.updateActivity = function() {
  this.lastActive = new Date();
  return this.save();
};

// Clean up category references when a freelancer is deleted
freelancerSchema.pre('remove', async function(next) {
  try {
    const CategoryModel = mongoose.model('Category');
    
    // Update each category's freelancers array and metadata
    for (const catId of this.categories) {
      const category = await CategoryModel.findById(catId);
      if (category) {
        // Remove freelancer from category's freelancers array
        category.freelancers = category.freelancers.filter(
          id => id.toString() !== this._id.toString()
        );
        await category.updateMetadata();
      }
    }
    
    next();
  } catch (err) {
    next(err);
  }
});

const FreelancerModel = mongoose.model("Freelancer", freelancerSchema);

export default FreelancerModel;