import React, { useRef, useEffect, useState } from 'react';
import { 
  X, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, 
  MessageSquare, MonitorUp, Hand, ShieldCheck, Sparkles, Send
} from 'lucide-react';
import { io } from 'socket.io-client';

const peerConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export default function VideoModal({ 
  isOpen, 
  onClose, 
  roomName = 'session_room_1', 
  peerName = 'Peer Mentor',
  onSessionEnded 
}) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);
  const candidateQueue = useRef([]);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [callConnected, setCallConnected] = useState(false);

  const [messages, setMessages] = useState([
    { id: 1, sender: peerName, text: 'Hello! Welcome to the Google Meet style video session.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [sidebarTab, setSidebarTab] = useState('chat');
  const [sharedCode, setSharedCode] = useState('// Live Collaborative Study Board\nfunction solveProblem() {\n  console.log("Learning together!");\n}');

  useEffect(() => {
    if (!isOpen) return;

    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
    socketRef.current = socket;

    let pc = null;
    let localStream = null;

    const startWebRTC = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = localStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        pc = new RTCPeerConnection(peerConfiguration);
        pcRef.current = pc;

        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

        pc.ontrack = (event) => {
          if (remoteVideoRef.current) {
            if (!remoteVideoRef.current.srcObject) {
              remoteVideoRef.current.srcObject = new MediaStream();
            }
            remoteVideoRef.current.srcObject.addTrack(event.track);
            setCallConnected(true);
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('ice_candidate', { room: roomName, candidate: event.candidate });
          }
        };

        socket.emit('join_room', roomName);

        socket.on('user_joined', async () => {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('call_user', { room: roomName, offer });
          } catch (err) {
            console.error('Offer error:', err);
          }
        });

        socket.on('incoming_call', async ({ offer }) => {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            while (candidateQueue.current.length > 0) {
              const cand = candidateQueue.current.shift();
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            }
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('answer_call', { room: roomName, answer });
          } catch (err) {
            console.error('Answer error:', err);
          }
        });

        socket.on('call_accepted', async ({ answer }) => {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            while (candidateQueue.current.length > 0) {
              const cand = candidateQueue.current.shift();
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            }
            setCallConnected(true);
          } catch (err) {
            console.error('Call accept error:', err);
          }
        });

        socket.on('ice_candidate', async ({ candidate }) => {
          try {
            if (pc.remoteDescription && pc.remoteDescription.type) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
              candidateQueue.current.push(candidate);
            }
          } catch (err) {}
        });

        socket.on('receive_message', (msgData) => {
          setMessages((prev) => [...prev, msgData]);
        });

      } catch (err) {
        console.error('WebRTC init warning:', err);
      }
    };

    startWebRTC();

    return () => {
      cleanup();
    };
  }, [isOpen, roomName]);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    candidateQueue.current = [];
    setCallConnected(false);
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const track = streamRef.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsVideoOff(!track.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        if (pcRef.current) {
          const sender = pcRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };
        setIsScreenSharing(true);
      } else {
        stopScreenShare();
      }
    } catch (e) {
      console.error('Screen share error:', e);
    }
  };

  const stopScreenShare = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (pcRef.current) {
        const sender = pcRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) sender.replaceTrack(videoTrack);
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = streamRef.current;
      }
    }
    setIsScreenSharing(false);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const msg = {
      id: Date.now(),
      sender: savedUser.name || 'You',
      text: chatInput.trim()
    };

    socketRef.current?.emit('send_message', { room: roomName, ...msg });
    setMessages((prev) => [...prev, msg]);
    setChatInput('');
  };

  const handleEndCall = () => {
    cleanup();
    if (onSessionEnded) onSessionEnded();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-2 md:p-6 animate-in fade-in duration-200">
      
      {/* Main Google Meet Window Container */}
      <div className="w-full h-full max-w-7xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
        
        {/* Google Meet Top Header Bar */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex justify-between items-center text-white z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl text-white font-extrabold text-sm shadow-md">
              📹
            </div>
            <div>
              <h2 className="font-extrabold text-base leading-tight flex items-center gap-2">
                StudyBuddy Meet • {peerName}
              </h2>
              <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {callConnected ? 'Connected Live • Encrypted 1-on-1' : 'Waiting for peer to join...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 font-bold hidden md:inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Room: {roomName}
            </span>
            <button 
              onClick={handleEndCall}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Video & Chat Split Body */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Main Video View Container */}
          <div className="flex-1 bg-slate-950 flex items-center justify-center relative p-4 overflow-hidden">
            
            {/* Remote Main Video Feed */}
            <div className="w-full h-full rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden relative flex items-center justify-center">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${callConnected ? 'block' : 'hidden'}`}
              />

              {!callConnected && (
                <div className="flex flex-col items-center justify-center text-center space-y-4 p-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-black flex items-center justify-center text-4xl shadow-2xl ring-8 ring-violet-500/20">
                    {peerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">{peerName}</h3>
                    <p className="text-sm font-semibold text-slate-400 mt-1">Connecting Google Meet style stream...</p>
                  </div>
                </div>
              )}

              {/* Hand Raised Floating Badge */}
              {handRaised && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg animate-bounce">
                  <Hand className="w-4 h-4" /> Hand Raised
                </div>
              )}
            </div>

            {/* PIP Self Camera Floating Video (Bottom-Right) */}
            <div className="absolute bottom-6 right-6 w-48 md:w-56 h-36 md:h-40 bg-slate-900 border-2 border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl z-20 group transition-transform duration-200 hover:scale-105">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
              />
              {isVideoOff && (
                <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-400 text-xs font-extrabold">
                  You (Camera Off)
                </div>
              )}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                You
              </div>
            </div>

          </div>

          {/* Right Sidebar: Chat & Collaborative Code Editor */}
          {isChatOpen && (
            <div className="w-80 md:w-96 bg-slate-900 border-l border-slate-800 flex flex-col justify-between z-20 animate-in slide-in-from-right duration-200">
              
              <div className="p-4 border-b border-slate-800 flex items-center justify-between text-white">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSidebarTab('chat')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      sidebarTab === 'chat' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    💬 Chat
                  </button>
                  <button 
                    onClick={() => setSidebarTab('code')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      sidebarTab === 'code' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    💻 Code Editor
                  </button>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {sidebarTab === 'chat' ? (
                <>
                  {/* Messages Scroll Area */}
                  <div className="p-4 overflow-y-auto flex-1 space-y-3">
                    {messages.map((m) => (
                      <div key={m.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                        <p className="text-[10px] font-bold text-violet-400">{m.sender}</p>
                        <p className="text-xs text-slate-200 font-medium">{m.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleSendChat} className="p-4 border-t border-slate-800 flex gap-2">
                    <input
                      type="text"
                      placeholder="Send a message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 outline-none text-xs text-white placeholder-slate-500 font-medium"
                    />
                    <button
                      type="submit"
                      className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Live Shared Code Editor</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold">
                      JS / React
                    </span>
                  </div>
                  <textarea
                    value={sharedCode}
                    onChange={(e) => {
                      setSharedCode(e.target.value);
                      socketRef.current?.emit('code_change', { room: roomName, code: e.target.value });
                    }}
                    placeholder="// Type code here to study together live..."
                    className="flex-1 w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 outline-none resize-none"
                  />
                  <p className="text-[10px] text-slate-400 text-center font-medium">
                    ⚡ Code changes sync live between both study peers!
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Google Meet Bottom Floating Control Bar */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-center gap-3 z-30">
          
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`p-3.5 rounded-full font-bold transition-all shadow-md ${
              isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Camera Button */}
          <button
            onClick={toggleVideo}
            className={`p-3.5 rounded-full font-bold transition-all shadow-md ${
              isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
          </button>

          {/* Screen Share Button */}
          <button
            onClick={toggleScreenShare}
            className={`p-3.5 rounded-full font-bold transition-all shadow-md ${
              isScreenSharing ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title={isScreenSharing ? 'Stop Presenting' : 'Present Screen'}
          >
            <MonitorUp className="w-5 h-5" />
          </button>

          {/* Raise Hand Button */}
          <button
            onClick={() => setHandRaised(!handRaised)}
            className={`p-3.5 rounded-full font-bold transition-all shadow-md ${
              handRaised ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title="Raise Hand"
          >
            <Hand className="w-5 h-5" />
          </button>

          {/* Chat Toggle Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-3.5 rounded-full font-bold transition-all shadow-md ${
              isChatOpen ? 'bg-violet-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title="In-Call Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Red End Call Button */}
          <button
            onClick={handleEndCall}
            className="px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all active:scale-95 ml-4"
            title="Leave Call"
          >
            <PhoneOff className="w-5 h-5" /> End Call
          </button>

        </div>

      </div>
    </div>
  );
}