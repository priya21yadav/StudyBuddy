import React, { useRef, useEffect, useState } from 'react';
import { X, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff } from 'lucide-react';

export default function VideoModal({ isOpen, onClose, roomName = "System Design Session" }) {
  const localVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((mediaStream) => {
          setStream(mediaStream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = mediaStream;
          }
        })
        .catch((err) => console.error("Error accessing camera/mic:", err));
    } else {
      stopTracks();
    }

    return () => stopTracks();
  }, [isOpen]);

  const stopTracks = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Call Header */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex justify-between items-center text-white">
          <div>
            <h3 className="font-extrabold text-base">{roomName}</h3>
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Live 1-on-1 Session
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Screens Container */}
        <div className="relative p-6 bg-slate-950 min-h-[380px] flex items-center justify-center gap-4">
          
          {/* Remote Mentor Video Placeholder */}
          <div className="w-full h-[340px] bg-slate-800/60 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden">
            <div className="w-20 h-20 rounded-full bg-violet-600/30 text-violet-400 flex items-center justify-center font-black text-2xl border-2 border-violet-500/40">
              👨‍💻
            </div>
            <p className="mt-3 font-bold text-sm text-slate-300">Waiting for mentor to join...</p>
            
            {/* Small Self Video Feed (Bottom-Right Overlay) */}
            <div className="absolute bottom-4 right-4 w-44 h-28 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Call Controls */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`p-3.5 rounded-2xl font-bold transition-all ${
              isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3.5 rounded-2xl font-bold transition-all ${
              isVideoOff ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all"
          >
            <PhoneOff className="w-5 h-5" /> End Call
          </button>
        </div>

      </div>
    </div>
  );
}