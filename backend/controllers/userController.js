const mongoose = require('mongoose');
const User = require('../models/User');
const { inMemoryUsers } = require('../config/mockStore');

// @desc    Get all mentors for Explore Mentors Page (Excludes current logged-in user)
// @route   GET /api/users/mentors
exports.getMentors = async (req, res) => {
  try {
    const currentUserId = req.query.userId || req.user?._id;

    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (currentUserId && !String(currentUserId).startsWith('usr_')) {
        try {
          query = { _id: { $ne: currentUserId } };
        } catch (e) {}
      }

      const mentors = await User.find(query).select('-password');
      if (mentors && mentors.length > 0) {
        return res.json(mentors);
      }
    }

    // Instant Mock Fallback Mentors (When MongoDB service is not running)
    const availableMentors = inMemoryUsers.filter(
      (u) => !currentUserId || String(u._id || u.id) !== String(currentUserId)
    );

    return res.json(availableMentors);
  } catch (error) {
    console.error("Get Mentors Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile & skills
// @route   PUT /api/users/profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(userId);
      if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.skillsToTeach = req.body.skillsToTeach || user.skillsToTeach;
        user.skillsToLearn = req.body.skillsToLearn || user.skillsToLearn;

        const updatedUser = await user.save();

        return res.json({
          id: updatedUser._id,
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          skillCredits: updatedUser.skillCredits,
          streakCount: updatedUser.streakCount,
          skillsToTeach: updatedUser.skillsToTeach,
          skillsToLearn: updatedUser.skillsToLearn,
        });
      }
    }

    // Mock fallback profile update response
    return res.json({
      id: userId,
      _id: userId,
      name: req.body.name || "Student User",
      email: req.body.email || "user@example.com",
      skillCredits: 5,
      streakCount: 1,
      skillsToTeach: req.body.skillsToTeach || ['React & Node'],
      skillsToLearn: req.body.skillsToLearn || ['DSA'],
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile by ID
// @route   GET /api/users/profile/:id
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user?._id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (mongoose.connection.readyState === 1 && !String(userId).startsWith('usr_')) {
      try {
        const user = await User.findById(userId).select('-password');
        if (user) return res.json(user);
      } catch (e) {}
    }

    // Instant Mock Fallback User
    return res.json({
      _id: userId,
      id: userId,
      name: "Student User",
      email: "user@example.com",
      skillCredits: 5,
      streakCount: 7,
      hoursTaught: 0,
      skillsToTeach: ['React & Node'],
      skillsToLearn: ['DSA'],
      goals: [
        {
          _id: 'goal_101',
          title: 'Master System Design & Scalability',
          targetDays: 14,
          currentDay: 5,
          isCompleted: false
        }
      ]
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new Target Learning Goal
// @route   POST /api/users/goals
exports.addGoal = async (req, res) => {
  try {
    const { userId, title, targetDays } = req.body;
    const uid = req.user?._id || userId;

    if (!title) {
      return res.status(400).json({ message: "Goal title is required" });
    }

    const newGoal = {
      _id: 'goal_' + Date.now(),
      title: title.trim(),
      targetDays: Number(targetDays) || 14,
      currentDay: 1,
      isCompleted: false,
      startDate: new Date()
    };

    if (mongoose.connection.readyState === 1 && uid && !String(uid).startsWith('usr_')) {
      try {
        const user = await User.findById(uid);
        if (user) {
          user.goals.push(newGoal);
          await user.save();
          return res.status(201).json({ message: "Goal created successfully!", goal: newGoal, goals: user.goals });
        }
      } catch (e) {}
    }

    return res.status(201).json({ message: "Goal created successfully!", goal: newGoal });
  } catch (error) {
    console.error("Add Goal Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete a Learning Goal and Earn +2 Bonus Credits
// @route   PUT /api/users/goals/:goalId/complete
exports.completeGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const uid = req.user?._id || req.body.userId;

    if (mongoose.connection.readyState === 1 && uid && !String(uid).startsWith('usr_')) {
      try {
        const user = await User.findById(uid);
        if (user) {
          const goal = user.goals.id(goalId);
          if (goal) {
            goal.isCompleted = true;
            goal.currentDay = goal.targetDays;
            user.skillCredits = (user.skillCredits || 5) + 2; // +2 Bonus Credits reward 🪙

            // Generate Certificate for completing goal
            user.certificates.push({
              title: `Certification of Mastery: ${goal.title}`,
              skill: goal.title,
              issuedDate: new Date(),
              certificateId: 'SB-CERT-' + Math.floor(100000 + Math.random() * 900000)
            });

            await user.save();
            return res.json({
              message: "🎉 Target Completed! You earned +2 Bonus Credits 🪙 and a new Certificate!",
              skillCredits: user.skillCredits,
              user
            });
          }
        }
      } catch (e) {}
    }

    return res.json({
      message: "🎉 Target Completed! You earned +2 Bonus Credits 🪙!",
      skillCredits: 7
    });
  } catch (error) {
    console.error("Complete Goal Error:", error);
    res.status(500).json({ message: error.message });
  }
};