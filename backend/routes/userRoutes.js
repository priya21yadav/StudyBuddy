const express = require('express');
const router = express.Router();
const { getMentors, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/mentors', getMentors);
router.put('/profile', protect, updateUserProfile);

module.exports = router;