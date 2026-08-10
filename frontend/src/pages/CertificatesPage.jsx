import React from 'react';
import { Share2, Award, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function CertificatesPage() {
  const { isDarkMode } = useTheme();

  const cardBg = isDarkMode 
    ? 'bg-gradient-to-br from-[#0F172A] via-[#151D36] to-[#1E1B4B] border-slate-800 text-slate-100' 
    : 'bg-gradient-to-br from-white via-indigo-50/50 to-violet-50 border-slate-200 text-slate-900 shadow-sm';

  const subTextColor = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h1 className="text-xl font-black tracking-wide leading-tight">CERTIFICATES</h1>
        <p className={`text-xs font-medium mt-0.5 ${subTextColor}`}>
          Verified credentials generated upon completion of teaching or learning milestones.
        </p>
      </div>

      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 ${cardBg}`}>
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-violet-500 font-extrabold text-xs">
            <Award className="w-4 h-4" /> StudyBuddy Skill Certificate
          </div>
          <div>
            <h2 className="text-xl font-black">Full-Stack Mentorship Certificate</h2>
            <p className={`text-xs font-medium mt-0.5 ${subTextColor}`}>
              Issued to <span className="font-bold text-violet-500">Ashmak Madhart</span> for 10+ hours of peer teaching.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-500 text-xs font-extrabold border border-cyan-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Blockchain Verified
          </div>
        </div>

        <button className="w-full md:w-auto px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 shrink-0">
          <Share2 className="w-4 h-4" /> Share on LinkedIn
        </button>
      </div>
    </div>
  );
}