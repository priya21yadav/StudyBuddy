import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Edit, MessageSquare, User as UserIcon, CheckCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import { useTheme } from '../context/ThemeContext';
import API from '../services/api';

export default function ChatPage() {
  const { isDarkMode } = useTheme();
  const messagesEndRef = useRef(null);

  // Current Logged-in User Data
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = currentUser._id || currentUser.id || 'my_user_id';
  const userName = currentUser.name || 'Student';

  // Helper to generate a unique room ID for any two users
  const getRoomId = (peerId) => {
    return [String(userId), String(peerId)].sort().join('_private_chat_');
  };

  const initialContacts = [
    { id: 'usr_mock_201', name: 'Priya Sharma', role: 'React & System Design Mentor' },
    { id: 'usr_mock_202', name: 'Alex Chen', role: 'Data Science & Python Mentor' },
    { id: 'usr_mock_203', name: 'Ashmak Madhart', role: 'Node.js & MongoDB Mentor' }
  ];

  const [contacts, setContacts] = useState(initialContacts);
  const [activeContact, setActiveContact] = useState(initialContacts[0]);
  
  // Store messages isolated by room ID
  const [messagesByRoom, setMessagesByRoom] = useState({
    [getRoomId('usr_mock_201')]: [
      { id: 1, roomId: getRoomId('usr_mock_201'), senderId: 'usr_mock_201', senderName: 'Priya Sharma', text: 'Hello! Feel free to ask any questions about System Design or React!', time: '10:30 AM' }
    ],
    [getRoomId('usr_mock_202')]: [
      { id: 2, roomId: getRoomId('usr_mock_202'), senderId: 'usr_mock_202', senderName: 'Alex Chen', text: 'Hi! Excited to swap skills on Python and Data Science.', time: '11:15 AM' }
    ]
  });

  const [input, setInput] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    fetchPeerContacts();
  }, [userId]);

  const fetchPeerContacts = async () => {
    try {
      const [sessionsRes, mentorsRes] = await Promise.all([
        API.get(`/sessions/my-sessions?userId=${userId}`).catch(() => ({ data: [] })),
        API.get(`/users/mentors?userId=${userId}`).catch(() => ({ data: [] }))
      ]);

      const fetchedFromSessions = (sessionsRes.data || []).map((s) => {
        const isMentor = String(s.mentor?._id || s.mentor) === String(userId);
        const peer = isMentor ? s.student : s.mentor;
        return {
          id: String(peer?._id || peer?.id || 'peer_' + Math.random()),
          name: peer?.name || 'Peer Contact',
          role: s.topic || 'Skill Swap Peer'
        };
      });

      const fetchedFromMentors = (mentorsRes.data || []).map((m) => ({
        id: String(m._id || m.id),
        name: m.name || 'Peer Mentor',
        role: (m.skillsToTeach && m.skillsToTeach[0]) ? `Teaches ${typeof m.skillsToTeach[0] === 'string' ? m.skillsToTeach[0] : m.skillsToTeach[0].skillName}` : 'Peer Mentor'
      }));

      // Unique contacts by ID
      const uniqueMap = new Map();
      [...fetchedFromSessions, ...fetchedFromMentors, ...initialContacts].forEach(c => {
        if (c.id && String(c.id) !== String(userId)) {
          uniqueMap.set(String(c.id), c);
        }
      });
      const combined = Array.from(uniqueMap.values());

      setContacts(combined);
      if (combined.length > 0 && !activeContact) {
        setActiveContact(combined[0]);
      }
    } catch (e) {}
  };

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
    socketRef.current = socket;

    // Register user's personal socket room for targeted messages
    if (userId) {
      socket.emit('register_user', userId);
    }

    // Join room for active contact
    if (activeContact?.id) {
      const currentRoomId = getRoomId(activeContact.id);
      socket.emit('join_room', currentRoomId);
    }

    const handleReceiveMessage = (data) => {
      const senderPeerId = data.senderId;
      const targetRoom = data.room || (senderPeerId ? getRoomId(senderPeerId) : '');
      
      if (targetRoom) {
        setMessagesByRoom((prev) => ({
          ...prev,
          [targetRoom]: [...(prev[targetRoom] || []), data]
        }));
      }

      // Automatically add sender to contacts if not present
      if (senderPeerId && String(senderPeerId) !== String(userId)) {
        setContacts((prev) => {
          const exists = prev.some(c => String(c.id) === String(senderPeerId));
          if (!exists) {
            return [{
              id: String(senderPeerId),
              name: data.senderName || 'Peer Learner',
              role: 'Skill Swap Peer'
            }, ...prev];
          }
          return prev;
        });
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.disconnect();
    };
  }, [activeContact, userId]);

  const activeRoomId = activeContact ? getRoomId(activeContact.id) : '';
  const activeMessages = messagesByRoom[activeRoomId] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeContact) return;

    const messageData = {
      id: Date.now() + Math.random(),
      room: activeRoomId,
      recipientId: activeContact.id,
      senderId: userId,
      senderName: userName,
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Emit to Socket Room & Recipient
    socketRef.current?.emit('send_message', messageData);

    // Save under active room ID only
    setMessagesByRoom((prev) => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), messageData]
    }));

    setInput('');
  };

  const [unreadCounts, setUnreadCounts] = useState({});
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const containerBg = isDarkMode 
    ? 'bg-[#0F172A] border-slate-800 text-slate-100 shadow-xl' 
    : 'bg-white border-slate-200 text-slate-900 shadow-sm';

  const innerCardBg = isDarkMode 
    ? 'bg-[#1E293B]/70 border-slate-700/60' 
    : 'bg-slate-100 border-slate-200';

  const activeContactBg = isDarkMode 
    ? 'bg-violet-900/30 border-violet-500/50' 
    : 'bg-violet-50 border-violet-300';

  const receiverBubbleBg = isDarkMode 
    ? 'bg-slate-800 text-slate-100 border-slate-700' 
    : 'bg-slate-200 text-slate-900 border-slate-300';

  const inputBg = isDarkMode 
    ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-400' 
    : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500';

  const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  const handleSelectContact = (contact) => {
    setActiveContact(contact);
    setUnreadCounts(prev => ({ ...prev, [contact.id]: 0 }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      
      {/* Left Peer Contacts Panel */}
      <div className={`lg:col-span-4 p-5 rounded-3xl border flex flex-col ${containerBg}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-lg tracking-wide flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-violet-500" /> 1-ON-1 PRIVATE CHATS
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 font-extrabold border border-violet-500/20">
            {contacts.length} Contacts
          </span>
        </div>

        <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
          {contacts.map((contact) => {
            const isActive = activeContact?.id === contact.id;
            const contactRoomId = getRoomId(contact.id);
            const lastMsg = (messagesByRoom[contactRoomId] || []).slice(-1)[0];
            const unreadCount = unreadCounts[contact.id] || 0;

            return (
              <div
                key={contact.id}
                onClick={() => handleSelectContact(contact)}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                  isActive ? activeContactBg : 'hover:bg-slate-800/20 border-transparent'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-black flex items-center justify-center shrink-0 shadow-md relative">
                  {contact.name?.charAt(0).toUpperCase()}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-sm truncate">{contact.name}</h4>
                    <span className="text-[10px] font-bold text-emerald-400">Online</span>
                  </div>
                  <p className={`text-xs font-semibold truncate ${textSecondary}`}>
                    {lastMsg ? lastMsg.text : contact.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Chat Window */}
      <div className={`lg:col-span-8 rounded-3xl border flex flex-col justify-between overflow-hidden ${containerBg}`}>
        
        {/* Chat Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50/50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white font-black flex items-center justify-center shadow-md">
              {activeContact?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">{activeContact?.name}</h3>
              <p className="text-xs font-bold text-emerald-500">Private 1-on-1 Connected • Online</p>
            </div>
          </div>
          <button 
            onClick={() => setIsVideoOpen(true)}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Phone className="w-4 h-4" /> Start Video Workspace Call
          </button>
        </div>

        {/* Message Log for Active Contact Only */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeMessages.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="font-extrabold text-sm text-slate-400">No messages yet with {activeContact?.name}</p>
              <p className="text-xs text-slate-500">Send a greeting message to start swapping skills!</p>
            </div>
          ) : (
            activeMessages.map((msg) => {
              const isMe = String(msg.senderId) === String(userId);
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm font-medium border ${
                      isMe
                        ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-500/20'
                        : receiverBubbleBg
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className={`text-[10px] mt-1 px-1 font-semibold ${textSecondary}`}>
                    {msg.senderName || (isMe ? 'You' : activeContact?.name)} • {msg.time}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className={`p-4 border-t flex items-center gap-3 ${
          isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-50/30'
        }`}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${activeContact?.name || 'Peer'}...`}
            className={`flex-1 px-5 py-3 rounded-2xl border outline-none font-medium text-sm transition-all ${inputBg}`}
          />
          <button
            type="submit"
            className="p-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg shadow-violet-500/25 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

      </div>

      {/* Video Call Modal */}
      <VideoModal 
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        roomName={activeContact ? getRoomId(activeContact.id) : 'private_chat_call_room'}
        peerName={activeContact?.name || 'Peer Mentor'}
      />
    </div>
  );
}