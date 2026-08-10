const Session = require('../models/Session');
const User = require('../models/User');

// @desc    Book a new mentoring session
// @route   POST /api/sessions/book
exports.bookSession = async (req, res) => {
  try {
    const { mentorId, topic, date, time } = req.body;
    const studentId = req.user._id;

    // Check student credits
    const student = await User.findById(studentId);
    if (student.skillCredits < 1) {
      return res.status(400).json({ message: 'Insufficient Skill Credits!' });
    }

    const mentor = await User.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Deduct credit from student & Add to mentor
    student.skillCredits -= 1;
    mentor.skillCredits += 1;

    await student.save();
    await mentor.save();

    // Create Session
    const session = await Session.create({
      student: studentId,
      mentor: mentorId,
      topic,
      date,
      time,
    });

    res.status(201).json({
      message: 'Session booked successfully!',
      session,
      updatedCredits: student.skillCredits,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user sessions
// @route   GET /api/sessions/my-sessions
exports.getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ student: req.user._id }, { mentor: req.user._id }],
    })
      .populate('mentor', 'name email')
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};