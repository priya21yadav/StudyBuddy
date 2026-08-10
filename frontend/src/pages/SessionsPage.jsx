import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Video, User, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import VideoModal from '../components/VideoModal';

export default function SessionsPage() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [selectedSessionTopic, setSelectedSessionTopic] = useState('');

  const cardBg = isDarkMode 
    ? 'bg-[#0F172A] border-slate-800 text-slate-100 shadow-xl' 
    : 'bg-white border-slate-200 text-slate-900 shadow-sm';

  const innerBg = isDarkMode 
    ? 'bg-[#070D1B] border-slate-800/80' 
    : 'bg-slate-50 border-slate-200';

  const textHeading = isDarkMode ? 'text-white' : 'text-slate-900';
  const textSub = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  const sessions = [
    { 
      id: 1, 
      title: 'System Design & Scalability', 
      mentor: 'Ashmak Madhart', 
      date: 'Aug 12, 2026', 
      time: '10:00 AM ET', 
      type: 'upcoming', 
      credits: 1 
    },
    { 
      id: 2, 
      title: 'Python Data Structures', 
      mentor: 'Alex Chen', 
      date: 'Aug 08, 2026', 
      time: '02:00 PM ET', 
      type: 'completed', 
      credits: 1 
    },
  ];

  const handleStartCall = (topic) => {
    setSelectedSessionTopic(topic);
    setIsVideoOpen(true);
  };

  const filteredSessions = sessions.filter((s) => s.type === activeTab);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h1 className={`text-3xl font-black tracking-tight ${textHeading}`}>
          MY SESSIONS
        </h1>
        <p className={`text-sm font-semibold mt-1 ${textSub}`}>
          Manage scheduled mentoring calls and history.
        </p>
      </div>

      <div className="flex gap-3">
        {['upcoming', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-sm capitalize transition-all ${
              activeTab === tab
                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                : isDarkMode 
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-white' 
                  : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab} Sessions
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSessions.map((session) => (
          <div 
            key={session.id} 
            className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${cardBg}`}
          >
            <div className={`p-5 rounded-2xl border space-y-3 ${innerBg}`}>
              <div className="flex justify-between items-start">
                <h3 className={`font-extrabold text-lg ${textHeading}`}>
                  {session.title}
                </h3>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                  {session.credits} Credit
                </span>
              </div>

              <div className={`space-y-2 text-sm font-semibold ${textSub}`}>
                <p className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-violet-500 shrink-0" /> 
                  <span>Mentor: <strong className={textHeading}>{session.mentor}</strong></span>
                </p>
                <p className="flex items-center gap-2.5">
                  <CalendarIcon className="w-4 h-4 text-cyan-500 shrink-0" /> 
                  <span>{session.date}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-500 shrink-0" /> 
                  <span>{session.time}</span>
                </p>
              </div>
            </div>

            {session.type === 'upcoming' ? (
              <button 
                onClick={() => handleStartCall(session.title)}
                className="w-full py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all"
              >
                <Video className="w-5 h-5" /> Join Video Call
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm font-extrabold text-emerald-500 py-2">
                <CheckCircle2 className="w-5 h-5" /> Session Completed
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Video Call Modal */}
      <VideoModal 
        isOpen={isVideoOpen} 
        onClose={() => setIsVideoOpen(false)} 
        roomName={selectedSessionTopic}
      />
    </div>
  );
}