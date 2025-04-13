// models/Juror.js
import mongoose from "mongoose";

const JurorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Freelancer',
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['freelancer', 'client'],
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  reputation: {
    type: Number,
    default: 0
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});


const JurorMOdel = mongoose.model("Juror", JurorSchema);

export default JurorMOdel;
