import React, { useState, useEffect } from 'react';
import { User, Shield, Save, Sun, Moon, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

export default function SettingsPage() {
  const { isDarkMode, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    skillsToTeach: '',
    skillsToLearn: '',
  });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setFormData({
      name: savedUser.name || '',
      email: savedUser.email || '',
      skillsToTeach: Array.isArray(savedUser.skillsToTeach)
        ? savedUser.skillsToTeach.map(s => typeof s === 'string' ? s : s.skillName).join(', ')
        : (savedUser.skillsToTeach || ''),
      skillsToLearn: Array.isArray(savedUser.skillsToLearn)
        ? savedUser.skillsToLearn.map(s => typeof s === 'string' ? s : s.skillName).join(', ')
        : (savedUser.skillsToLearn || ''),
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg('');

    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = savedUser._id || savedUser.id;

    const teachList = formData.skillsToTeach.split(',').map(s => s.trim()).filter(Boolean);
    const learnList = formData.skillsToLearn.split(',').map(s => s.trim()).filter(Boolean);

    const updatedUserObj = {
      ...savedUser,
      name: formData.name,
      email: formData.email,
      skillsToTeach: teachList,
      skillsToLearn: learnList,
    };

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/users/profile',
        {
          userId,
          name: formData.name,
          email: formData.email,
          skillsToTeach: teachList,
          skillsToLearn: learnList,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
    } catch (err) {}

    localStorage.setItem('user', JSON.stringify(updatedUserObj));
    setSuccessMsg('Profile settings updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const cardBg = isDarkMode 
    ? 'bg-[#0F172A] border-slate-800 text-slate-100 shadow-xl shadow-black/20' 
    : 'bg-white border-slate-200 text-slate-900 shadow-sm';

  const inputBg = isDarkMode 
    ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-400' 
    : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500';

  const subTextColor = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black tracking-wide leading-tight">SETTINGS & PROFILE</h1>
        <p className={`text-xs font-semibold mt-0.5 ${subTextColor}`}>
          Manage your account preferences, skills, and theme options.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-extrabold text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} className={`p-6 rounded-3xl border space-y-6 ${cardBg}`}>
        <div className="flex items-center gap-2 border-b border-slate-700/30 pb-3">
          <User className="w-5 h-5 text-violet-500" />
          <h2 className="font-extrabold text-base">Profile Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${subTextColor}`}>Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border outline-none text-xs font-semibold ${inputBg}`}
              required
            />
          </div>
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${subTextColor}`}>Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border outline-none text-xs font-semibold ${inputBg}`}
              required
            />
          </div>
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${subTextColor}`}>Skills You Teach (comma separated)</label>
            <input
              type="text"
              placeholder="React, Node.js, System Design"
              value={formData.skillsToTeach}
              onChange={(e) => setFormData({ ...formData, skillsToTeach: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border outline-none text-xs font-semibold ${inputBg}`}
            />
          </div>
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${subTextColor}`}>Skills You Want to Learn (comma separated)</label>
            <input
              type="text"
              placeholder="DSA, Python, Machine Learning"
              value={formData.skillsToLearn}
              onChange={(e) => setFormData({ ...formData, skillsToLearn: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border outline-none text-xs font-semibold ${inputBg}`}
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-violet-500/20 active:scale-95 transition-all"
        >
          <Save className="w-4 h-4" /> Save Profile Preferences
        </button>
      </form>

      <div className={`p-6 rounded-3xl border space-y-4 ${cardBg}`}>
        <div className="flex items-center gap-2 border-b border-slate-700/30 pb-3">
          <Shield className="w-5 h-5 text-cyan-500" />
          <h2 className="font-extrabold text-base">Appearance & Theme</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-sm">Theme Preference</p>
            <p className={`text-xs font-medium ${subTextColor}`}>Switch between Light and Dark Mode.</p>
          </div>

          <button
            onClick={toggleTheme}
            className={`px-4 py-2.5 rounded-2xl border font-extrabold text-xs flex items-center gap-2 ${
              isDarkMode ? 'bg-slate-800 text-amber-400 border-slate-700' : 'bg-slate-100 text-indigo-600 border-slate-300'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>
    </div>
  );
}