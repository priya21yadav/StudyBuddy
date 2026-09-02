const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { inMemoryUsers } = require('../config/mockStore');

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, skillsToTeach, skillsToLearn } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and Password are required' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const displayName = (name && String(name).trim()) 
      ? String(name).trim() 
      : (cleanEmail.split('@')[0] ? (cleanEmail.split('@')[0].charAt(0).toUpperCase() + cleanEmail.split('@')[0].slice(1)) : 'Student User');

    const formattedTeach = Array.isArray(skillsToTeach)
      ? skillsToTeach.map(s => typeof s === 'object' ? (s.skillName || 'General') : String(s))
      : ['Web Dev', 'System Design'];

    const formattedLearn = Array.isArray(skillsToLearn)
      ? skillsToLearn.map(s => typeof s === 'object' ? (s.skillName || 'General') : String(s))
      : ['DSA', 'Python'];

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      let dbUser = await User.findOne({ email: cleanEmail });
      if (!dbUser) {
        dbUser = new User({
          name: displayName,
          email: cleanEmail,
          password: hashedPassword,
          skillCredits: 5, // 5 Free Credits 🪙
          streakCount: 1,
          skillsToTeach: formattedTeach,
          skillsToLearn: formattedLearn
        });
        await dbUser.save();
      }

      const token = jwt.sign(
        { id: dbUser._id },
        process.env.JWT_SECRET || 'studybuddy_secret_key_12345',
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        token,
        user: {
          _id: dbUser._id,
          id: dbUser._id,
          name: dbUser.name,
          email: dbUser.email,
          skillCredits: dbUser.skillCredits ?? 5,
          streakCount: dbUser.streakCount || 1,
          skillsToTeach: dbUser.skillsToTeach,
          skillsToLearn: dbUser.skillsToLearn
        }
      });
    } else {
      // Mock Fallback Mode
      let mockUser = inMemoryUsers.find(u => u.email === cleanEmail);
      if (!mockUser) {
        const userSlug = cleanEmail.replace(/[^a-z0-9]/g, '_');
        mockUser = {
          _id: "usr_" + userSlug,
          id: "usr_" + userSlug,
          name: displayName,
          email: cleanEmail,
          skillCredits: 5,
          streakCount: 1,
          skillsToTeach: formattedTeach,
          skillsToLearn: formattedLearn,
          rating: 5.0,
          totalReviews: 0
        };
        inMemoryUsers.push(mockUser);
      }

      const token = jwt.sign(
        { id: mockUser._id },
        process.env.JWT_SECRET || 'studybuddy_secret_key_12345',
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        token,
        user: mockUser
      });
    }
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: error.message || "Registration Failed" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      let user = await User.findOne({ email: cleanEmail });
      if (!user) {
        // Automatically create account in DB if email is new
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const rawName = cleanEmail.split('@')[0];
        const displayName = rawName ? (rawName.charAt(0).toUpperCase() + rawName.slice(1)) : "Student User";
        user = new User({
          name: displayName,
          email: cleanEmail,
          password: hashedPassword,
          skillCredits: 5,
          streakCount: 1,
          skillsToTeach: ['React', 'System Design'],
          skillsToLearn: ['Python', 'DSA']
        });
        await user.save();
      }

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'studybuddy_secret_key_12345',
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          skillCredits: user.skillCredits ?? 5,
          streakCount: user.streakCount || 1,
          skillsToTeach: user.skillsToTeach,
          skillsToLearn: user.skillsToLearn
        }
      });
    }

    // Mock Login Fallback Mode
    let mockUser = inMemoryUsers.find(u => u.email === cleanEmail);
    if (!mockUser) {
      const userSlug = cleanEmail.replace(/[^a-z0-9]/g, '_');
      const rawName = cleanEmail.split('@')[0];
      const displayName = rawName ? (rawName.charAt(0).toUpperCase() + rawName.slice(1)) : "Student User";
      mockUser = {
        _id: "usr_" + userSlug,
        id: "usr_" + userSlug,
        name: displayName,
        email: cleanEmail,
        skillCredits: 5, // 5 Free Credits 🪙
        streakCount: 1,
        skillsToTeach: ['Web Dev', 'System Design'],
        skillsToLearn: ['Python', 'DSA'],
        rating: 5.0,
        totalReviews: 0
      };
      inMemoryUsers.push(mockUser);
    }

    const token = jwt.sign(
      { id: mockUser._id },
      process.env.JWT_SECRET || 'studybuddy_secret_key_12345',
      { expiresIn: '7d' }
    );
    return res.json({ token, user: mockUser });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: error.message || "Login Failed" });
  }
};