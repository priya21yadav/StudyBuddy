import React, { useState } from 'react';
import { User, Shield, Save, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const { isDarkMode, toggleTheme } = useTheme();

  const cardBg = isDarkMode 
    ? 'bg-[#0F172A] border-slate-800 text-slate-100 shadow-xl shadow-black/20' 
    : 'bg-white border-slate-200 text-slate-900 shadow-sm';

  const inputBg = isDarkMode 
    ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-400' 
    : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500';

  const subTextColor = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  const [formData, setFormData] = useState({
    name: 'Ashmak Madhart',
    email: 'ashmak@studybuddy.com',
    skillsToTeach: 'System Design, Node.js',
    skillsToLearn: 'Python, Machine Learning',
  });

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h1 className="text-xl font-black tracking-wide leading-tight">SETTINGS</h1>
        <p className={`text-xs font-medium mt-0.5 ${subTextColor}`}>
          Manage account preferences, skills, and theme options.
        </p>
      </div>

      <div className={`p-5 rounded-2xl border space-y-5 ${cardBg}`}>
        <div className="flex items-center gap-2 border-b border-slate-700/30 pb-3">
          <User className="w-4 h-4 text-violet-500" />
          <h2 className="font-extrabold text-sm">Profile Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs font-bold mb-1 ${subTextColor}`}>Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3.5 py-2 rounded-xl border outline-none text-xs font-semibold ${inputBg}`}
            />
          </div>
          <div>
            <label className={`block text-xs font-bold mb-1 ${subTextColor}`}>Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3.5 py-2 rounded-xl border outline-none text-xs font-semibold ${inputBg}`}
            />
          </div>
          <div>
            <label className={`block text-xs font-bold mb-1 ${subTextColor}`}>Skills You Teach</label>
            <input
              type="text"
              value={formData.skillsToTeach}
              onChange={(e) => setFormData({ ...formData, skillsToTeach: e.target.value })}
              className={`w-full px-3.5 py-2 rounded-xl border outline-none text-xs font-semibold ${inputBg}`}
            />
          </div>
          <div>
            <label className={`block text-xs font-bold mb-1 ${subTextColor}`}>Skills You Want to Learn</label>
            <input
              type="text"
              value={formData.skillsToLearn}
              onChange={(e) => setFormData({ ...formData, skillsToLearn: e.target.value })}
              className={`w-full px-3.5 py-2 rounded-xl border outline-none text-xs font-semibold ${inputBg}`}
            />
          </div>
        </div>

        <button className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-violet-500/20">
          <Save className="w-4 h-4" /> Save Preferences
        </button>
      </div>

      <div className={`p-5 rounded-2xl border space-y-3 ${cardBg}`}>
        <div className="flex items-center gap-2 border-b border-slate-700/30 pb-3">
          <Shield className="w-4 h-4 text-cyan-500" />
          <h2 className="font-extrabold text-sm">Appearance & Theme</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-xs">Theme Preference</p>
            <p className={`text-[11px] font-medium ${subTextColor}`}>Switch between Light and Dark Mode.</p>
          </div>

          <button
            onClick={toggleTheme}
            className={`px-3.5 py-2 rounded-xl border font-extrabold text-xs flex items-center gap-2 ${
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