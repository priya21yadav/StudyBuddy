const express = require('express');
const router = express.Router();
const { getMentors, updateUserProfile, getUserProfile, addGoal, completeGoal } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/mentors', getMentors);
router.get('/profile/:id', getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/goals', addGoal);
router.put('/goals/:goalId/complete', completeGoal);

module.exports = router;