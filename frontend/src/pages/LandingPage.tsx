import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldAlert,
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Terminal,
  Activity,
  Layers,
  Award,
  Zap
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">MaxLabs</span>
              <span className="ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-brand-950 text-brand-400 border border-brand-800">
                Hackathon Edition
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student/login"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-brand-600/30"
            >
              Enter Portals
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-brand-300 font-medium">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Secure AI-Assisted University Learning & Cyber Defense Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Next-Generation <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-400 via-brand-300 to-rose-400 bg-clip-text text-transparent">
              Academic Learning & Mini SOC
            </span>
          </h1>

          <p className="text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A cohesive three-tier platform integrating modular interactive student labs, authoritative backend grading, lecturer curriculum management, and a live threat-telemetry Security Operations Center.
          </p>
        </div>

        {/* Three Portal Gateway Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student Portal */}
          <div className="bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/80 hover:border-brand-500 rounded-2xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-950 border border-brand-800 text-brand-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Student Portal</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Semester dashboard with 7 units, Week 1 SDLC lecture notes, video lectures, timed interactive labs (MCQs, Flashcards, Written responses), 75% pass rule, revision hub, and readiness test.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-700/60 text-[11px] text-slate-400 font-mono space-y-1">
                <div>Demo Account: <strong className="text-slate-200">Alex Kamau</strong></div>
                <div>Admission: <strong className="text-brand-300">RU-2026-041</strong></div>
                <div>Pass: <span className="text-slate-300">EduLabs@2026Secure!</span></div>
              </div>
            </div>

            <Link
              to="/student/login"
              className="mt-6 w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-900/30 transition-all"
            >
              Open Student Portal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Lecturer Portal */}
          <div className="bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/80 hover:border-brand-500 rounded-2xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-950 border border-brand-800 text-brand-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Lecturer Portal</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                14-week curriculum manager, PDF/diagram uploads, zero-cost prebuilt SDLC assessment generator, live cohort attempt analytics, weak topic breakdown, and university exam ticket approval.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-700/60 text-[11px] text-slate-400 font-mono space-y-1">
                <div>Faculty: <strong className="text-slate-200">James Mwangi</strong></div>
                <div>Username: <strong className="text-brand-300">jmwangi</strong></div>
                <div>Pass: <span className="text-slate-300">EduLabs@2026Secure!</span></div>
              </div>
            </div>

            <Link
              to="/lecturer/login"
              className="mt-6 w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-900/30 transition-all"
            >
              Open Faculty Portal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mini SOC Portal */}
          <div className="bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/80 hover:border-rose-500 rounded-2xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Mini SOC Portal</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time cybersecurity operations center. Telemetry monitors prompt injections, IDOR student data breaches, abnormal brute-force login rates, and malicious uploads with on-demand attack simulation.
              </p>

              <div className="mt-4 pt-3 border-t border-slate-700/60 text-[11px] text-slate-400 font-mono space-y-1">
                <div>Analyst: <strong className="text-slate-200">Security Admin</strong></div>
                <div>Username: <strong className="text-rose-300">admin</strong></div>
                <div>Pass: <span className="text-slate-300">EduLabs@2026Secure!</span></div>
              </div>
            </div>

            <Link
              to="/admin/login"
              className="mt-6 w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 transition-all font-mono"
            >
              Open Mini SOC <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-6 text-center text-xs text-slate-500">
        <p>MaxLabs SaaS v2.0 • University Learning & Cybersecurity Demonstration</p>
      </footer>
    </div>
  );
};
