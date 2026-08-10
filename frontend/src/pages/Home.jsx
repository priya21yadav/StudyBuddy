import React from 'react';
import { Video, Share2, CheckCircle, Flame, Coins, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
  const { isDarkMode } = useTheme();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Aug'];

  const cardBg = isDarkMode 
    ? 'bg-[#0F172A] border-slate-800 shadow-xl shadow-black/20 text-slate-100' 
    : 'bg-white border-slate-200 shadow-sm text-slate-900';
  
  const innerCardBg = isDarkMode 
    ? 'bg-[#070D1B] border-slate-800/80' 
    : 'bg-slate-50 border-slate-200';

  const subTextColor = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  const darkLevels = ['bg-slate-800', 'bg-emerald-950', 'bg-emerald-700', 'bg-emerald-400'];
  const lightLevels = ['bg-slate-200', 'bg-emerald-200', 'bg-emerald-400', 'bg-emerald-600'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Stats */}
        <div className="lg:col-span-6 grid grid-cols-3 gap-4">
          <div className={`p-5 rounded-3xl border flex flex-col justify-between ${cardBg}`}>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 font-bold flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <p className={`text-[11px] font-extrabold uppercase tracking-wider ${subTextColor}`}>Credits Balance</p>
              <h4 className="text-xl font-black mt-1 text-amber-500">(12 Cr)</h4>
            </div>
          </div>

          <div className={`p-5 rounded-3xl border flex flex-col justify-between ${cardBg}`}>
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 text-orange-500 font-bold flex items-center justify-center">
              <Flame className="w-5 h-5 fill-orange-500" />
            </div>
            <div className="mt-4">
              <p className={`text-[11px] font-extrabold uppercase tracking-wider ${subTextColor}`}>Active Streak</p>
              <h4 className="text-xl font-black mt-1 text-orange-500">(7 Days)</h4>
            </div>
          </div>

          <div className={`p-5 rounded-3xl border flex flex-col justify-between ${cardBg}`}>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 font-bold flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <p className={`text-[11px] font-extrabold uppercase tracking-wider ${subTextColor}`}>Hours Taught</p>
              <h4 className="text-xl font-black mt-1 text-emerald-500">(14.5 Hrs)</h4>
            </div>
          </div>
        </div>

        {/* Heatmap Activity Grid */}
        <div className={`lg:col-span-6 p-6 rounded-3xl border flex flex-col justify-between ${cardBg}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              🔥 Daily Learning Activity
            </h3>
          </div>

          <div className="space-y-3">
            <div className={`flex justify-between text-xs px-1 font-bold ${subTextColor}`}>
              {months.map((m) => <span key={m}>{m}</span>)}
            </div>

            <div className="grid grid-cols-12 gap-2.5 justify-items-center">
              {Array.from({ length: 48 }).map((_, i) => {
                const palette = isDarkMode ? darkLevels : lightLevels;
                return (
                  <div
                    key={i}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-200 hover:scale-125 cursor-pointer ${palette[i % palette.length]}`}
                    title={`Day ${i + 1}`}
                  />
                );
              })}
            </div>
          </div>

          <div className={`flex items-center justify-between text-xs mt-4 font-semibold ${subTextColor}`}>
            <span>Inactive activity</span>
            <div className="flex items-center gap-1.5">
              <span>Active</span>
              <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <div className="w-3 h-3 rounded-full bg-emerald-800" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`lg:col-span-4 p-6 rounded-3xl border space-y-4 ${cardBg}`}>
          <h3 className={`font-bold text-xs uppercase tracking-wider ${subTextColor}`}>📅 Upcoming Sessions</h3>
          <div className={`p-5 rounded-2xl border space-y-3 ${innerCardBg}`}>
            <h4 className="font-extrabold text-base">System Design & Node.js</h4>
            <p className={`text-xs font-medium ${subTextColor}`}>Learn architecture & scalability</p>
            <button className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25">
              <Video className="w-4 h-4" /> [ Join Video Call ]
            </button>
          </div>
        </div>

        <div className={`lg:col-span-4 p-6 rounded-3xl border space-y-4 ${cardBg}`}>
          <h3 className={`font-bold text-xs uppercase tracking-wider ${subTextColor}`}>👥 Matched Mentors</h3>
          <div className={`p-5 rounded-2xl border flex items-center gap-4 ${innerCardBg}`}>
            <div className="w-14 h-14 rounded-2xl bg-violet-600 border-2 border-cyan-400 shrink-0 flex items-center justify-center text-xl font-bold text-white shadow-md">👨‍💻</div>
            <div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-500 font-extrabold border border-cyan-500/30">Verified Mentor</span>
              <h4 className="font-bold text-base mt-1">Ashmak Madhart</h4>
              <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle className="w-3.5 h-3.5" /> Verified Mentor
              </p>
            </div>
          </div>
        </div>

        <div className={`lg:col-span-4 p-6 rounded-3xl border flex flex-col justify-between space-y-4 text-center ${
          isDarkMode 
            ? 'bg-gradient-to-br from-[#0F172A] via-[#151D36] to-[#1E1B4B] border-slate-800 text-slate-100' 
            : 'bg-gradient-to-br from-white via-indigo-50/50 to-violet-50 border-slate-200 text-slate-900'
        }`}>
          <div>
            <div className="flex items-center justify-center gap-2 text-violet-500 font-bold text-sm">📚 StudyBuddy</div>
            <h3 className="text-lg font-black mt-2">Automatic Certificate</h3>
            <p className={`text-xs ${subTextColor}`}>preview for you</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-500 text-xs font-extrabold border border-cyan-500/30">
              <CheckCircle className="w-3.5 h-3.5" /> Verified Badge
            </div>
          </div>
          <button className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20">
            <Share2 className="w-4 h-4" /> [ Share on LinkedIn ]
          </button>
        </div>
      </div>
    </div>
  );
}