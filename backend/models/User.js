const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'mentor', 'both'],
      default: 'both',
    },
    skillCredits: { type: Number, default: 5 }, // Default 5 Free Credits 🪙
    streakCount: { type: Number, default: 1 },
    hoursTaught: { type: Number, default: 0 },
    skillsToTeach: [String],
    skillsToLearn: [String],
    isVerifiedMentor: { type: Boolean, default: false },
    rating: { type: Number, default: 5.0 },
    totalReviews: { type: Number, default: 0 },
    avatar: { type: String, default: '' },

    goals: [
      {
        title: String,
        targetDays: { type: Number, default: 14 },
        currentDay: { type: Number, default: 1 },
        isCompleted: { type: Boolean, default: false },
        startDate: { type: Date, default: Date.now },
      },
    ],

    badges: [
      {
        title: String,
        description: String,
        icon: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    certificates: [
      {
        title: String,
        skill: String,
        issuedDate: { type: Date, default: Date.now },
        certificateId: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);