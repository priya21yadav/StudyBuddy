import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home as HomeIcon, Search, Calendar, MessageSquare, Award, FileCheck, 
  Settings, Flame, Coins, Sun, Moon 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import AuthModal from './AuthModal';

export default function Layout({ children }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const navItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Explore Mentors', path: '/explore', icon: Search },
    { name: 'Sessions', path: '/sessions', icon: Calendar },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
    { name: 'Badges', path: '/badges', icon: Award },
    { name: 'Certificates', path: '/certificates', icon: FileCheck },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className={`flex min-h-screen font-sans ${isDarkMode ? 'bg-[#0B132B] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      
      {/* LEFT SIDEBAR WITH LARGER & BOLDER FONTS */}
      <aside className={`w-72 border-r p-5 flex flex-col justify-between sticky top-0 h-screen shrink-0 ${
        isDarkMode ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="space-y-6">
          {/* Logo Header */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="p-3 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl text-white font-black text-2xl shadow-lg shadow-violet-500/30">📚</div>
            <span className="text-3xl font-black bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 bg-clip-text text-transparent tracking-tight">
              StudyBuddy
            </span>
          </div>

          {/* Nav Items (Larger Font & Bigger Icons) */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-extrabold text-base transition-all ${
                    isActive 
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25 scale-[1.02]' 
                      : isDarkMode 
                        ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white' 
                        : 'text-slate-800 hover:bg-slate-100 hover:text-violet-600'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Area */}
        <div className="space-y-3 pt-2">
          <button 
            onClick={toggleTheme}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border font-black text-xs uppercase tracking-wider transition-all ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-amber-400' : 'bg-slate-50 border-slate-200 text-indigo-600'
            }`}
          >
            <span className="text-sm font-bold">Theme Mode</span>
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3 truncate">
                <div className="w-9 h-9 rounded-xl bg-violet-600 text-white font-black flex items-center justify-center text-sm shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="font-extrabold text-sm truncate">{user.name}</p>
                  <p className="text-xs text-emerald-500 font-bold">{user.skillCredits} Credits 🪙</p>
                </div>
              </div>
              <button onClick={handleLogout} className="text-xs text-red-500 font-black hover:underline ml-1">
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-violet-500/20 transition-all"
            >
              Login / Signup
            </button>
          )}
        </div>
      </aside>

      {/* RIGHT SIDE MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className={`px-8 py-4 border-b flex items-center justify-between sticky top-0 z-20 backdrop-blur-md ${
          isDarkMode ? 'bg-[#0F172A]/90 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}>
          <div className={`flex items-center px-4 py-2.5 rounded-2xl border w-96 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
          }`}>
            <Search className="w-4 h-4 text-slate-400 mr-2.5" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent outline-none text-sm w-full placeholder-slate-400 font-medium"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold text-sm">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>7 Day Streak</span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <Coins className="w-4 h-4" />
              <span>{user ? `${user.skillCredits} Credits` : '12 Credits'}</span>
            </div>

            <div className="w-9 h-9 rounded-2xl bg-violet-600 text-white font-black flex items-center justify-center text-sm border border-violet-400 shadow-sm">
              {user ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={(userData) => setUser(userData)} 
      />
    </div>
  );
}