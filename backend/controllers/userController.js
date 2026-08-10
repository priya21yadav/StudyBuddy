const User = require('../models/User');

// @desc    Get all mentors for Explore Mentors Page
// @route   GET /api/users/mentors
exports.getMentors = async (req, res) => {
  try {
    const mentors = await User.find().select('-password');
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile & skills
// @route   PUT /api/users/profile
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.skillsToTeach = req.body.skillsToTeach || user.skillsToTeach;
      user.skillsToLearn = req.body.skillsToLearn || user.skillsToLearn;

      const updatedUser = await user.save();

      res.json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        skillCredits: updatedUser.skillCredits,
        skillsToTeach: updatedUser.skillsToTeach,
        skillsToLearn: updatedUser.skillsToLearn,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};