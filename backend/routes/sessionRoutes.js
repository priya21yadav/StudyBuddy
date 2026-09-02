const express = require('express');
const router = express.Router();
const {
  bookSession,
  acceptSession,
  rejectSession,
  cancelSession,
  completeSession,
  submitReview,
  getMySessions,
} = require('../controllers/sessionController');

router.post('/book', bookSession);
router.get('/my-sessions', getMySessions);
router.put('/:id/accept', acceptSession);
router.put('/:id/reject', rejectSession);
router.put('/:id/cancel', cancelSession);
router.put('/:id/complete', completeSession);
router.post('/:id/review', submitReview);

module.exports = router;