import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lecturerApi } from '../../api/client';
import {
  BarChart3,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowLeft,
  Search,
  Filter,
  HelpCircle,
  TrendingUp
} from 'lucide-react';

export const LecturerAnalyticsPage: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed' | 'unattempted'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!unitId) return;
    lecturerApi.getUnitAnalytics(Number(unitId))
      .then(res => setAnalytics(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [unitId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const summary = analytics?.summary || {};
  const roster = analytics?.student_roster || [];
  const mostMissed = analytics?.most_missed_questions || [];
  const weakTopics = analytics?.weak_topics || [];

  const filteredRoster = roster.filter((s: any) => {
    const matchesSearch = s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.admission_number.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'passed') return s.passed;
    if (filter === 'failed') return s.attempts_count > 0 && !s.passed;
    if (filter === 'unattempted') return s.attempts_count === 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            to="/lecturer/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-brand-600" />
            Cohort Lab Performance & Weakness Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {analytics?.unit?.code} • {analytics?.unit?.name} — Authoritative assessment results, passing rates, and question breakdown.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Includes Demo Cohort for Hackathon Evaluation</span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Enrolled Cohort</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{summary.total_enrolled || 0}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">{summary.attempted_count || 0} attempted ({summary.unattempted_count || 0} pending)</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-brand-700 uppercase">Passed (≥ 75%)</span>
          <div className="mt-2 text-2xl font-extrabold text-brand-600">{summary.passed_count || 0}</div>
          <p className="text-[11px] text-brand-700 mt-0.5">Pass Rate: {summary.pass_rate || 0}%</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-rose-700 uppercase">Need Retake (&lt; 75%)</span>
          <div className="mt-2 text-2xl font-extrabold text-rose-600">{summary.failed_count || 0}</div>
          <p className="text-[11px] text-rose-600 mt-0.5">Remediation required</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-brand-700 uppercase">Average Score</span>
          <div className="mt-2 text-2xl font-extrabold text-brand-600">{summary.average_score || 0} <span className="text-xs font-medium text-slate-400">/ {summary.max_possible_score || 30}</span></div>
          <p className="text-[11px] text-slate-400 mt-0.5">Across all student submissions</p>
        </div>
      </div>

      {/* Weak Topics & Missed Questions Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weak Topics */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Topic Weakness Distribution
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Topics where students frequently made errors, driving personalized revision recommendations.
          </p>

          {weakTopics.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No topic errors recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {weakTopics.map((topic: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{topic.topic}</span>
                    <p className="text-[11px] text-slate-500">{topic.misses} incorrect answers across attempts</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-800 border border-brand-200">
                    Recommended Review Topic
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Missed Questions */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-rose-500" /> Most Missed Questions
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Specific assessment questions causing student failures during timed lab submissions.
          </p>

          {mostMissed.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No student misses recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {mostMissed.map((q: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                      Topic: {q.topic}
                    </span>
                    <span className="text-xs font-bold text-rose-600">{q.miss_count} students missed</span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium line-clamp-2">{q.question_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cohort Grade Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Student Submission Roster</h2>
            <p className="text-xs text-slate-500 mt-0.5">Authoritative records including synthetic demonstration cohort</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student or ID..."
                className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {(['all', 'passed', 'failed', 'unattempted'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilter(mode)}
                  className={`px-2.5 py-1 rounded text-xs font-bold capitalize transition-colors ${
                    filter === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Admission No.
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Cohort Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Attempts
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Best Score
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredRoster.map((s: any) => (
                <tr key={s.student_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-900">{s.student_name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {s.admission_number}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {s.is_synthetic ? (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        Synthetic Demo
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-brand-50 text-brand-800 font-semibold border border-brand-200">
                        Live Student
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-bold text-slate-700">
                    {s.attempts_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {s.attempts_count > 0 ? (
                      <span className="text-xs font-bold text-slate-900">
                        {s.best_score} ({s.best_percentage}%)
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {s.attempts_count === 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> Not Attempted
                      </span>
                    ) : s.passed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-800 bg-brand-100 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-brand-600" /> Passed (≥75%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3 text-rose-600" /> Retake Needed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
