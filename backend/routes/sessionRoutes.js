const express = require('express');
const router = express.Router();
const { bookSession, getMySessions } = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/book', protect, bookSession);
router.get('/my-sessions', protect, getMySessions);

module.exports = router;