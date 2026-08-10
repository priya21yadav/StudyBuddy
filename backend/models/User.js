const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['student', 'mentor', 'both'], 
      default: 'both' 
    },
    skillCredits: { type: Number, default: 12 },
    streakCount: { type: Number, default: 7 },
    hoursTaught: { type: Number, default: 0 },
    skillsToTeach: [String], // Simple Array of Strings
    skillsToLearn: [String], // Simple Array of Strings
    isVerifiedMentor: { type: Boolean, default: false },
    rating: { type: Number, default: 5.0 },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);