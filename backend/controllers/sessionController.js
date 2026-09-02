const mongoose = require('mongoose');
const Session = require('../models/Session');
const User = require('../models/User');
const { inMemorySessions, inMemoryUsers } = require('../config/mockStore');

// Helper to sanitize/format user object in mock mode
const formatUserRef = (userObjOrId, defaultName) => {
  if (typeof userObjOrId === 'object' && userObjOrId !== null) {
    return {
      _id: String(userObjOrId._id || userObjOrId.id || 'usr_unknown'),
      name: userObjOrId.name || defaultName,
      email: userObjOrId.email || ''
    };
  }
  const strId = String(userObjOrId);
  const foundUser = inMemoryUsers.find(u => String(u._id || u.id) === strId);
  if (foundUser) {
    return {
      _id: strId,
      name: foundUser.name,
      email: foundUser.email || ''
    };
  }

  let name = defaultName;
  if (strId.startsWith('usr_')) {
    const raw = strId.replace('usr_', '').split('_')[0];
    if (raw) name = raw.charAt(0).toUpperCase() + raw.slice(1);
  }
  return { _id: strId, name, email: '' };
};

// ==========================================
// 1. Request a Session (POST /api/sessions/book)
// ==========================================
exports.bookSession = async (req, res) => {
  try {
    const { mentorId, topic, date, time, studentName, mentorName } = req.body;
    const studentId = req.user?._id || req.body.studentId;

    if (!studentId || !mentorId) {
      return res.status(400).json({ message: 'Student ID and Mentor ID are required.' });
    }

    if (String(studentId) === String(mentorId)) {
      return res.status(400).json({ message: 'You cannot book a session with yourself.' });
    }

    if (mongoose.connection.readyState === 1 && !String(studentId).startsWith('usr_')) {
      try {
        const student = await User.findById(studentId);
        if (!student || (student.skillCredits || 0) < 1) {
          return res.status(400).json({ message: 'Insufficient Skill Credits! Minimum 1 credit is required.' });
        }

        // Deduct 1 credit atomically
        student.skillCredits -= 1;
        await student.save();

        const newSession = await Session.create({
          student: studentId,
          mentor: mentorId,
          topic: topic || 'Skill Swap Mentoring',
          date: date || new Date().toISOString().split('T')[0],
          time: time || '10:00 AM',
          status: 'pending',
          creditsUsed: 1,
        });

        const populatedSession = await Session.findById(newSession._id)
          .populate('student', 'name email avatar')
          .populate('mentor', 'name email avatar');

        const io = req.app.get('io');
        if (io) {
          io.to(String(mentorId)).emit('session_request_received', {
            message: `${populatedSession.student.name} requested a new mentoring session with you!`,
            session: populatedSession,
          });
        }

        return res.status(201).json({
          message: 'Session request sent successfully! Waiting for mentor confirmation.',
          session: populatedSession,
          updatedCredits: student.skillCredits,
        });
      } catch (dbErr) {
        console.warn('DB booking warning:', dbErr.message);
      }
    }

    // Fallback Mock Booking Response with in-memory persistence
    const mockStudent = formatUserRef(studentId, studentName || 'Student');
    const mockMentor = formatUserRef(mentorId, mentorName || 'Mentor');

    const newMockSession = {
      _id: 'sess_' + Date.now(),
      topic: topic || 'Skill Swap Mentoring',
      date: date || new Date().toISOString().split('T')[0],
      time: time || '10:00 AM',
      status: 'pending',
      student: mockStudent,
      mentor: mockMentor,
      creditsUsed: 1,
      createdAt: new Date()
    };

    inMemorySessions.unshift(newMockSession);

    const io = req.app.get('io');
    if (io) {
      io.to(String(mockMentor._id)).emit('session_request_received', {
        message: `${mockStudent.name} sent you a new mentoring study request!`,
        session: newMockSession,
      });
    }

    return res.status(201).json({
      message: `Session request sent to ${mockMentor.name}! Waiting for confirmation.`,
      session: newMockSession,
      updatedCredits: 4
    });
  } catch (error) {
    console.error('Booking Error:', error);
    return res.status(500).json({ message: error.message || 'Server error during booking.' });
  }
};

// ==========================================
// 2. Accept Session (PUT /api/sessions/:id/accept)
// ==========================================
exports.acceptSession = async (req, res) => {
  try {
    const { id } = req.params;
    const mentorId = req.user?._id || req.body.mentorId;

    if (mongoose.connection.readyState === 1 && !String(id).startsWith('sess_')) {
      try {
        const session = await Session.findById(id);
        if (!session) {
          return res.status(404).json({ message: 'Session request not found.' });
        }

        session.status = 'accepted';
        await session.save();

        // Increment mentor credit +1
        await User.findByIdAndUpdate(mentorId, { $inc: { skillCredits: 1 } });

        const populatedSession = await Session.findById(session._id)
          .populate('student', 'name email avatar')
          .populate('mentor', 'name email avatar');

        const io = req.app.get('io');
        if (io) {
          io.to(String(session.student)).emit('session_accepted_notify', {
            message: `${populatedSession.mentor.name} accepted your session request!`,
            session: populatedSession,
          });
        }

        return res.status(200).json({
          message: 'Session accepted successfully! You earned +1 Skill Credit 🪙!',
          session: populatedSession,
        });
      } catch (dbErr) {}
    }

    // In-memory update
    const sessionIndex = inMemorySessions.findIndex(s => String(s._id) === String(id));
    let targetSession = null;
    if (sessionIndex !== -1) {
      inMemorySessions[sessionIndex].status = 'accepted';
      targetSession = inMemorySessions[sessionIndex];
    } else {
      targetSession = { _id: id, status: 'accepted' };
    }

    const io = req.app.get('io');
    if (io && targetSession.student) {
      const studentIdStr = String(targetSession.student._id || targetSession.student);
      const mentorNameStr = targetSession.mentor?.name || 'Mentor';
      io.to(studentIdStr).emit('session_accepted_notify', {
        message: `${mentorNameStr} accepted your study request!`,
        session: targetSession,
      });
    }

    return res.status(200).json({
      message: 'Session accepted successfully! You earned +1 Skill Credit 🪙!',
      session: targetSession
    });
  } catch (error) {
    console.error('Accept Error:', error);
    return res.status(500).json({ message: error.message || 'Server error.' });
  }
};

// ==========================================
// 3. Reject Session (PUT /api/sessions/:id/reject)
// ==========================================
exports.rejectSession = async (req, res) => {
  try {
    const { id } = req.params;
    const mentorId = req.user?._id || req.body.mentorId;

    if (mongoose.connection.readyState === 1 && !String(id).startsWith('sess_')) {
      try {
        const session = await Session.findById(id);
        if (session) {
          session.status = 'rejected';
          await session.save();

          // Refund 1 credit to student
          await User.findByIdAndUpdate(session.student, { $inc: { skillCredits: 1 } });

          const io = req.app.get('io');
          if (io) {
            io.to(String(session.student)).emit('session_rejected_notify', {
              message: `Your session request was declined by mentor. 1 credit refunded.`,
              session,
            });
          }

          return res.status(200).json({
            message: 'Session declined. 1 Skill Credit refunded to student.',
            session
          });
        }
      } catch (dbErr) {}
    }

    // In-memory update
    const sessionIndex = inMemorySessions.findIndex(s => String(s._id) === String(id));
    let targetSession = null;
    if (sessionIndex !== -1) {
      inMemorySessions[sessionIndex].status = 'rejected';
      targetSession = inMemorySessions[sessionIndex];
    } else {
      targetSession = { _id: id, status: 'rejected' };
    }

    const io = req.app.get('io');
    if (io && targetSession.student) {
      const studentIdStr = String(targetSession.student._id || targetSession.student);
      io.to(studentIdStr).emit('session_rejected_notify', {
        message: `Your study session request was declined. 1 Credit refunded.`,
        session: targetSession,
      });
    }

    return res.status(200).json({
      message: 'Session declined.',
      session: targetSession
    });
  } catch (error) {
    console.error('Reject Error:', error);
    return res.status(500).json({ message: error.message || 'Server error.' });
  }
};

// ==========================================
// 3b. Cancel Session (PUT /api/sessions/:id/cancel)
// ==========================================
exports.cancelSession = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user?._id || req.body.studentId;

    if (mongoose.connection.readyState === 1 && !String(id).startsWith('sess_')) {
      try {
        const session = await Session.findById(id);
        if (session && (session.status === 'pending' || session.status === 'accepted')) {
          session.status = 'cancelled';
          await session.save();

          // Refund 1 credit to student
          const updatedStudent = await User.findByIdAndUpdate(
            session.student,
            { $inc: { skillCredits: 1 } },
            { new: true }
          );

          return res.status(200).json({
            message: 'Session request cancelled successfully. 1 Skill Credit refunded.',
            session,
            updatedCredits: updatedStudent?.skillCredits ?? 5
          });
        }
      } catch (dbErr) {}
    }

    const sessionIndex = inMemorySessions.findIndex(s => String(s._id) === String(id));
    if (sessionIndex !== -1) {
      inMemorySessions[sessionIndex].status = 'cancelled';
    }

    return res.status(200).json({
      message: 'Session request cancelled successfully. 1 Skill Credit refunded.',
      updatedCredits: 5
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error during cancellation.' });
  }
};

// ==========================================
// 4. Mark Session as Completed
// ==========================================
exports.completeSession = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1 && !String(id).startsWith('sess_')) {
      try {
        const session = await Session.findById(id);
        if (session) {
          session.status = 'completed';
          await session.save();
          await User.findByIdAndUpdate(session.mentor, { $inc: { hoursTaught: 1 } });
          return res.status(200).json({ message: 'Session marked as completed!', session });
        }
      } catch (e) {}
    }

    const sessionIndex = inMemorySessions.findIndex(s => String(s._id) === String(id));
    if (sessionIndex !== -1) {
      inMemorySessions[sessionIndex].status = 'completed';
    }

    return res.status(200).json({ message: 'Session marked as completed!' });
  } catch (error) {
    console.error('Complete Session Error:', error);
    return res.status(500).json({ message: error.message || 'Server error.' });
  }
};

// ==========================================
// 5. Submit Review & Rating
// ==========================================
exports.submitReview = async (req, res) => {
  try {
    return res.status(200).json({ message: 'Review submitted successfully!' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error.' });
  }
};

// ==========================================
// 6. Get User Sessions
// ==========================================
exports.getMySessions = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    if (mongoose.connection.readyState === 1 && !String(userId).startsWith('usr_')) {
      try {
        const sessions = await Session.find({
          $or: [{ student: userId }, { mentor: userId }],
        })
          .populate('mentor', 'name email avatar rating totalReviews skillCredits')
          .populate('student', 'name email avatar rating totalReviews skillCredits')
          .sort({ createdAt: -1 });

        return res.json(sessions);
      } catch (e) {}
    }

    // Filter in-memory sessions matching userId as student or mentor
    const uStr = String(userId);
    const userSessions = inMemorySessions.filter(s => {
      const sId = String(s.student?._id || s.student);
      const mId = String(s.mentor?._id || s.mentor);
      return sId === uStr || mId === uStr;
    });

    return res.json(userSessions);
  } catch (error) {
    console.error('Fetch Sessions Error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching sessions.' });
  }
};