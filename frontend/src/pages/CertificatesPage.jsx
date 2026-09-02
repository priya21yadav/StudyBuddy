import React, { useState } from 'react';
import { Award, Download, Share2, ShieldCheck, CheckCircle, Sparkles, Printer } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function CertificatesPage() {
  const { isDarkMode } = useTheme();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = currentUser.name || 'Student Learner';

  const [certificates, setCertificates] = useState([
    {
      id: 'SB-CERT-889102',
      title: 'Certification of Mastery: System Design & Scalability',
      skill: 'System Design & Architecture',
      issuedDate: 'August 28, 2026',
      issuer: 'StudyBuddy Peer Learning Network',
      verified: true
    },
    {
      id: 'SB-CERT-441209',
      title: 'Certification of Completion: React & Node.js Exchange',
      skill: 'React.js & Full-Stack Web Dev',
      issuedDate: 'August 15, 2026',
      issuer: 'StudyBuddy Peer Learning Network',
      verified: true
    }
  ]);

  const [selectedCert, setSelectedCert] = useState(certificates[0]);

  const handlePrint = () => {
    window.print();
  };

  const handleShareLinkedIn = (cert) => {
    const text = encodeURIComponent(`I am proud to share my verified certificate for "${cert.skill}" earned on StudyBuddy P2P Skill Exchange! Certificate ID: ${cert.id}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=https://studybuddy.app/verify/${cert.id}&text=${text}`, '_blank');
  };

  const textHeading = isDarkMode ? 'text-white' : 'text-slate-900';
  const textSub = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-black tracking-tight flex items-center gap-3 ${textHeading}`}>
            <Award className="w-8 h-8 text-cyan-400" /> VERIFIED CERTIFICATES
          </h1>
          <p className={`text-sm font-semibold mt-1 ${textSub}`}>
            Earn certificates upon completing learning targets and mentorship milestones. Download or share on LinkedIn!
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-violet-500/20 active:scale-95 transition-all"
        >
          <Printer className="w-4 h-4" /> Download / Print Certificate
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Certificate Display Area */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Certificate Design Box */}
          <div id="printable-certificate" className="p-8 md:p-12 rounded-3xl border-4 border-amber-500/40 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white shadow-2xl relative overflow-hidden space-y-8">
            
            {/* Background Decorative Seals */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-2xl shadow-inner">
                  📚
                </div>
                <div>
                  <h2 className="text-2xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent tracking-wider uppercase">
                    StudyBuddy Network
                  </h2>
                  <p className="text-xs text-amber-200/80 font-bold uppercase tracking-widest">
                    Verified P2P Skill Exchange Credentials
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black">
                <ShieldCheck className="w-4 h-4" /> Verified Authenticated
              </div>
            </div>

            {/* Certificate Body */}
            <div className="text-center space-y-4 py-4">
              <p className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
                This is to certify that
              </p>
              <h3 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent capitalize tracking-tight">
                {userName}
              </h3>
              <p className="text-sm text-slate-300 max-w-xl mx-auto font-medium">
                has successfully demonstrated proficiency and completed the peer learning requirements for
              </p>
              <div className="inline-block p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-black text-xl md:text-2xl tracking-wide shadow-md">
                🎓 {selectedCert.skill}
              </div>
            </div>

            {/* Signature & Seal Footer */}
            <div className="pt-6 border-t border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
              <div className="text-center md:text-left space-y-1">
                <p className="font-extrabold text-white text-sm">Ashmak Madhart</p>
                <p className="text-amber-400 font-semibold">Chief Academic Architect</p>
                <p className="text-[10px]">Date Issued: {selectedCert.issuedDate}</p>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono font-bold">
                <Sparkles className="w-4 h-4 text-amber-400" /> ID: {selectedCert.id}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleShareLinkedIn(selectedCert)}
              className="flex-1 py-3.5 rounded-2xl bg-[#0A66C2] hover:bg-[#084e96] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
            >
              <Share2 className="w-4 h-4" /> Share Credentials on LinkedIn
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" /> Export High-Res PDF
            </button>
          </div>
        </div>

        {/* Right Certificates Selector */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className={`font-black text-lg ${textHeading}`}>YOUR CERTIFICATES</h3>
          <div className="space-y-3">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                onClick={() => setSelectedCert(cert)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  selectedCert.id === cert.id
                    ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-500/25 scale-[1.02]'
                    : isDarkMode
                    ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    ID: {cert.id}
                  </span>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="font-extrabold text-sm leading-snug">{cert.title}</h4>
                <p className="text-xs opacity-75 mt-1 font-semibold">{cert.issuedDate}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}