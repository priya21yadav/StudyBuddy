import React from 'react';
import { Award, Download, Share2, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function CertificatesPage() {
  const { isDarkMode } = useTheme();

  const containerBg = isDarkMode 
    ? 'bg-[#0F172A] border-slate-800 text-slate-100' 
    : 'bg-white border-slate-200 text-slate-900 shadow-sm';

  const innerCardBg = isDarkMode 
    ? 'bg-[#070D1B] border-slate-800/80' 
    : 'bg-slate-50 border-slate-200';

  const subTextColor = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  // LocalStorage se User Name
  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const studentName = savedUser.name || 'Student';

  const certificates = [
    {
      id: 'CERT-8841-A',
      title: 'Peer Mentorship Completion Certificate',
      skill: 'System Design & Scalability',
      issuedTo: studentName,
      date: 'Aug 10, 2026',
      color: 'from-violet-500 to-purple-600'
    },
    {
      id: 'CERT-9920-B',
      title: 'Full Stack Web Mastery',
      skill: 'React.js & Node.js Architecture',
      issuedTo: studentName,
      date: 'Aug 05, 2026',
      color: 'from-cyan-500 to-blue-600'
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black tracking-wide leading-tight">CERTIFICATES & CREDENTIALS</h1>
        <p className={`text-xs font-medium mt-0.5 ${subTextColor}`}>
          Verified peer-to-peer learning credentials and skill achievements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {certificates.map((cert) => (
          <div key={cert.id} className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${containerBg}`}>
            
            <div className={`p-5 rounded-xl border space-y-3 relative overflow-hidden ${innerCardBg}`}>
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-tr ${cert.color}`}>
                  <Award className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-violet-400 tracking-wider">
                  {cert.skill}
                </span>
                <h3 className="font-black text-base mt-0.5 leading-snug">{cert.title}</h3>
              </div>

              <div className={`pt-2 border-t border-slate-800/80 text-xs font-medium space-y-0.5 ${subTextColor}`}>
                <p>Issued to: <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{cert.issuedTo}</strong></p>
                <p className="text-[11px]">Issued Date: {cert.date} • ID: <span className="font-mono">{cert.id}</span></p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => alert(`Downloading PDF for: ${cert.title}`)}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-violet-500/20 transition-all"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>

              <button
                onClick={() => alert(`Certificate Link Copied! (ID: ${cert.id})`)}
                className={`px-3.5 py-2.5 rounded-xl border font-extrabold text-xs flex items-center justify-center transition-all ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}