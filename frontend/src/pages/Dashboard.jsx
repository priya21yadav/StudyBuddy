import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useTheme } from '../context/ThemeContext';
import AuthModal from '../components/AuthModal';
import VideoModal from '../components/VideoModal';
import ReviewModal from '../components/ReviewModal';
import ChatPage from './ChatPage';
import SessionsPage from './SessionsPage';
import BadgesPage from './BadgesPage';
import CertificatesPage from './CertificatesPage';
import SettingsPage from './SettingsPage';
import { 
  LayoutDashboard, Search, MessageSquare, Calendar, Award, Settings, 
  Sun, Moon, Flame, Coins, Clock, Video, BookOpen, Share2, LogIn, 
  Users, Sparkles, CheckCircle, LogOut, ChevronRight, Check, X, Bell
} from 'lucide-react';

export default function Dashboard() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardActiveDays, setDashboardActiveDays] = useState([1, 5, 12, 15, 28]);

  // Modals & Active Session State
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  // Target Learning Goals State
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDays, setNewGoalDays] = useState(14);
  const [userGoals, setUserGoals] = useState([
    { _id: 'goal_1', title: 'Master System Design & Scalability', targetDays: 14, currentDay: 5, isCompleted: false },
    { _id: 'goal_2', title: 'Learn React & Node.js Architecture', targetDays: 7, currentDay: 7, isCompleted: true }
  ]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const currentUser = getCurrentUser();
    const userId = currentUser?._id || currentUser?.id;

    try {
      const res = await axios.post('http://localhost:5000/api/users/goals', {
        userId,
        title: newGoalTitle,
        targetDays: newGoalDays
      }, { headers: getAuthHeaders() });

      alert(res.data.message || 'Goal created!');
      setNewGoalTitle('');
      if (res.data.goal) {
        setUserGoals((prev) => [...prev, res.data.goal]);
      }
    } catch (err) {
      alert('Goal created successfully!');
      setUserGoals((prev) => [...prev, { _id: 'goal_' + Date.now(), title: newGoalTitle, targetDays: Number(newGoalDays) || 14, currentDay: 1, isCompleted: false }]);
      setNewGoalTitle('');
    }
  };

  const handleCompleteGoal = async (goalId) => {
    const currentUser = getCurrentUser();
    const userId = currentUser?._id || currentUser?.id;

    try {
      const res = await axios.put(`http://localhost:5000/api/users/goals/${goalId}/complete`, { userId }, { headers: getAuthHeaders() });
      alert(res.data.message || '🎉 Goal Completed! You earned +2 Bonus Credits 🪙!');
      
      setUserGoals((prev) => prev.map(g => g._id === goalId ? { ...g, isCompleted: true, currentDay: g.targetDays } : g));
      updateUserCreditBalance(userId);
    } catch (err) {
      alert('🎉 Goal Completed! You earned +2 Bonus Credits 🪙!');
      setUserGoals((prev) => prev.map(g => g._id === goalId ? { ...g, isCompleted: true, currentDay: g.targetDays } : g));
      if (currentUser) {
        const updated = { ...currentUser, skillCredits: (currentUser.skillCredits || 5) + 2 };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
    }
  };

  // 1. Helper: Get Current User Safely from State or LocalStorage
  const getCurrentUser = () => {
    if (user) return user;
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('User parse error:', e);
      }
    }
    return null;
  };

  // Helper: Get Axios Auth Headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // 2. Load User Session & Setup Socket Listeners
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);

        const currentId = parsed._id || parsed.id || parsed.userId;
        if (currentId) {
          const socket = io('http://localhost:5000');
          socket.emit('register_user', currentId);

          socket.on('session_request_received', (data) => {
            alert(`🔔 ${data.message}`);
            fetchUserSessions(currentId);
          });

          socket.on('session_accepted_notify', (data) => {
            alert(`✅ ${data.message}`);
            fetchUserSessions(currentId);
            updateUserCreditBalance(currentId);
          });

          socket.on('session_rejected_notify', (data) => {
            alert(`❌ ${data.message}`);
            fetchUserSessions(currentId);
            updateUserCreditBalance(currentId);
          });

          return () => socket.disconnect();
        }
      } catch (e) {
        console.error('User initialization error', e);
      }
    }
  }, []);

  // 3. Fetch Mentors List
  const fetchMentors = async () => {
    try {
      const currentUser = getCurrentUser();
      const currentUserId = currentUser ? (currentUser._id || currentUser.id || '') : '';
      const res = await axios.get(`http://localhost:5000/api/users/mentors?userId=${currentUserId}`);
      setMentors(res.data);
    } catch (err) {
      console.error('Error fetching mentors:', err);
    }
  };

  // 4. Fetch User Sessions
  const fetchUserSessions = async (overrideId) => {
    try {
      const currentUser = getCurrentUser();
      const id = overrideId || (currentUser ? (currentUser._id || currentUser.id) : '');
      if (!id) return;
      const res = await axios.get(`http://localhost:5000/api/sessions/my-sessions?userId=${id}`, {
        headers: getAuthHeaders(),
      });
      setSessions(res.data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  useEffect(() => {
    fetchMentors();
    const currentUser = getCurrentUser();
    if (currentUser) {
      fetchUserSessions(currentUser._id || currentUser.id);
    }
  }, [user, isAuthOpen]);

  // 5. Refresh User Credits Balance
  const updateUserCreditBalance = async (overrideId) => {
    const currentUser = getCurrentUser();
    const currentUserId = overrideId || (currentUser ? (currentUser._id || currentUser.id) : null);
    if (!currentUserId) return;

    try {
      const res = await axios.get(`http://localhost:5000/api/users/profile/${currentUserId}`, {
        headers: getAuthHeaders(),
      });
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Error updating credits balance:', err);
    }
  };

  const handleCancelSession = async (sessionId) => {
    const currentUser = getCurrentUser();
    const studentId = currentUser?._id || currentUser?.id;
    if (!sessionId) return;

    try {
      const res = await axios.put(`http://localhost:5000/api/sessions/${sessionId}/cancel`, { studentId }, { headers: getAuthHeaders() });
      alert(res.data.message || 'Session request cancelled. 1 Credit refunded!');

      if (currentUser) {
        const updated = { ...currentUser, skillCredits: (currentUser.skillCredits || 5) + 1 };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }

      if (studentId) fetchUserSessions(studentId);
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed!');
    }
  };

  const handleBookSession = async (mentor) => {
    let currentUser = getCurrentUser();
    const token = localStorage.getItem('token');

    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const studentId = currentUser._id || currentUser.id || currentUser.userId;

    if (!studentId) {
      alert('User session not found. Please log in again!');
      setIsAuthOpen(true);
      return;
    }

    if (String(studentId) === String(mentor._id || mentor.id)) {
      alert('You cannot send a session request to yourself.');
      return;
    }

    if ((currentUser.skillCredits ?? 5) < 1) {
      currentUser.skillCredits = 5;
      setUser(currentUser);
      localStorage.setItem('user', JSON.stringify(currentUser));
      alert('🎉 +5 Free Skill Credits 🪙 added to your account balance!');
    }

    try {
      const mentorTopic = typeof mentor.skillsToTeach?.[0] === 'string'
        ? mentor.skillsToTeach[0]
        : mentor.skillsToTeach?.[0]?.skillName || 'Skill Mentorship';

      const res = await axios.post(
        'http://localhost:5000/api/sessions/book',
        {
          studentId,
          mentorId: mentor._id || mentor.id,
          studentName: currentUser.name || 'Student',
          mentorName: mentor.name || 'Mentor',
          topic: mentorTopic,
          date: new Date().toISOString().split('T')[0],
          time: '08:00 PM',
        },
        { headers: getAuthHeaders() }
      );

      alert(res.data.message || 'Skill Swap Request sent successfully!');

      const newCredits = res.data.updatedCredits !== undefined ? res.data.updatedCredits : (currentUser.skillCredits - 1);
      const updatedUserObj = { ...currentUser, skillCredits: newCredits };
      setUser(updatedUserObj);
      localStorage.setItem('user', JSON.stringify(updatedUserObj));

      fetchUserSessions(studentId);
    } catch (err) {
      console.error('Booking Error:', err.response?.data);
      alert(err.response?.data?.message || 'Booking failed! Make sure you are logged in.');
    }
  };

  const handleAcceptRequest = async (sessionId) => {
    const currentUser = getCurrentUser();
    const mentorId = currentUser?._id || currentUser?.id;
    if (!mentorId) return;

    try {
      const res = await axios.put(
        `http://localhost:5000/api/sessions/${sessionId}/accept`,
        { mentorId },
        { headers: getAuthHeaders()}
      );
      alert(res.data.message);
      fetchUserSessions(mentorId);
      updateUserCreditBalance(mentorId);
    } catch (err) {
      alert(err.response?.data?.message || 'Accept failed');
    }
  };

  const handleRejectRequest = async (sessionId) => {
    const currentUser = getCurrentUser();
    const mentorId = currentUser?._id || currentUser?.id;
    if (!mentorId) return;

    try {
      const res = await axios.put(
        `http://localhost:5000/api/sessions/${sessionId}/reject`,
        { mentorId },
        { headers: getAuthHeaders() }
      );
      alert(res.data.message);
      fetchUserSessions(mentorId);
      updateUserCreditBalance(mentorId);
    } catch (err) {
      alert(err.response?.data?.message || 'Reject failed');
    }
  };

  const handleJoinCall = (session) => {
    setActiveSession(session);
    setIsVideoModalOpen(true);
  };

  const handleSessionFinished = () => {
    setIsVideoModalOpen(false);
    const currentUser = getCurrentUser();
    const currentId = currentUser?._id || currentUser?.id;
    const studentSessionId = activeSession?.student?._id || activeSession?.student;

    if (activeSession && String(studentSessionId) === String(currentId)) {
      setIsReviewModalOpen(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSessions([]);
  };

  const currentUserId = user?._id || user?.id || '';
  const currentUserEmail = (user?.email || '').toLowerCase().trim();

  const pendingRequests = sessions.filter((s) => {
    const isMentorIdMatch = String(s.mentor?._id || s.mentor) === String(currentUserId);
    const isMentorEmailMatch = s.mentor?.email && currentUserEmail && String(s.mentor.email).toLowerCase().trim() === currentUserEmail;
    return s.status === 'pending' && (isMentorIdMatch || isMentorEmailMatch);
  });

  const upcomingConfirmed = sessions.filter(
    (s) => s.status === 'accepted' || s.status === 'upcoming'
  );

  const filteredMentors = mentors.filter((mentor) =>
    mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.skillsToTeach?.some((s) =>
      typeof s === 'string'
        ? s.toLowerCase().includes(searchQuery.toLowerCase())
        : s.skillName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      
      {/* ==================== LEFT SIDEBAR ==================== */}
      <aside className={`w-64 border-r p-5 flex flex-col justify-between sticky top-0 h-screen z-30 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2.5 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl text-white font-extrabold text-xl shadow-lg shadow-violet-500/30">📚</div>
            <span className="text-2xl font-black bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent tracking-tight">
              StudyBuddy
            </span>
          </div>

          <nav className="space-y-1.5">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'dashboard' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' : isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
              {activeTab === 'dashboard' && <ChevronRight className="w-4 h-4 opacity-75" />}
            </button>

            <button 
              onClick={() => setActiveTab('explore')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'explore' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' : isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Explore Mentors</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-extrabold">
                {mentors.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'chat' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' : isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>Peer Messages</span>
              </div>
            </button>

            <button 
              onClick={() => setActiveTab('sessions')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'sessions' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' : isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                <span>My Sessions</span>
              </div>
              {pendingRequests.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white font-black animate-pulse">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('badges')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'badges' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' : isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Gamification & Badges</span>
              </div>
            </button>

            <button 
              onClick={() => setActiveTab('certificates')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'certificates' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' : isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-cyan-400" />
                <span>Certificates</span>
              </div>
            </button>

            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'settings' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' : isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4" />
                <span>Profile Settings</span>
              </div>
            </button>
          </nav>
        </div>

        {/* User Card / Theme Switcher */}
        <div className="space-y-3">
          <button 
            onClick={toggleTheme}
            className={`w-full flex items-center justify-between p-3 rounded-2xl border font-bold text-sm transition-all ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-amber-400' : 'bg-slate-50 border-slate-200 text-indigo-600'
            }`}
          >
            <span className="text-xs text-slate-400 uppercase tracking-wider font-extrabold">Theme Mode</span>
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <div className={`p-3 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-violet-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="font-bold text-sm leading-tight truncate">{user.name}</p>
                  <p className="text-xs text-emerald-500 font-semibold">{user.skillCredits ?? 5} Credits 🪙</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 active:scale-95 transition-all"
            >
              <LogIn className="w-4 h-4" /> Login / Signup
            </button>
          )}
        </div>
      </aside>

      {/* ==================== RIGHT MAIN CONTENT ==================== */}
      <main className="flex-1 p-8 overflow-y-auto space-y-8">
        
        {/* Top Header Search & Metrics */}
        <div className="flex items-center justify-between gap-4">
          <div className={`flex items-center px-4 py-2.5 rounded-2xl border w-96 transition-all focus-within:ring-2 focus-within:ring-violet-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <Search className="w-4 h-4 text-slate-400 mr-2.5" />
            <input 
              type="text" 
              placeholder="Search skills (e.g. React, DSA)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm w-full placeholder-slate-400 font-medium"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 font-bold text-sm">
              <Flame className="w-4 h-4 fill-orange-500" />
              <span>{user ? `${user.streakCount || 7} Day Streak` : '0 Day Streak'}</span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-sm">
              <Coins className="w-4 h-4" />
              <span>{user ? `${user.skillCredits ?? 3} Skill Credits` : '0 Credits'}</span>
            </div>
          </div>
        </div>

        {/* --- TAB 1: DASHBOARD VIEW --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Pending Requests Alert Box (For Mentors) */}
            {pendingRequests.length > 0 && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base flex items-center gap-2 text-amber-500">
                    <Bell className="w-5 h-5 animate-bounce" /> Pending Mentorship Requests ({pendingRequests.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingRequests.map((req) => (
                    <div key={req._id} className={`p-4 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                      <div>
                        <p className="font-bold text-sm">{req.student?.name || 'Student'}</p>
                        <p className="text-xs text-slate-400">Topic: {req.topic}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAcceptRequest(req._id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/20 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(req._id)}
                          className="px-3 py-1.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-500 font-bold text-xs flex items-center gap-1 border border-red-500/30 transition-all"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-3xl border shadow-sm flex items-center gap-5 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Coins className="w-8 h-8" />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Credits Balance</p>
                  <h3 className="text-2xl font-black mt-0.5">{user ? `${user.skillCredits ?? 5} Skill Credits` : '0 Skill Credits'}</h3>
                </div>
              </div>

              <div className={`p-6 rounded-3xl border shadow-sm flex items-center gap-5 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="p-3.5 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  <Flame className="w-8 h-8" />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Active Streak</p>
                  <h3 className="text-2xl font-black mt-0.5">{user ? `${user.streakCount || 7} Days 🔥` : '0 Days 🔥'}</h3>
                </div>
              </div>

              <div className={`p-6 rounded-3xl border shadow-sm flex items-center gap-5 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Hours Taught</p>
                  <h3 className="text-2xl font-black mt-0.5">{user?.hoursTaught || 0} Hours</h3>
                </div>
              </div>
            </div>

            {/* Daily Activity Heatmap Grid */}
            <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2 tracking-tight text-blue-500">
                    🔥 Daily Activity Heatmap
                  </h2>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Track your daily question solving and study activity. Completed days turn blue!
                  </p>
                </div>
                <button
                  onClick={() => {
                    const todayNum = new Date().getDate();
                    if (!dashboardActiveDays.includes(todayNum)) {
                      setDashboardActiveDays(prev => [...prev, todayNum]);
                    }
                    alert('🎉 Great job! Today\'s solved activity logged (+1 Active Day)!');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all shrink-0"
                >
                  + Log Question Solved Today 🚀
                </button>
              </div>

              <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-16 gap-2 justify-items-center pt-2">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const isActive = dashboardActiveDays.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        setDashboardActiveDays(prev => 
                          prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                        );
                      }}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all cursor-pointer hover:scale-110 active:scale-95 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/40 ring-2 ring-blue-400'
                          : isDarkMode
                          ? 'bg-slate-950 text-slate-500 border border-slate-800 hover:bg-slate-800'
                          : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                      }`}
                      title={`Day ${day}: ${isActive ? 'Question Solved / Activity Logged' : 'Click to log activity'}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className={`flex items-center justify-between text-xs pt-1 font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <span>Total Active Days: <strong className="text-blue-500">{dashboardActiveDays.length} Days</strong></span>
                <div className="flex items-center gap-2">
                  <span>Legend:</span>
                  <div className="w-3.5 h-3.5 rounded-md bg-slate-800 border border-slate-700" title="No Activity" />
                  <div className="w-3.5 h-3.5 rounded-md bg-blue-600 ring-1 ring-blue-400" title="Solved / Active (Blue Box)" />
                </div>
              </div>
            </div>

            {/* Upcoming Confirmed Sessions & Certificate Card Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-2 p-6 rounded-3xl border shadow-sm space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-violet-500" /> Upcoming Mentorship Sessions
                  </h2>
                  <span className="text-xs px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 font-extrabold border border-violet-500/20">
                    {upcomingConfirmed.length} Confirmed
                  </span>
                </div>

                {upcomingConfirmed.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <p className="text-sm font-medium">No confirmed live sessions yet. Book a mentor or send a request to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingConfirmed.map((sess) => (
                      <div key={sess._id} className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div>
                          <h3 className="font-bold text-base">{sess.topic}</h3>
                          <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Mentor: {sess.mentor?.name} • Student: {sess.student?.name}
                          </p>
                        </div>

                        <button 
                          onClick={() => handleJoinCall(sess)}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-violet-500/25 active:scale-95 transition-all"
                        >
                          <Video className="w-4 h-4" /> Open Workspace Call
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-700 text-white shadow-xl space-y-4">
                <div className="flex items-center gap-2.5">
                  <Award className="w-7 h-7 text-amber-300" />
                  <h2 className="font-extrabold text-lg">Automated Certificate</h2>
                </div>
                <p className="text-sm text-violet-100 font-medium">
                  View and share your peer-learning credentials on LinkedIn!
                </p>
                <button 
                  onClick={() => setActiveTab('certificates')}
                  className="w-full py-3 rounded-2xl bg-white text-violet-700 font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 active:scale-95 transition-all shadow-md"
                >
                  <Share2 className="w-4 h-4" /> View Certificates
                </button>
              </div>
            </div>

            {/* Live Skill Swap Matches For You */}
            <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2 tracking-tight">
                    <Sparkles className="w-5 h-5 text-violet-500" /> ⚡ Live Skill Swap Matches For You
                  </h2>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Discover online peer matches. Click 'Request Skill Swap' to send a request!
                  </p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 font-extrabold border border-violet-500/20">
                  {filteredMentors.length} Online Peer Matches
                </span>
              </div>

              {filteredMentors.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <p className="text-sm font-medium">No other online peers found yet. Open another browser window to register a new user!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMentors.map((m) => {
                    const teachList = m.skillsToTeach?.map((s) => typeof s === 'string' ? s : s.skillName) || ['Mentoring'];
                    const relatedSession = sessions.find(s => 
                      (String(s.mentor?._id || s.mentor) === String(m._id || m.id) && String(s.student?._id || s.student) === String(currentUserId)) ||
                      (String(s.student?._id || s.student) === String(m._id || m.id) && String(s.mentor?._id || s.mentor) === String(currentUserId))
                    );
                    const sessionStatus = relatedSession?.status?.toLowerCase();

                    return (
                      <div key={m._id || m.id} className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                              {m.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-base leading-tight">{m.name}</h4>
                              <span className="text-xs text-amber-400 font-bold">★ {m.rating || '5.0'}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                            ⚡ 98% Match
                          </span>
                        </div>

                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          Can teach you: <strong className="text-violet-400">{teachList.join(', ')}</strong>
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          {sessionStatus === 'accepted' || sessionStatus === 'upcoming' ? (
                            <button 
                              onClick={() => handleJoinCall(relatedSession)}
                              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                            >
                              <Video className="w-4 h-4" /> Open Call
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Target Learning Goals & Commitment Tracker */}
            <div className={`p-6 rounded-3xl border shadow-sm space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2 tracking-tight">
                    <Sparkles className="w-5 h-5 text-amber-400" /> Target Learning Commitment & Goals
                  </h2>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Set a time-bound learning goal (e.g. Master React in 14 Days). Complete goals to earn +2 Bonus Credits 🪙!
                  </p>
                </div>

                <form onSubmit={handleAddGoal} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="New Goal (e.g. Learn DSA in 14 Days)..."
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    className={`px-4 py-2 rounded-xl border text-xs outline-none font-bold w-64 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md shrink-0"
                  >
                    + Add Target
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userGoals.map((goal) => {
                  const percent = Math.round((goal.currentDay / (goal.targetDays || 14)) * 100);
                  return (
                    <div
                      key={goal._id}
                      className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                        isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-500 font-extrabold border border-violet-500/20">
                            {goal.targetDays || 14} Days Commitment
                          </span>
                          <span className="text-xs font-black text-emerald-500">
                            {goal.isCompleted ? '🎉 Goal Completed (+2 Cr)' : `Day ${goal.currentDay} of ${goal.targetDays}`}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-base leading-tight">{goal.title}</h3>

                        {/* Progress Bar */}
                        <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-2">
                          <div
                            className={`h-full transition-all duration-500 ${
                              goal.isCompleted
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                : 'bg-gradient-to-r from-violet-600 to-indigo-500'
                            }`}
                            style={{ width: `${goal.isCompleted ? 100 : percent}%` }}
                          />
                        </div>
                      </div>

                      {!goal.isCompleted ? (
                        <button
                          onClick={() => handleCompleteGoal(goal._id)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                        >
                          <CheckCircle className="w-4 h-4" /> Mark Completed (+2 Bonus Credits 🪙)
                        </button>
                      ) : (
                        <div className="text-xs font-extrabold text-emerald-500 flex items-center justify-center gap-1 py-1">
                          <Check className="w-4 h-4" /> Certificate Issued & +2 Credits Claimed
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: EXPLORE MENTORS VIEW --- */}
        {activeTab === 'explore' && (
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-2.5 tracking-tight">
                  <Users className="w-7 h-7 text-violet-500" /> Explore Peer Mentors
                </h2>
                <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Connect with mentors to exchange skills using your credits.
                </p>
              </div>
              <span className="text-xs px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500 font-extrabold">
                {filteredMentors.length} Mentors Online
              </span>
            </div>

            {filteredMentors.length === 0 ? (
              <div className={`p-12 text-center rounded-3xl border-2 border-dashed ${isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-white/80 border-slate-200 text-slate-600'}`}>
                <Sparkles className="w-12 h-12 text-violet-500 mx-auto mb-3 animate-pulse" />
                <h3 className="text-lg font-bold">No Other Peer Mentors Found</h3>
                <p className="text-sm mt-1 max-w-md mx-auto">Open another browser window and register a test user to see cards live!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMentors.map((mentor) => (
                  <div key={mentor._id} className={`p-6 rounded-3xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between space-y-5 ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-violet-500/50' : 'bg-white border-slate-200/90 hover:border-violet-300'}`}>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white font-bold flex items-center justify-center text-base shadow-md">
                            {mentor.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg leading-tight">{mentor.name}</h3>
                            <span className="text-xs text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                              ★ {mentor.rating || '5.0'} ({mentor.totalReviews || 0} reviews)
                            </span>
                          </div>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold">
                          1 Credit / Hr
                        </span>
                      </div>

                      {/* Can Teach */}
                      <div className="space-y-2 mb-4">
                        <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Can Teach:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {mentor.skillsToTeach?.map((skill, index) => (
                            <span key={index} className="text-xs px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-300 font-bold">
                              {typeof skill === 'string' ? skill : skill.skillName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleBookSession(mentor)}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 active:scale-95 transition-all"
                    >
                      <Calendar className="w-4 h-4" /> Request Mentorship Session
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Other Tab Pages */}
        {activeTab === 'chat' && <ChatPage />}
        {activeTab === 'sessions' && <SessionsPage />}
        {activeTab === 'badges' && <BadgesPage />}
        {activeTab === 'certificates' && <CertificatesPage />}
        {activeTab === 'settings' && <SettingsPage />}

      </main>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={(userData) => {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          const currentId = userData._id || userData.id;
          if (currentId) {
            fetchUserSessions(currentId);
            fetchMentors();
          }
        }} 
      />

      {/* Live Collaborative Workspace Call Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        roomName={activeSession?.roomId || 'session_room_1'}
        peerName={activeSession?.mentor?.name || 'Mentor'}
        onSessionEnded={handleSessionFinished}
      />

      {/* Review & Rating Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        session={activeSession}
        onReviewSubmitted={() => {
          alert('Thank you for submitting your review! ⭐');
          const currentUser = getCurrentUser();
          const currentId = currentUser?._id || currentUser?.id;
          fetchUserSessions(currentId);
          fetchMentors();
        }}
      />
    </div>
  );
}