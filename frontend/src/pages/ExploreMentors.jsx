import React, { useState } from 'react';
import { Search, Star, ShieldCheck, Video, Filter } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import API from '../services/api';

export default function ExploreMentors() {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  const cardBg = isDarkMode 
    ? 'bg-[#0F172A] border-slate-800 text-slate-100 shadow-xl' 
    : 'bg-white border-slate-200 text-slate-900 shadow-sm';

  const inputBg = isDarkMode 
    ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-400' 
    : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500';

  const tagBg = isDarkMode 
    ? 'bg-slate-800 text-slate-300 border-slate-700' 
    : 'bg-slate-100 text-slate-800 border-slate-200';

  const textHeading = isDarkMode ? 'text-white' : 'text-slate-900';
  const textSub = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  const filterTags = ['All', 'System Design', 'Python', 'Data Science', 'Node.js', 'React'];

  const mentors = [
    {
      id: '66b618a23d42e1234567890a', // Real/Sample MongoDB ObjectId
      name: 'Priya Sharma',
      role: 'Senior Software Engineer',
      skills: ['System Design', 'React'],
      badge: 'Verified Mentor',
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    {
      id: '66b618a23d42e1234567890b',
      name: 'Alex Chen',
      role: 'Data Scientist',
      skills: ['Python', 'Data Science'],
      badge: 'Top Rating',
      rating: '5.0',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    {
      id: '66b618a23d42e1234567890c',
      name: 'Ashmak Madhart',
      role: 'Full Stack Architect',
      skills: ['System Design', 'Node.js'],
      badge: 'Verified Mentor',
      rating: '4.8',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  ];

  // STEP 5: BOOK SESSION API CALL FUNCTION
  const handleBookSession = async (mentorId) => {
    try {
      const res = await API.post('/sessions/book', {
        mentorId,
        topic: 'System Design & Architecture',
        date: 'Aug 15, 2026',
        time: '05:00 PM ET',
      });

      alert(res.data.message || 'Session booked successfully!');

      // Update Credits locally in LocalStorage
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (savedUser) {
        savedUser.skillCredits = res.data.updatedCredits;
        localStorage.setItem('user', JSON.stringify(savedUser));
      }

      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed! Make sure you are logged in.');
    }
  };

  const filteredMentors = mentors.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'All' || m.skills.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h1 className={`text-3xl font-black tracking-tight ${textHeading}`}>
          EXPLORE MENTORS
        </h1>
        <p className={`text-sm font-semibold mt-1 ${textSub}`}>
          Find peer mentors and book 1-on-1 sessions using your Skill Credits.
        </p>
      </div>

      {/* Filter and Search */}
      <div className={`p-4 rounded-3xl border flex flex-col md:flex-row gap-3 justify-between items-center ${cardBg}`}>
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or role..."
            className={`w-full pl-11 pr-4 py-2.5 rounded-2xl border outline-none text-sm font-semibold ${inputBg}`}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter className={`w-4 h-4 shrink-0 ${textSub}`} />
          {filterTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                  : isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <div
            key={mentor.id}
            className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-200 hover:scale-[1.01] ${cardBg}`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${
                  mentor.badge === 'Verified Mentor'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                  {mentor.badge}
                </span>
                <span className="text-sm font-black text-amber-500 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-500" /> {mentor.rating}
                </span>
              </div>

              <div className="flex flex-col items-center text-center space-y-2">
                <img
                  src={mentor.image}
                  alt={mentor.name}
                  className="w-18 h-18 rounded-full object-cover ring-4 ring-violet-500/30 shadow-md"
                />
                <div>
                  <h3 className={`font-black text-lg leading-snug ${textHeading}`}>{mentor.name}</h3>
                  <p className={`text-sm font-semibold mt-0.5 ${textSub}`}>{mentor.role}</p>
                </div>

                <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                  {mentor.skills.map((skill) => (
                    <span key={skill} className={`px-3 py-1 rounded-xl text-xs font-bold border ${tagBg}`}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Book Session Button with API trigger */}
            <button
              onClick={() => handleBookSession(mentor.id)}
              className="w-full mt-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all"
            >
              <Video className="w-4 h-4" /> Book Session (1 Credit)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}