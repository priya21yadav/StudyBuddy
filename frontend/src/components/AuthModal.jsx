import React, { useState } from 'react';
import axios from 'axios';
import { X, Mail, Lock, User, BookOpen, Sparkles } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    teachSkill: '',
    learnSkill: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = isLogin 
      ? 'http://localhost:5000/api/auth/login' 
      : 'http://localhost:5000/api/auth/register';

    const payload = isLogin ? {
      email: formData.email,
      password: formData.password
    } : {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      skillsToTeach: [{ skillName: formData.teachSkill || 'Web Dev', level: 'Intermediate' }],
      skillsToLearn: [{ skillName: formData.learnSkill || 'DSA', level: 'Beginner' }]
    };

    try {
      const res = await axios.post(url, payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onAuthSuccess(res.data.user);
      setLoading(false);
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Authentication failed. Check connection.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl border-2 border-slate-100 dark:border-slate-700 relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-violet-100 dark:bg-violet-900/50 rounded-2xl text-violet-600 dark:text-violet-400 mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white mb-2 tracking-tight">
            {isLogin ? 'Welcome Back!' : 'Join StudyBuddy'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base">
            {isLogin ? 'Log in to continue your skill exchange journey.' : 'Create an account and get 3 free credits! 🪙'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium mb-6 border border-red-200 dark:border-red-800">
             ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                name="name"
                type="text" 
                placeholder="Your Full Name" 
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:border-violet-500"
                required
              />
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              name="email"
              type="email" 
              placeholder="Email Address" 
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:border-violet-500"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              name="password"
              type="password" 
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:border-violet-500"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <BookOpen className="h-5 w-5 text-violet-400" />
                </div>
                <input 
                  name="teachSkill"
                  type="text" 
                  placeholder="Skill You Can Teach (e.g. React)" 
                  value={formData.teachSkill}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:border-violet-500"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <BookOpen className="h-5 w-5 text-cyan-400" />
                </div>
                <input 
                  name="learnSkill"
                  type="text" 
                  placeholder="Skill You Want to Learn (e.g. DSA)" 
                  value={formData.learnSkill}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:border-cyan-500"
                  required
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg"
          >
            {loading ? 'Connecting...' : (isLogin ? 'Log In Now' : 'Create Free Account')}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }} 
              className="text-violet-600 dark:text-violet-400 font-bold ml-2 underline"
            >
              {isLogin ? 'Sign Up Free' : 'Log In Here'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}