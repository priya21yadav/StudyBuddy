import React, { useState, useEffect } from 'react';
import { Search, Star, ShieldCheck, Video, Filter, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import API from '../services/api';

export default function ExploreMentors() {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userLearnSkills = savedUser.skillsToLearn?.map(s => typeof s === 'string' ? s.toLowerCase() : s.skillName?.toLowerCase()) || ['dsa', 'system design'];

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

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const currentUserId = savedUser._id || savedUser.id || '';
      
      const res = await API.get(`/users/mentors?userId=${currentUserId}`);
      if (res.data && res.data.length > 0) {
        setMentors(res.data);
      } else {
        // Fallback sample mentors if DB is empty
        setMentors([
          {
            _id: 'usr_mock_201',
            name: 'Priya Sharma',
            skillsToTeach: [{ skillName: 'System Design' }, { skillName: 'React' }],
            rating: 4.9,
            totalReviews: 8,
          },
          {
            _id: 'usr_mock_202',
            name: 'Alex Chen',
            skillsToTeach: [{ skillName: 'Python' }, { skillName: 'Data Science' }],
            rating: 5.0,
            totalReviews: 12,
          },
          {
            _id: 'usr_mock_203',
            name: 'Ashmak Madhart',
            skillsToTeach: [{ skillName: 'System Design' }, { skillName: 'Node.js' }],
            rating: 4.8,
            totalReviews: 5,
          },
        ]);
      }
    } catch (err) {
      console.error('Error fetching mentors from API:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Match Percentage
  const calculateMatchScore = (mentorSkills) => {
    if (!mentorSkills || mentorSkills.length === 0) return '85%';
    const teachList = mentorSkills.map(s => typeof s === 'string' ? s.toLowerCase() : s.skillName?.toLowerCase());
    const matchFound = teachList.some(s => userLearnSkills.some(ls => ls && s.includes(ls)));
    return matchFound ? '98% Skill Match' : '88% Skill Match';
  };

  // BOOK SESSION API CALL FUNCTION
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
      alert('🎉 +5 Free Skill Credits 🪙 added to your account balance!');
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

      alert(res.data.message || 'Session request sent successfully! Waiting for confirmation.');

      if (res.data.updatedCredits !== undefined) {
        currentUser.skillCredits = res.data.updatedCredits;
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed! Make sure you are logged in.');
    }
  };

  const filteredMentors = mentors.filter((m) => {
    const nameMatch = m.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const skillList = m.skillsToTeach?.map((s) => typeof s === 'string' ? s : s.skillName) || [];
    const skillMatch = skillList.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSearch = nameMatch || skillMatch;
    const matchesTag = selectedTag === 'All' || skillList.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h1 className={`text-3xl font-black tracking-tight ${textHeading}`}>
          EXPLORE MENTORS & SKALL SWAP
        </h1>
        <p className={`text-sm font-semibold mt-1 ${textSub}`}>
          Find peer mentors and book 1-on-1 sessions using your Skill Credits. Teach a skill to earn credits back!
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
            placeholder="Search by name or skill..."
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
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-bold text-sm">
          Loading mentors from database...
        </div>
      ) : filteredMentors.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${cardBg}`}>
          <p className="text-slate-400 font-semibold">No mentors matching your filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => {
            const skillList = mentor.skillsToTeach?.map((s) => typeof s === 'string' ? s : s.skillName) || ['General Mentoring'];
            const matchScore = calculateMatchScore(mentor.skillsToTeach);

            return (
              <div
                key={mentor._id || mentor.id}
                className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-200 hover:scale-[1.01] ${cardBg}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <ShieldCheck className="w-4 h-4" />
                      Verified Mentor
                    </span>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/30 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> {matchScore}
                    </span>
                  </div>

                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xl shadow-md ring-4 ring-violet-500/30">
                      {mentor.name?.charAt(0).toUpperCase() || 'M'}
                    </div>
                    <div>
                      <h3 className={`font-black text-lg leading-snug ${textHeading}`}>{mentor.name}</h3>
                      <p className={`text-xs font-semibold mt-0.5 ${textSub}`}>★ {mentor.rating || '5.0'} • ({mentor.totalReviews || 0} reviews)</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                      {skillList.map((skill, idx) => (
                        <span key={idx} className={`px-3 py-1 rounded-xl text-xs font-bold border ${tagBg}`}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleBookSession(mentor)}
                  className="w-full mt-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all active:scale-95"
                >
                  <Video className="w-4 h-4" /> Request Session (1 Credit)
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}