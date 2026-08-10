import React, { useState, useEffect } from 'react';
import { Send, Phone, Edit } from 'lucide-react';
import { io } from 'socket.io-client';
import { useTheme } from '../context/ThemeContext';

const socket = io('http://localhost:5000');

export default function ChatPage() {
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState([
    { id: 1, sender: 'them', text: 'Hey, have questions here?', time: '10:32 PM' },
    { id: 2, sender: 'me', text: 'Yes! Want to ask about System Design.', time: '10:33 PM' },
  ]);
  const [input, setInput] = useState('');
  const room = 'session_room_1'; // Chat room ID

  useEffect(() => {
    // Join socket room
    socket.emit('join_room', room);

    // Listen for incoming messages
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const messageData = {
      id: Date.now(),
      room,
      sender: 'me',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    socket.emit('send_message', messageData);
    setInput('');
  };

  const containerBg = isDarkMode 
    ? 'bg-[#0F172A] border-slate-800 text-slate-100' 
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      
      {/* Left Contacts Panel */}
      <div className={`lg:col-span-4 p-5 rounded-3xl border flex flex-col ${containerBg}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-lg tracking-wide">MESSAGES & CHAT</h2>
          <button className={`p-2 rounded-xl border ${innerCardBg}`}>
            <Edit className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          <div className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${activeContactBg}`}>
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white font-black flex items-center justify-center shrink-0">
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm truncate">Ashmak Madhart</h4>
                <span className={`text-[10px] font-semibold ${textSecondary}`}>Live</span>
              </div>
              <p className={`text-xs font-medium truncate ${textSecondary}`}>
                Active Mentorship Chat
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Chat Window */}
      <div className={`lg:col-span-8 rounded-3xl border flex flex-col justify-between overflow-hidden ${containerBg}`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50/50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white font-black flex items-center justify-center">
              A
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Ashmak Madhart</h3>
              <p className="text-xs font-bold text-emerald-500">Online • Peer Mentor</p>
            </div>
          </div>
          <button className={`p-2.5 rounded-2xl border ${innerCardBg}`}>
            <Phone className="w-4 h-4" />
          </button>
        </div>

        {/* Message Log */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm font-medium border ${
                  msg.sender === 'me'
                    ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-500/20'
                    : receiverBubbleBg
                }`}
              >
                {msg.text}
              </div>
              <span className={`text-[10px] mt-1 px-1 font-semibold ${textSecondary}`}>
                {msg.time}
              </span>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className={`p-4 border-t flex items-center gap-3 ${
          isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-50/30'
        }`}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className={`flex-1 px-5 py-3 rounded-2xl border outline-none font-medium text-sm transition-all ${inputBg}`}
          />
          <button
            type="submit"
            className="p-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg shadow-violet-500/25 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

      </div>
    </div>
  );
}