const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    roomId: {
      type: String,
      default: function () {
        return `room_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
      },
    },
    creditsUsed: {
      type: Number,
      default: 1,
    },
    // Option 1: Rating & Review Fields
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    feedback: {
      type: String,
      default: '',
      trim: true,
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
    // Option 2: Live Code Persistence (Optional)
    codeSnapshot: {
      type: String,
      default: '// Start coding collaboratively here...\n',
    },
    codeLanguage: {
      type: String,
      default: 'javascript',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);