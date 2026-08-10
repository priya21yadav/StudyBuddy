import React from 'react';
import { Award, Flame, Trophy, Lock, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function BadgesPage() {
  const { isDarkMode } = useTheme();

  const containerBg = isDarkMode 
    ? 'bg-[#0F172A] border-slate-800 text-slate-100' 
    : 'bg-white border-slate-200 text-slate-900 shadow-sm';

  const subTextColor = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  const badges = [
    { id: 1, title: 'First Session Complete', desc: 'Completed your first peer-to-peer session.', icon: Award, unlocked: true, color: 'from-cyan-500 to-blue-600' },
    { id: 2, title: 'Streak Master (10 Days)', desc: 'Maintained a 10-day active streak.', icon: Flame, unlocked: true, color: 'from-amber-500 to-orange-600' },
    { id: 3, title: 'Top Learner (August)', desc: 'Ranked in top 5% active learners.', icon: Trophy, unlocked: true, color: 'from-yellow-400 to-amber-600' },
    { id: 4, title: 'Master Mentor', desc: 'Taught over 20 hours to peers.', icon: Award, unlocked: false, color: 'from-violet-500 to-purple-600' },
    { id: 5, title: 'Community Builder', desc: 'Referred 5 peers to platform.', icon: Trophy, unlocked: false, color: 'from-emerald-500 to-teal-600' },
    { id: 6, title: 'Polymath', desc: 'Learned across 3 different domains.', icon: Flame, unlocked: false, color: 'from-pink-500 to-rose-600' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black tracking-wide leading-tight">GAMIFICATION & BADGES</h1>
        <p className={`text-xs font-medium mt-0.5 ${subTextColor}`}>
          Earn badges by completing sessions, streaks, and helping peers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div key={badge.id} className={`p-5 rounded-2xl border flex flex-col justify-between ${containerBg}`}>
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-tr ${
                  badge.unlocked ? badge.color : 'from-slate-600 to-slate-700 opacity-40'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                {badge.unlocked ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Unlocked
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-1">
                <h3 className="font-extrabold text-sm">{badge.title}</h3>
                <p className={`text-xs font-medium ${subTextColor}`}>{badge.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}