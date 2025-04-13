import mongoose from "mongoose";

// Task/checkpoint schema for milestone-based payments
const taskSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

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
    tasks: {
      type: [taskSchema],
      default: [],
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
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
    deleteByClient: {
      type: Boolean,
      default: false,
    },
    deleteByFreelancer: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add a virtual property to calculate amount paid so far
contractSchema.virtual("amountPaid").get(function () {
  if (!this.tasks.length) return 0;

  const completedTasksPercentage = this.tasks
    .filter((task) => task.isCompleted)
    .reduce((sum, task) => sum + task.percentage, 0);

  return (completedTasksPercentage / 100) * this.amount;
});

// Indexes
contractSchema.index({ message: 1 });
contractSchema.index({ freelancer: 1 });
contractSchema.index({ client: 1 });
contractSchema.index({ isApproved: 1 });
contractSchema.index({ isCompleted: 1 });

const ContractModel = mongoose.model("Contract", contractSchema);

export default ContractModel;
