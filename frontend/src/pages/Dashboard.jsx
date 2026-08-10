import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import AuthModal from '../components/AuthModal';
import { 
  LayoutDashboard, Search, MessageSquare, Calendar, Award, Settings, 
  Sun, Moon, Flame, Coins, Clock, Video, BookOpen, Share2, LogIn, 
  UserCheck, Users, Sparkles, CheckCircle, LogOut, ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'explore', 'chat', 'sessions'
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Load User Session
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("User parse error", e);
      }
    }
  }, []);

  // 2. Fetch Mentors
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const currentUserId = user ? (user.id || user._id) : '';
        const res = await axios.get(`http://localhost:5000/api/users/mentors?userId=${currentUserId}`);
        setMentors(res.data);
      } catch (err) {
        console.error('Error fetching mentors:', err);
      }
    };

    fetchMentors();
  }, [user, isAuthOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const filteredMentors = mentors.filter(mentor => 
    mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.skillsToTeach?.some(s => s.skillName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      
      {/* ==================== LEFT SIDEBAR ==================== */}
      <aside className={`w-64 border-r p-5 flex flex-col justify-between sticky top-0 h-screen z-30 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="space-y-8">
          {/* Logo Header */}
          <div className="flex items-center gap-3 px-2">
            <div className="p-2.5 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl text-white font-extrabold text-xl shadow-lg shadow-violet-500/30">📚</div>
            <span className="text-2xl font-black bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent tracking-tight">
              StudyBuddy
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' 
                  : isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </div>
              {activeTab === 'dashboard' && <ChevronRight className="w-4 h-4 opacity-75" />}
            </button>

            <button 
              onClick={() => setActiveTab('explore')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'explore' 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' 
                  : isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span>Explore Mentors</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-extrabold">
                {mentors.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'chat' 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' 
                  : isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5" />
                <span>Peer Messages</span>
              </div>
            </button>

            <button 
              onClick={() => setActiveTab('sessions')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'sessions' 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' 
                  : isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5" />
                <span>My Sessions</span>
              </div>
            </button>
          </nav>
        </div>

        {/* User Card / Bottom Controls */}
        <div className="space-y-4">
          <button 
            onClick={toggleTheme}
            className={`w-full flex items-center justify-between p-3 rounded-2xl border font-bold text-sm transition-all ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-amber-400' : 'bg-slate-50 border-slate-200 text-indigo-600'
            }`}
          >
            <span className="text-xs text-slate-400 uppercase tracking-wider font-extrabold">Theme Mode</span>
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-violet-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="font-bold text-sm leading-tight truncate">{user.name}</p>
                  <p className="text-xs text-emerald-500 font-semibold">{user.skillCredits} Credits 🪙</p>
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

      {/* ==================== RIGHT MAIN CONTENT AREA ==================== */}
      <main className="flex-1 p-8 overflow-y-auto space-y-8">
        
        {/* Top Search & Metrics Header */}
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
              <span>{user ? `${user.streakCount || 0} Day Streak` : '0 Day Streak'}</span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-sm">
              <Coins className="w-4 h-4" />
              <span>{user ? `${user.skillCredits} Skill Credits` : '0 Credits'}</span>
            </div>
          </div>
        </div>

        {/* --- TAB 1: DASHBOARD VIEW --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-3xl border shadow-sm flex items-center gap-5 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Coins className="w-8 h-8" />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Credits Balance</p>
                  <h3 className="text-2xl font-black mt-0.5">{user ? `${user.skillCredits} Skill Credits` : '0 Skill Credits'}</h3>
                </div>
              </div>

              <div className={`p-6 rounded-3xl border shadow-sm flex items-center gap-5 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="p-3.5 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  <Flame className="w-8 h-8" />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Active Streak</p>
                  <h3 className="text-2xl font-black mt-0.5">{user ? `${user.streakCount || 0} Days 🔥` : '0 Days 🔥'}</h3>
                </div>
              </div>

              <div className={`p-6 rounded-3xl border shadow-sm flex items-center gap-5 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Hours Taught</p>
                  <h3 className="text-2xl font-black mt-0.5">0.0 Hours</h3>
                </div>
              </div>
            </div>

            {/* Upcoming Session & Certificate Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-2 p-6 rounded-3xl border shadow-sm space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-violet-500" /> Upcoming Mentorship Session
                  </h2>
                  <span className="text-xs px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 font-extrabold border border-violet-500/20">
                    Today, 6:00 PM
                  </span>
                </div>

                <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div>
                    <h3 className="font-bold text-base">System Design & Node.js Architecture</h3>
                    <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Mentor: Amit Kumar • 1 Credit</p>
                  </div>

                  <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-violet-500/25 active:scale-95 transition-all">
                    <Video className="w-4 h-4" /> Join Video Call
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-700 text-white shadow-xl space-y-4">
                <div className="flex items-center gap-2.5">
                  <Award className="w-7 h-7 text-amber-300" />
                  <h2 className="font-extrabold text-lg">Automated Certificate</h2>
                </div>
                <p className="text-sm text-violet-100 font-medium">
                  Completed 10 sessions? Generate your official peer-mentorship certificate and share on LinkedIn!
                </p>
                <button className="w-full py-3 rounded-2xl bg-white text-violet-700 font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 active:scale-95 transition-all shadow-md">
                  <Share2 className="w-4 h-4" /> Share on LinkedIn
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: EXPLORE MENTORS VIEW --- */}
        {(activeTab === 'explore' || activeTab === 'dashboard') && (
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
                <p className="text-sm mt-1 max-w-md mx-auto">Open another Incognito window (`Ctrl + Shift + N`) and register a new test user to see peer cards live!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMentors.map((mentor) => (
                  <div key={mentor._id} className={`p-6 rounded-3xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between space-y-5 ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-violet-500/50' : 'bg-white border-slate-200/90 hover:border-violet-300'}`}>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white font-bold flex items-center justify-center text-base shadow-md">
                            {mentor.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg leading-tight">{mentor.name}</h3>
                            <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1 mt-0.5">
                              <CheckCircle className="w-3 h-3" /> Verified Peer
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
                              {skill.skillName} • <span className="opacity-75">{skill.level}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Wants to Learn */}
                      <div className="space-y-2">
                        <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Wants to Learn:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {mentor.skillsToLearn?.map((skill, index) => (
                            <span key={index} className="text-xs px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-300 font-bold">
                              {skill.skillName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => alert(`Booking session with ${mentor.name}! (1 Credit deducted)`)}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 active:scale-95 transition-all"
                    >
                      <Calendar className="w-4 h-4" /> Book Mentorship Session
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3: CHAT VIEW PLACEHOLDER --- */}
        {activeTab === 'chat' && (
          <div className={`p-12 text-center rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <MessageSquare className="w-12 h-12 text-violet-500 mx-auto mb-3" />
            <h2 className="text-2xl font-bold">Peer Chat Room</h2>
            <p className="text-slate-400 mt-1">Real-time Socket.io messaging will load here for booked sessions!</p>
          </div>
        )}

        {/* --- TAB 4: SESSIONS VIEW PLACEHOLDER --- */}
        {activeTab === 'sessions' && (
          <div className={`p-12 text-center rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <Calendar className="w-12 h-12 text-violet-500 mx-auto mb-3" />
            <h2 className="text-2xl font-bold">Scheduled Mentorship Sessions</h2>
            <p className="text-slate-400 mt-1">Your upcoming and completed skill exchange sessions list.</p>
          </div>
        )}

      </main>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={(userData) => setUser(userData)} 
      />
    </div>
  );
}