import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  History,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  FlaskConical,
  Award,
  Lock,
  Unlock,
} from "lucide-react";
import { AITutorDrawer } from "../../components/common/AITutorDrawer";

interface LabAttempt {
  id: number;
  score: number;
  percentage: number;
  passed: boolean;
  is_demo_data: boolean;
  submitted_at: string | null;
}

interface LabItem {
  topic_number: number;
  title: string;
  assessment_id: number | null;
  status: "completed" | "outstanding";
  score: number | null;
  passed: boolean;
  is_synthetic: boolean;
  is_required_gate: boolean;
  attempts_count: number;
  history: LabAttempt[];
  pdf_filename: string;
  pdf_url: string;
}

export const StudentLabAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedLab, setExpandedLab] = useState<number | null>(null);

  useEffect(() => {
    api.getStudentRevision(1)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load lab analytics");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-700"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">
          {error || "Lab analytics data could not be retrieved."}
        </div>
      </div>
    );
  }

  const { unit, performance_dashboard, student_weak_topics } = data;
  const summary = performance_dashboard?.summary || {
    total_topics: 15,
    completed_topics: 14,
    progress_pct: 93.3,
    sdlc_completed: false,
    readiness_unlocked: false,
  };
  const labs: LabItem[] = performance_dashboard?.topics || [];

  const toggleHistory = (topicNum: number) => {
    setExpandedLab(expandedLab === topicNum ? null : topicNum);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header Banner */}
      <section className="bg-brand-800 rounded-2xl p-6 text-white shadow-md border-b-4 border-gold-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-gold-200 border border-white/20">
              {unit?.code || "RCS 305"}
            </span>
            <span className="text-xs text-brand-200">• Laboratory Performance & Diagnostics</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Lab Analytics</h1>
          <p className="text-xs text-brand-100 mt-1 max-w-2xl leading-relaxed">
            Quantitative analysis of all 15 laboratory modules, score changes across attempts, verified demo baselines, and performance-driven improvement pathways.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/student/revision"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-gold-300" />
            <span>Open Revision Hub</span>
          </Link>
          <Link
            to="/student/final-test"
            className={`px-4 py-2 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 ${
              summary.readiness_unlocked
                ? "bg-gold-500 hover:bg-gold-600 text-brand-950"
                : "bg-white/10 text-gold-200 border border-gold-400/30"
            }`}
          >
            {summary.readiness_unlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4 text-gold-300" />}
            <span>{summary.readiness_unlocked ? "Readiness Exam" : "Readiness Locked"}</span>
          </Link>
        </div>
      </section>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Laboratory Completion */}
        <div className="bg-white rounded-2xl border border-brand-100 p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Overall Completion</span>
            <FlaskConical className="w-4 h-4 text-brand-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{summary.completed_topics} / {summary.total_topics}</span>
            <span className="text-xs font-bold text-brand-700">({summary.progress_pct}%)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-brand-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${summary.progress_pct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">14 completed labs + 1 outstanding</p>
        </div>

        {/* Metric 2: Prerequisite Gating */}
        <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-sm space-y-2 bg-gradient-to-br from-amber-50/50 to-white">
          <div className="flex items-center justify-between text-xs text-amber-800 font-semibold">
            <span>Prerequisite Gate (SDLC)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-base font-bold text-slate-900">
            {summary.sdlc_completed ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Passed (Satisfied)
              </span>
            ) : (
              <span className="text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Outstanding
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            {summary.sdlc_completed
              ? "Prerequisite satisfied for capstone exam."
              : "SDLC Lab must be passed with score ≥ 65%."}
          </p>
        </div>

        {/* Metric 3: Readiness Exam Status */}
        <div className="bg-white rounded-2xl border border-brand-100 p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Readiness Test Gate</span>
            {summary.readiness_unlocked ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-slate-400" />}
          </div>
          <div className="text-base font-bold text-slate-900">
            {summary.readiness_unlocked ? (
              <span className="text-emerald-700 font-bold">Unlocked</span>
            ) : (
              <span className="text-slate-600 font-bold">Gated / Locked</span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Strict backend policy: direct API calls blocked until SDLC passes.
          </p>
        </div>

        {/* Metric 4: Dataset Attribution */}
        <div className="bg-white rounded-2xl border border-brand-100 p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Evaluation Dataset</span>
            <Sparkles className="w-4 h-4 text-gold-600" />
          </div>
          <div className="text-base font-bold text-slate-900">
            14 Synthetic Scores
          </div>
          <p className="text-[11px] text-slate-500">
            Cohort baseline scores (75%–95%). Student retakes persist alongside.
          </p>
        </div>
      </div>

      {/* Weak Areas & Diagnostic Recommendations */}
      <section className="bg-white rounded-2xl border border-brand-100 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-4 h-4 text-brand-700" />
            <h2 className="font-bold text-sm text-slate-900">Ranked Weak Topics (Performance Diagnostics)</h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold">Algorithmically Ranked</span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Diagnostic ranking derived from recorded answer attempts. Click study links to jump to the corresponding Revision Hub guide or retake the lab:
        </p>

        {student_weak_topics && student_weak_topics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {student_weak_topics.map((wt: any, idx: number) => {
              const matchedLab = labs.find(
                (l) =>
                  l.title.toLowerCase().includes(wt.topic.toLowerCase()) ||
                  wt.topic.toLowerCase().includes(l.title.split(" ")[0].toLowerCase())
              ) || labs[0];

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-brand-100 bg-brand-50/40 hover:bg-brand-50 transition space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-200 text-brand-900">
                        Rank #{idx + 1}
                      </span>
                      {wt.is_synthetic && (
                        <span className="text-[10px] text-purple-700 font-semibold">Demo Analytics</span>
                      )}
                    </div>
                    <h3 className="font-bold text-xs text-slate-900 line-clamp-1">{wt.topic}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Recommended for review prior to sitting the Final Exam Readiness Test.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-brand-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/student/revision`}
                      className="text-[11px] font-bold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Study Guide</span>
                    </Link>
                    {matchedLab.assessment_id && (
                      <Link
                        to={`/student/lab/${matchedLab.assessment_id}`}
                        className="text-[11px] font-bold text-slate-700 hover:text-brand-800 inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retake Lab</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 text-slate-600 text-xs rounded-xl border border-slate-200">
            Insufficient performance evidence to identify weakness. Complete more laboratory questions to populate diagnostic analytics.
          </div>
        )}
      </section>

      {/* 15 Laboratory Records & Score Progression Matrix */}
      <section className="bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-700" />
              15 Laboratory Modules & Attempt Histories
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Score changes across attempts, pass/fail status, and direct actions to review or retake.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              14 Passed
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              1 Outstanding
            </span>
          </div>
        </div>

        {/* Labs List */}
        <div className="divide-y divide-slate-100">
          {labs.map((lab) => {
            const isExpanded = expandedLab === lab.topic_number;
            const isOutstanding = lab.status === "outstanding";

            return (
              <div
                key={lab.topic_number}
                className={`transition ${isOutstanding ? "bg-amber-50/30" : "hover:bg-slate-50/70"}`}
              >
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Title & Tags */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-brand-100 text-brand-900 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {lab.topic_number}
                    </span>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                          {lab.title}
                        </h3>
                        {lab.is_required_gate && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            Prerequisite Gate
                          </span>
                        )}
                        {lab.is_synthetic && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            Demo Data
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {lab.attempts_count > 1
                          ? `${lab.attempts_count} attempts recorded. Score history preserved below.`
                          : "1 recorded attempt. Retakes permanently archived."}
                      </p>
                    </div>
                  </div>

                  {/* Score, Attempts Toggle & Retake Actions */}
                  <div className="flex items-center gap-4 sm:gap-6 shrink-0 self-start lg:self-center">
                    {/* Score / Status */}
                    <div className="text-right min-w-[90px]">
                      {isOutstanding ? (
                        <div>
                          <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                            Outstanding
                          </span>
                          <span className="block text-[10px] text-amber-600 mt-0.5">
                            {lab.score !== null ? `${lab.score}% (Needs ≥ 65%)` : "No Pass Yet"}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-base font-black text-slate-900">
                            {lab.score !== null ? `${lab.score}%` : "Passed"}
                          </span>
                          <span className="block text-[10px] text-emerald-700 font-semibold">
                            Completed
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Expand History Button */}
                    <button
                      onClick={() => toggleHistory(lab.topic_number)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50 text-[11px] font-semibold text-slate-700 transition flex items-center gap-1.5"
                    >
                      <History className="w-3.5 h-3.5 text-brand-700" />
                      <span>{lab.attempts_count} {lab.attempts_count === 1 ? "Attempt" : "Attempts"}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <a
                        href={lab.pdf_url}
                        download={lab.pdf_filename}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-brand-100 text-slate-700 hover:text-brand-900 transition"
                        title="Download Study PDF"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      {lab.assessment_id && (
                        <Link
                          to={`/student/lab/${lab.assessment_id}`}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1 ${
                            isOutstanding
                              ? "bg-brand-700 hover:bg-brand-800 text-white shadow-sm"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                          }`}
                        >
                          {isOutstanding ? (
                            <>
                              <span>Start Lab</span>
                              <ArrowRight className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-3 h-3" />
                              <span>Retake</span>
                            </>
                          )}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Attempt History */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 bg-slate-50/80 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-semibold pt-1">
                      <span>Score Progression & Attempt Records (Topic {lab.topic_number})</span>
                      <span className="text-[10px] text-slate-400">* All attempts permanently preserved in DB</span>
                    </div>

                    {lab.history && lab.history.length > 0 ? (
                      <div className="space-y-1.5">
                        {lab.history.map((att, attIdx) => (
                          <div
                            key={att.id || attIdx}
                            className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                Attempt #{lab.history.length - attIdx}
                              </span>
                              <span className="text-slate-500">
                                {att.submitted_at
                                  ? new Date(att.submitted_at).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "Recorded Demonstration Submission"}
                              </span>
                              {att.is_demo_data ? (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                  Synthetic Baseline
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Student Submission
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-900">{att.percentage}%</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  att.passed
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {att.passed ? "Passed" : "Did Not Pass"}
                              </span>
                              <Link
                                to={`/student/results/${att.id}`}
                                className="text-[11px] text-brand-700 hover:underline font-bold"
                              >
                                View Analytics →
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                        No recorded attempts found.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <AITutorDrawer />
    </div>
  );
};
