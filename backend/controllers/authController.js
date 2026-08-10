const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, skillsToTeach, skillsToLearn } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with 3 bonus credits
    user = new User({
      name,
      email,
      password: hashedPassword,
      skillsToTeach: skillsToTeach || [],
      skillsToLearn: skillsToLearn || [],
      skillCredits: 3
    });

    await user.save();

    // Create JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skillCredits: user.skillCredits,
        streakCount: user.streakCount,
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skillCredits: user.skillCredits,
        streakCount: user.streakCount,
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};