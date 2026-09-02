import React, { useState, useEffect } from 'react';
import { Video, Share2, CheckCircle, Flame, Coins, Clock, Sparkles, Calendar, MessageSquare, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import VideoModal from '../components/VideoModal';
import API from '../services/api';

export default function Home() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [selectedMonth, setSelectedMonth] = useState('Aug');

  const [user, setUser] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('session_room_1');
  const [selectedPeerName, setSelectedPeerName] = useState('Peer Mentor');

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setUser(u);
        fetchSessions(u._id || u.id);
      } catch (e) {}
    }
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await API.get(`/users/mentors?userId=${currentUser._id || ''}`);
      if (res.data && res.data.length > 0) {
        setMentors(res.data);
      } else {
        setMentors([
          { _id: 'usr_mock_201', name: 'Priya Sharma', skillsToTeach: ['React', 'System Design'], skillsToLearn: ['Python'], rating: 4.9 },
          { _id: 'usr_mock_202', name: 'Alex Chen', skillsToTeach: ['Python', 'Data Science'], skillsToLearn: ['Node.js'], rating: 5.0 },
          { _id: 'usr_mock_203', name: 'Ashmak Madhart', skillsToTeach: ['Node.js', 'MongoDB'], skillsToLearn: ['Go'], rating: 4.8 }
        ]);
      }
    } catch (e) {}
  };

  const fetchSessions = async (userId) => {
    try {
      const res = await API.get(`/sessions/my-sessions?userId=${userId}`);
      if (res.data) setSessions(res.data);
    } catch (e) {}
  };

  const handleCancelSession = async (sessionId) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    const studentId = currentUser?._id || currentUser?.id;
    if (!sessionId) return;

    try {
      const res = await API.put(`/sessions/${sessionId}/cancel`, { studentId });
      alert(res.data.message || 'Session request cancelled. 1 Credit refunded!');

      if (currentUser) {
        currentUser.skillCredits = (currentUser.skillCredits || 5) + 1;
        localStorage.setItem('user', JSON.stringify(currentUser));
        setUser(currentUser);
      }

      if (studentId) fetchSessions(studentId);
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed!');
    }
  };

  const handleBookSession = async (mentor) => {
    let currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!currentUser || (!currentUser._id && !currentUser.id)) {
      alert('You are not logged in! Please log in first.');
      return;
    }

    const studentId = currentUser._id || currentUser.id;
    const mentorId = mentor._id || mentor.id;

    if (String(studentId) === String(mentorId)) {
      alert('You cannot send a session request to yourself.');
      return;
    }

    if ((currentUser.skillCredits ?? 5) < 1) {
      currentUser.skillCredits = 5;
      localStorage.setItem('user', JSON.stringify(currentUser));
      setUser(currentUser);
      alert('🎉 +5 Free Skill Credits 🪙 added to your balance!');
    }

    try {
      const mentorTopic = typeof mentor.skillsToTeach?.[0] === 'string'
        ? mentor.skillsToTeach[0]
        : mentor.skillsToTeach?.[0]?.skillName || 'Mentorship Session';

      const res = await API.post('/sessions/book', {
        studentId,
        mentorId,
        studentName: currentUser.name || 'Student',
        mentorName: mentor.name || 'Mentor',
        topic: mentorTopic,
        date: new Date().toISOString().split('T')[0],
        time: '08:00 PM ET',
      });

      alert(res.data.message || 'Skill Swap Request sent successfully!');

      if (res.data.updatedCredits !== undefined) {
        currentUser.skillCredits = res.data.updatedCredits;
        localStorage.setItem('user', JSON.stringify(currentUser));
        setUser(currentUser);
      }

      fetchSessions(studentId);
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed!');
    }
  };

  const cardBg = isDarkMode 
    ? 'bg-[#0F172A] border-slate-800 shadow-xl shadow-black/20 text-slate-100' 
    : 'bg-white border-slate-200 shadow-sm text-slate-900';
  
  const innerCardBg = isDarkMode 
    ? 'bg-[#070D1B] border-slate-800/80' 
    : 'bg-slate-50 border-slate-200';

  const subTextColor = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  const userName = user?.name || 'Student Learner';
  const credits = (user?.skillCredits && Number(user.skillCredits) > 0) ? user.skillCredits : 5;
  const streak = user?.streakCount ?? 0;
  const hours = user?.hoursTaught || 0;

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const [activeDays, setActiveDays] = useState({ Aug: [1, 5, 12, 15, 28] });

  const toggleDayActivity = (day) => {
    setActiveDays(prev => {
      const monthDays = prev[selectedMonth] || [];
      const isAlreadyActive = monthDays.includes(day);
      const updated = isAlreadyActive 
        ? monthDays.filter(d => d !== day)
        : [...monthDays, day];
      return { ...prev, [selectedMonth]: updated };
    });
  };

  const currentMonthActiveCount = (activeDays[selectedMonth] || []).length;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black px-3 py-1 rounded-full bg-white/20 text-white uppercase tracking-wider">
            ✨ Welcome Back
          </span>
          <h1 className="text-3xl md:text-4xl font-black mt-2 tracking-tight">
            Hello, {userName}! 👋
          </h1>
          <p className="text-sm text-violet-100 mt-1 max-w-xl font-medium">
            You have <strong className="text-amber-300">{credits} Skill Credits 🪙</strong> available. Connect with a peer mentor to exchange skills!
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/explore')}
          className="px-6 py-3.5 rounded-2xl bg-white text-violet-700 font-extrabold text-sm shadow-lg hover:bg-slate-100 active:scale-95 transition-all shrink-0 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-violet-600" /> Explore Matched Mentors
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Stats */}
        <div className="lg:col-span-6 grid grid-cols-3 gap-4">
          <div className={`p-5 rounded-3xl border flex flex-col justify-between ${cardBg}`}>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 font-bold flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <p className={`text-[11px] font-extrabold uppercase tracking-wider ${subTextColor}`}>Credits Balance</p>
              <h4 className="text-xl font-black mt-1 text-amber-500">{credits} Skill Credits 🪙</h4>
            </div>
          </div>

          <div className={`p-5 rounded-3xl border flex flex-col justify-between ${cardBg}`}>
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 text-orange-500 font-bold flex items-center justify-center">
              <Flame className="w-5 h-5 fill-orange-500" />
            </div>
            <div className="mt-4">
              <p className={`text-[11px] font-extrabold uppercase tracking-wider ${subTextColor}`}>Active Streak</p>
              <h4 className="text-xl font-black mt-1 text-orange-500">{streak} Days 🔥</h4>
            </div>
          </div>

          <div className={`p-5 rounded-3xl border flex flex-col justify-between ${cardBg}`}>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 font-bold flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <p className={`text-[11px] font-extrabold uppercase tracking-wider ${subTextColor}`}>Hours Taught</p>
              <h4 className="text-xl font-black mt-1 text-emerald-500">{hours} Hrs</h4>
            </div>
          </div>
        </div>

        {/* Clean Activity Heatmap Grid */}
        <div className={`lg:col-span-6 p-6 rounded-3xl border flex flex-col justify-between ${cardBg}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2 text-blue-500">
              🔥 Daily Activity Heatmap
            </h3>
            
            {/* Month Filter Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border outline-none ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300'
              }`}
            >
              {months.map(m => <option key={m} value={m}>{m} 2026</option>)}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold">
              <p className={subTextColor}>
                Activity for <strong className="text-blue-400">{selectedMonth} 2026</strong> (Click box to log active study):
              </p>
              <span className="text-[11px] font-black text-blue-500 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                {currentMonthActiveCount} Active Days
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2 justify-items-center">
              {daysInMonth.map((day) => {
                const isActive = (activeDays[selectedMonth] || []).includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => toggleDayActivity(day)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-all cursor-pointer hover:scale-110 active:scale-95 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/40 ring-2 ring-blue-400'
                        : isDarkMode
                        ? 'bg-slate-800/80 text-slate-500 border border-slate-700/50 hover:bg-slate-700'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                    }`}
                    title={`${selectedMonth} ${day}: ${isActive ? 'Question Solved / Session Completed' : 'Click to log activity'}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`flex items-center justify-between text-xs mt-3 font-semibold ${subTextColor}`}>
            <span>{currentMonthActiveCount} Days Solved</span>
            <div className="flex items-center gap-1.5">
              <span>Heatmap Status</span>
              <div className="w-3.5 h-3.5 rounded-md bg-slate-800 border border-slate-700" title="Inactive" />
              <div className="w-3.5 h-3.5 rounded-md bg-blue-600 ring-1 ring-blue-400" title="Active Solved (Blue Box)" />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Dynamic Skill Swap Match Options */}
        <div className={`lg:col-span-8 p-6 rounded-3xl border space-y-4 ${cardBg}`}>
          <div className="flex items-center justify-between">
            <h3 className={`font-bold text-xs uppercase tracking-wider ${subTextColor}`}>⚡ Live Skill Swap Matches For You</h3>
            <span className="text-xs px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 font-extrabold border border-violet-500/20">
              {mentors.length} Peer Matches Online
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mentors.map((m) => {
              const teachList = m.skillsToTeach?.map((s) => typeof s === 'string' ? s : s.skillName) || ['Mentoring'];
              const currentUserIdStr = user?._id || user?.id || '';
              const relatedSession = sessions.find(s => 
                (String(s.mentor?._id || s.mentor) === String(m._id || m.id) && String(s.student?._id || s.student) === String(currentUserIdStr)) ||
                (String(s.student?._id || s.student) === String(m._id || m.id) && String(s.mentor?._id || s.mentor) === String(currentUserIdStr))
              );
              const sessionStatus = relatedSession?.status?.toLowerCase();

              return (
                <div key={m._id || m.id} className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 ${innerCardBg}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center text-base shadow-md">
                        {m.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base leading-tight">{m.name}</h4>
                        <span className="text-xs text-amber-400 font-bold">★ {m.rating || '5.0'}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      ⚡ 98% Match
                    </span>
                  </div>

                  <p className={`text-xs ${subTextColor}`}>
                    Can teach you: <strong className="text-violet-400">{teachList.join(', ')}</strong>
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    {sessionStatus === 'accepted' || sessionStatus === 'upcoming' ? (
                      <button 
                        onClick={() => handleStartCall(relatedSession?._id || `meet_room_${m._id}`, m.name)}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                      >
                        <Video className="w-4 h-4" /> Open Workspace Call
                      </button>
                    ) : sessionStatus === 'pending' ? (
                      <button 
                        onClick={() => handleCancelSession(relatedSession?._id)}
                        className="flex-1 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20 font-extrabold text-xs text-center transition-all cursor-pointer"
                        title="Click to cancel pending request and refund 1 credit"
                      >
                        ⏳ Request Pending (Click to Cancel)
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleBookSession(m)}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                      >
                        <Calendar className="w-4 h-4" /> Request Skill Swap (1 Cr)
                      </button>
                    )}
                    <button 
                      onClick={() => navigate('/chat')}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Chat
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Automatic Certificate Box */}
        <div className={`lg:col-span-4 p-6 rounded-3xl border flex flex-col justify-between space-y-4 text-center ${
          isDarkMode 
            ? 'bg-gradient-to-br from-[#0F172A] via-[#151D36] to-[#1E1B4B] border-slate-800 text-slate-100' 
            : 'bg-gradient-to-br from-white via-indigo-50/50 to-violet-50 border-slate-200 text-slate-900'
        }`}>
          <div>
            <div className="flex items-center justify-center gap-2 text-violet-500 font-bold text-sm">📚 StudyBuddy Network</div>
            <h3 className="text-xl font-black mt-2">Verified Skill Certificate</h3>
            <p className={`text-xs ${subTextColor}`}>Automatically generated upon target goal completion</p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-500 text-xs font-extrabold border border-cyan-500/30">
              <CheckCircle className="w-3.5 h-3.5" /> Verified Badge
            </div>
          </div>
          <button 
            onClick={() => navigate('/certificates')}
            className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4" /> View & Print Certificates
          </button>
        </div>
      </div>

      {/* Google Meet Style Video Call Modal */}
      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        roomName={selectedRoom}
        peerName={selectedPeerName}
      />
    </div>
  );
}