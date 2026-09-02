import React, { useState } from 'react';
import axios from 'axios';
import { Star, X, CheckCircle, MessageSquare } from 'lucide-react';

export default function ReviewModal({ isOpen, onClose, session, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !session) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const studentId = user.id || user._id;

      const res = await axios.post(`http://localhost:5000/api/sessions/${session._id}/review`, {
        rating,
        feedback,
        studentId,
      });

      if (onReviewSubmitted) onReviewSubmitted(res.data.session);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white relative">
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <h3 className="text-xl font-extrabold">Rate Your Mentorship</h3>
          <p className="text-xs text-slate-400">
            Share feedback for <span className="text-violet-400 font-bold">{session.mentor?.name || 'Mentor'}</span>
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Selector */}
          <div className="flex justify-center items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform active:scale-90"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-700'
                  }`}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Feedback (Optional)
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What did you learn? How was the session?"
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm outline-none focus:border-violet-500 text-slate-200 resize-none font-medium placeholder-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Rating & Review'}
          </button>
        </form>
      </div>
    </div>
  );
}