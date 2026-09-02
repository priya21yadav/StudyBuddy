import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Video, User, CheckCircle2, AlertCircle, Check, X, Bell } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import VideoModal from '../components/VideoModal';

export default function SessionsPage() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [selectedSessionTopic, setSelectedSessionTopic] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get current logged-in user details
  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = savedUser._id || savedUser.id || '';

  // Fetch real sessions from Backend API
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/sessions/my-sessions?userId=${userId}`);
      
      if (res.data) {
        setSessions(res.data);
      }
    } catch (err) {
      console.log('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (sessionId) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/sessions/${sessionId}/accept`,
        { mentorId: userId },
        { headers: { 'Content-Type': 'application/json' } }
      );
      alert(res.data.message);
      fetchSessions();
    } catch (err) {
      alert(err.response?.data?.message || 'Accept failed');
    }
  };

  const handleRejectRequest = async (sessionId) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/sessions/${sessionId}/reject`,
        { mentorId: userId },
        { headers: { 'Content-Type': 'application/json' } }
      );
      alert(res.data.message);
      fetchSessions();
    } catch (err) {
      alert(err.response?.data?.message || 'Reject failed');
    }
  };

  const cardBg = isDarkMode 
    ? 'bg-[#0F172A] border-slate-800 text-slate-100 shadow-xl' 
    : 'bg-white border-slate-200 text-slate-900 shadow-sm';

  const innerBg = isDarkMode 
    ? 'bg-[#070D1B] border-slate-800/80' 
    : 'bg-slate-50 border-slate-200';

  const textHeading = isDarkMode ? 'text-white' : 'text-slate-900';
  const textSub = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  const handleStartCall = (id, topic) => {
    setSelectedSessionId(id);
    setSelectedSessionTopic(topic);
    setIsVideoOpen(true);
  };

  const filteredSessions = sessions.filter((s) => {
    const st = (s.status || 'upcoming').toLowerCase();
    if (activeTab === 'pending') return st === 'pending';
    if (activeTab === 'upcoming') return st === 'accepted' || st === 'upcoming';
    if (activeTab === 'completed') return st === 'completed';
    return false;
  });

  const pendingCount = sessions.filter(s => s.status === 'pending').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h1 className={`text-3xl font-black tracking-tight ${textHeading}`}>
          MY SESSIONS
        </h1>
        <p className={`text-sm font-semibold mt-1 ${textSub}`}>
          Manage scheduled mentoring calls, study requests, and session history.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {[
          { id: 'upcoming', label: 'Upcoming Sessions' },
          { id: 'pending', label: `Pending Requests ${pendingCount > 0 ? `(${pendingCount})` : ''}` },
          { id: 'completed', label: 'Completed History' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-sm capitalize transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                : isDarkMode 
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-white' 
                  : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-bold text-sm">
          Loading sessions...
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className={`p-12 rounded-3xl border text-center space-y-3 ${cardBg}`}>
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className={`text-lg font-bold ${textHeading}`}>No {activeTab} sessions found</h3>
          <p className={`text-xs ${textSub}`}>
            {activeTab === 'pending' ? 'No pending requests at the moment.' : 'Explore mentors to book your next 1-on-1 skill swap session!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSessions.map((session) => {
            const studentIdStr = String(session.student?._id || session.student);
            const mentorIdStr = String(session.mentor?._id || session.mentor);
            const userEmailStr = (savedUser?.email || '').toLowerCase().trim();
            const mentorEmailStr = (session.mentor?.email || '').toLowerCase().trim();

            const isMentor = (mentorIdStr === String(userId)) || (mentorEmailStr && userEmailStr && mentorEmailStr === userEmailStr);
            const status = (session.status || 'upcoming').toLowerCase();

            return (
              <div 
                key={session._id} 
                className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${cardBg}`}
              >
                <div className={`p-5 rounded-2xl border space-y-3 ${innerBg}`}>
                  <div className="flex justify-between items-start">
                    <h3 className={`font-extrabold text-lg ${textHeading}`}>
                      {session.topic || 'Peer Mentoring Session'}
                    </h3>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                      1 Credit 🪙
                    </span>
                  </div>

                  <div className={`space-y-2 text-sm font-semibold ${textSub}`}>
                    <p className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-violet-500 shrink-0" /> 
                      <span>
                        Mentor: <strong className={textHeading}>{session.mentor?.name || 'Mentor'}</strong>
                      </span>
                    </p>
                    <p className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-cyan-500 shrink-0" /> 
                      <span>
                        Student: <strong className={textHeading}>{session.student?.name || 'Student'}</strong>
                      </span>
                    </p>
                    <p className="flex items-center gap-2.5">
                      <CalendarIcon className="w-4 h-4 text-amber-500 shrink-0" /> 
                      <span>{session.date || 'Today'}</span>
                    </p>
                    <p className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-emerald-500 shrink-0" /> 
                      <span>{session.time || '08:00 PM'}</span>
                    </p>
                  </div>
                </div>

                {status === 'pending' ? (
                  isMentor ? (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleAcceptRequest(session._id)}
                          className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                        >
                          <Check className="w-4 h-4" /> Accept Request (+1 Cr)
                        </button>
                        <button
                          onClick={() => handleRejectRequest(session._id)}
                          className="px-4 py-3 rounded-2xl bg-red-600/10 hover:bg-red-600/20 text-red-500 font-extrabold text-sm flex items-center justify-center gap-1 border border-red-500/30 transition-all"
                        >
                          <X className="w-4 h-4" /> Decline
                        </button>
                      </div>
                      <button 
                        onClick={() => handleStartCall(session._id, session.topic)}
                        className="w-full py-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 font-extrabold text-xs flex items-center justify-center gap-2 border border-violet-500/30 transition-all"
                      >
                        <Video className="w-4 h-4" /> Join Video Call Workspace
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2">
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-extrabold text-xs text-center flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4 animate-spin" /> Pending Approval from {session.mentor?.name || 'Mentor'}
                      </div>
                      <button 
                        onClick={() => handleStartCall(session._id, session.topic)}
                        className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                      >
                        <Video className="w-4 h-4" /> Join Video Call Workspace
                      </button>
                    </div>
                  )
                ) : status === 'accepted' || status === 'upcoming' ? (
                  <button 
                    onClick={() => handleStartCall(session._id, session.topic)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all active:scale-95"
                  >
                    <Video className="w-5 h-5" /> Join Video Call Workspace
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-sm font-extrabold text-emerald-500 py-2">
                    <CheckCircle2 className="w-5 h-5" /> Session Completed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Video Call Modal */}
      <VideoModal 
        isOpen={isVideoOpen} 
        onClose={() => setIsVideoOpen(false)} 
        roomName={selectedSessionId || (selectedSessionTopic ? selectedSessionTopic.replace(/[^a-zA-Z0-9]/g, '_') : 'global_session_room')}
      />
    </div>
  );
}