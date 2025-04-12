import mongoose from "mongoose";

const freelancerSchema = new mongoose.Schema(
  {
    // Basic Information
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
      },
    ],
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
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

    // Active Gigs & Orders
    activeGigs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gig",
      },
    ],
    activeOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const FreelancerModel = mongoose.model("Freelancer", freelancerSchema);

export default FreelancerModel;
