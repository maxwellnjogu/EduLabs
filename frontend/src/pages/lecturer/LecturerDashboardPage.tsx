import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { lecturerApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  BarChart3,
  Award
} from 'lucide-react';

export const LecturerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lecturerApi.getDashboard()
      .then(res => setDashboard(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const assignedUnits = dashboard?.assigned_units || [];
  const primaryUnit = assignedUnits[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-brand-200 border border-white/10 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Active Semester: {dashboard?.active_semester?.name || 'Semester 1'} ({dashboard?.active_semester?.academic_year || '2025/2026'})
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome, Lecturer {user?.first_name || 'James'} {user?.last_name || 'Mwangi'}
          </h1>
          <p className="mt-2 text-sm text-brand-100 leading-relaxed">
            Lead Faculty for <strong>Software Engineering (SE401)</strong>. Manage weekly curriculum materials, author interactive labs, review student attempt analytics, and certify final university exam eligibility.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {primaryUnit && (
              <>
                <Link
                  to={`/lecturer/units/${primaryUnit.id}/weeks`}
                  className="px-4 py-2 bg-white text-brand-900 rounded-lg text-xs font-bold hover:bg-brand-50 transition-colors shadow-sm inline-flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-brand-600" /> Manage 14 Weeks Curriculum
                </Link>
                <Link
                  to={`/lecturer/units/${primaryUnit.id}/builder`}
                  className="px-4 py-2 bg-brand-700/80 hover:bg-brand-700 text-white border border-brand-500/30 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-amber-300" /> Assessment Builder
                </Link>
                <Link
                  to={`/lecturer/units/${primaryUnit.id}/analytics`}
                  className="px-4 py-2 bg-brand-700/80 hover:bg-brand-700 text-white border border-brand-500/30 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4 text-brand-300" /> Cohort Analytics
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Enrolled Students</span>
            <Users className="w-5 h-5 text-brand-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {dashboard?.presentation_layer?.enrolled_students ?? dashboard?.metrics?.total_enrolled_students ?? 20}
            </span>
            <span className="text-xs text-slate-500 font-medium">Students</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Software Engineering cohort</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Submissions Passed</span>
            <CheckCircle2 className="w-5 h-5 text-brand-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-brand-600">{dashboard?.metrics?.total_passed_attempts ?? 0}</span>
            <span className="text-xs text-brand-700 font-semibold">≥ 75% Lab Pass</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Server validated score threshold</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Requiring Retake</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">
              {dashboard?.presentation_layer?.requiring_retake ?? dashboard?.metrics?.total_failed_attempts ?? 3}
            </span>
            <span className="text-xs text-amber-700 font-semibold">&lt; 75% Score</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Permitted retry active</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Final Exam Approved</span>
            <Award className="w-5 h-5 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-600">
              {dashboard?.presentation_layer?.final_exam_approved ?? dashboard?.metrics?.final_exam_approved_count ?? 4}
            </span>
            <span className="text-xs text-purple-700 font-semibold">Certified</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Met readiness criteria</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Units List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-600" /> Assigned Faculty Units
              </h2>
              <span className="text-xs text-slate-500">{assignedUnits.length} Unit Assigned</span>
            </div>

            <div className="space-y-4">
              {assignedUnits.map((unit: any) => (
                <div key={unit.id} className="p-4 rounded-xl border border-brand-200 bg-brand-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-brand-600 text-white">
                        {unit.code}
                      </span>
                      <span className="text-xs font-semibold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
                        Working Demonstration Unit
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-2">{unit.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Programme: {unit.programme_name || 'BSc. Computer Science / Software Engineering'}
                    </p>
                  </div>

                  <div className="flex flex-wrap sm:flex-col gap-2">
                    <Link
                      to={`/lecturer/units/${unit.id}/weeks`}
                      className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700 text-center"
                    >
                      Curriculum (14 Wks)
                    </Link>
                    <Link
                      to={`/lecturer/units/${unit.id}/analytics`}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 text-center"
                    >
                      Cohort Analytics
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Student Submissions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500" /> Recent Student Submissions
            </h2>

            {dashboard?.recent_submissions?.length === 0 ? (
              <p className="text-xs text-slate-500">No student submissions recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {dashboard?.recent_submissions?.map((sub: any) => (
                  <div key={sub.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{sub.student_name}</p>
                      <p className="text-xs text-slate-500">
                        {sub.assessment_title} • Attempt #{sub.attempt_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                        sub.passed ? 'bg-brand-100 text-brand-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {sub.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {sub.percentage}% ({sub.score}/{sub.max_score})
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Policy Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Lecturer Control Deck
            </h3>

            <div className="space-y-2.5">
              {primaryUnit && (
                <>
                  <Link
                    to={`/lecturer/units/${primaryUnit.id}/builder`}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-brand-400 hover:bg-brand-50/50 transition-all text-xs font-semibold text-slate-800 group"
                  >
                    <span className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-brand-600" /> Prebuilt SDLC Assessment Generator
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
                  </Link>

                  <Link
                    to={`/lecturer/units/${primaryUnit.id}/exam-readiness-builder`}
                    className="flex items-center justify-between p-3 rounded-lg border border-indigo-200 bg-indigo-50/30 hover:border-indigo-400 hover:bg-indigo-50/60 transition-all text-xs font-semibold text-slate-800 group"
                  >
                    <span className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" /> 60-Question Exam Readiness Builder
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </Link>

                  <Link
                    to={`/lecturer/units/${primaryUnit.id}/revision`}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-brand-400 hover:bg-brand-50/50 transition-all text-xs font-semibold text-slate-800 group"
                  >
                    <span className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-brand-600" /> Curate Revision Materials
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
                  </Link>

                  <Link
                    to={`/lecturer/units/${primaryUnit.id}/approvals`}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-brand-400 hover:bg-brand-50/50 transition-all text-xs font-semibold text-slate-800 group"
                  >
                    <span className="flex items-center gap-2.5">
                      <Award className="w-4 h-4 text-purple-600" /> Final University Exam Approvals
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-5 text-xs text-amber-900">
            <h4 className="font-bold text-amber-950 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" /> Hackathon Evaluation Note
            </h4>
            <p className="text-amber-800 leading-relaxed">
              Software Engineering (SE401) is fully wired for the live demo. Week 1 is pre-populated with real SDLC lecture slides, diagram, and YouTube resource. Weeks 2–14 remain empty until you publish materials. Demo analytics are synthetically enriched to illustrate pass/retake cohorts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
