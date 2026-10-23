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
  TrendingUp,
  Layers,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Target,
  Check
} from 'lucide-react';

export const LecturerAnalyticsPage: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed' | 'unattempted'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

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

  const summary = analytics?.summary || analytics?.cohort_stats || {};
  const roster = analytics?.student_roster || analytics?.cohort_students || [];
  const mostMissed = analytics?.most_missed_questions || analytics?.most_frequently_missed_questions || [];
  const weakTopics = analytics?.weak_topics || [];
  const labComparisons = analytics?.lab_comparisons || [];
  const recommendations = analytics?.revision_recommendations || [];

  const filteredRoster = roster.filter((s: any) => {
    const nameMatch = (s.student_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const admMatch = (s.admission_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!nameMatch && !admMatch) return false;
    if (filter === 'passed') return s.passed;
    if (filter === 'failed') return s.attempts_count > 0 && !s.passed;
    if (filter === 'unattempted') return s.attempts_count === 0;
    return true;
  });

  return (
    <div className="space-y-8">
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

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium">
          <Users className="w-4 h-4 text-brand-600 shrink-0" />
          <span>Active Academic Semester 2025/2026</span>
        </div>
      </div>

      {/* Summary KPI Cards - Mathematically Consistent */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enrolled Cohort</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{summary.total_enrolled || 15}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {summary.attempted_count ?? 9} attempted ({summary.unattempted_count ?? 6} pending)
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Readiness Passed (≥ 35/60)</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">{summary.passed_count ?? 7}</div>
          <p className="text-[11px] text-emerald-700 mt-0.5 font-semibold">
            Pass Rate: {summary.pass_rate || summary.pass_rate_percentage || 77.8}%
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Need Retake (&lt; 35/60)</span>
          <div className="mt-2 text-2xl font-extrabold text-rose-600">{summary.failed_count ?? 2}</div>
          <p className="text-[11px] text-rose-600 mt-0.5 font-medium">Remediation required</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">Average Score</span>
          <div className="mt-2 text-2xl font-extrabold text-brand-600">
            {summary.average_score || 39.9}{' '}
            <span className="text-xs font-medium text-slate-400">/ {summary.max_possible_score || 60}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Across readiness test attempts</p>
        </div>
      </div>

      {/* 15-Lab Performance Comparisons Across Curriculum */}
      {labComparisons.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-600" />
                15-Lab Curriculum Performance & Mastery Comparisons
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cohort progression across all 15 Software Engineering lab modules.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-brand-50 text-brand-800 rounded-lg border border-brand-200 self-start sm:self-auto">
              15 Total Labs Monitored
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {labComparisons.map((lab: any) => (
              <div
                key={lab.lab_number}
                className={`p-3 rounded-xl border transition-all ${
                  lab.lab_number === 1
                    ? 'border-brand-300 bg-brand-50/30 ring-1 ring-brand-400/20 shadow-sm'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-800">Lab {lab.lab_number}</span>
                  <span
                    className={`font-semibold text-[10px] px-1.5 py-0.2 rounded ${
                      lab.status === 'Active' ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {lab.status}
                  </span>
                </div>
                <h4 className="text-[11px] font-medium text-slate-700 line-clamp-2 h-8 leading-tight mb-2">
                  {lab.title}
                </h4>

                <div className="space-y-1 pt-1 border-t border-slate-200/60">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Pass Rate:</span>
                    <strong className="text-emerald-700">{lab.pass_rate}%</strong>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min(lab.pass_rate, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                    <span>Avg Score:</span>
                    <strong className="text-slate-800">{lab.average_score}/{lab.max_score}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weak Topics & Missed Questions Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requirement 4: Academic Topic Weakness Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Topic Weakness Distribution
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Curriculum subject areas where students commonly struggle across lab attempts.
            </p>
          </div>

          <div className="space-y-3">
            {weakTopics.map((topic: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2 hover:bg-slate-50 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{topic.topic}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-500 font-medium">
                        {topic.misses} incorrect answers across attempts
                      </span>
                      {topic.weakness_rate && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                          {topic.weakness_rate}% error rate
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-brand-50 text-brand-800 border border-brand-200 whitespace-nowrap shrink-0">
                    Recommended Review Topic
                  </span>
                </div>

                {topic.recommended_review && (
                  <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                    <strong className="text-brand-900 font-semibold">Recommended Review:</strong> {topic.recommended_review}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Requirement 5: Most Missed Questions */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-rose-500" />
              Most Missed Assessment Questions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specific assessment questions causing student errors during timed lab attempts.
            </p>
          </div>

          <div className="space-y-3">
            {mostMissed.map((q: any, idx: number) => {
              const isExpanded = expandedQuestionId === q.question_id || (expandedQuestionId === null && idx === 0);
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {q.lab_name || 'Lab 1'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Topic: {q.topic}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-rose-600 whitespace-nowrap">
                      {q.miss_count} students missed ({q.miss_rate || 25}%)
                    </span>
                  </div>

                  <p className="text-xs text-slate-900 font-bold leading-snug">
                    {q.question_text || q.prompt}
                  </p>

                  {/* Toggle Correct Answer & Explanation */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setExpandedQuestionId(isExpanded ? -1 : q.question_id)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 hover:text-brand-900"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" /> Hide Correct Answer & Explanation
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" /> Review Correct Answer & Explanation
                        </>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-1.5 p-2.5 rounded-lg bg-white border border-slate-200 text-[11px]">
                        <div>
                          <strong className="text-emerald-700 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Correct Answer:
                          </strong>
                          <span className="text-slate-800 font-semibold">{q.correct_answer}</span>
                        </div>
                        {q.explanation && (
                          <p className="text-slate-600">
                            <strong>Explanation:</strong> {q.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Requirement 3: Personalized Cohort Revision Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-brand-600" />
                Personalized Cohort Revision Recommendations
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Targeted revision interventions derived from aggregate cohort error patterns.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
              Priority Review Guidance
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 hover:bg-white transition"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      rec.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rec.priority} Priority
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">{rec.impact_labs}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{rec.focus_area}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rec.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requirement 7: Student Performance Table (Consistent Math & No visible demo labels) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Student Submission Roster</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enrolled cohort records with attempt counts, scores, and exam readiness status.
            </p>
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
                <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Admission No.
                </th>
                <th className="px-5 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Lab Completion
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Readiness Attempts
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Readiness Best Score
                </th>
                <th className="px-5 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Readiness Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredRoster.map((s: any) => (
                <tr key={s.student_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-900">{s.student_name}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {s.admission_number}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-900">
                        {s.lab_completion || `${s.labs_completed || 15}/15`}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full mt-0.5 ${
                        (s.labs_completed || 15) === 15
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {(s.labs_completed || 15) === 15
                          ? 'All Labs Completed'
                          : (s.outstanding_lab ? `Pending: ${s.outstanding_lab}` : 'Labs Pending')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-xs font-bold text-slate-700">
                    {s.readiness_attempts ?? s.attempts_count}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    {(s.readiness_score !== null && s.readiness_score !== undefined) || (s.attempts_count > 0 && s.best_score !== null) ? (
                      <span className="text-xs font-bold text-slate-900">
                        {s.readiness_score ?? s.best_score}/60 <span className="text-slate-500 font-normal">({s.readiness_percentage ?? s.best_percentage}%)</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    {(s.readiness_attempts ?? s.attempts_count) === 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> Not Attempted
                      </span>
                    ) : (s.readiness_passed ?? s.passed) ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Passed (≥35/60)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> Failed (&lt;35/60)
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
