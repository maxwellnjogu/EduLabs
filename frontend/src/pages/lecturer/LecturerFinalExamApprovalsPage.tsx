import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lecturerApi } from '../../api/client';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

export const LecturerFinalExamApprovalsPage: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchApprovals = async () => {
    if (!unitId) return;
    try {
      const res = await lecturerApi.getFinalExamApprovals(Number(unitId));
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [unitId]);

  const handleApprove = async (studentId: number, isApproved: boolean) => {
    if (!unitId) return;
    setApprovingId(studentId);
    setMessage(null);
    try {
      const res = await lecturerApi.approveFinalExam(Number(unitId), {
        student_id: studentId,
        is_approved: isApproved,
        approval_notes: isApproved
          ? 'Approved by Lead Lecturer Dr. James Mwangi based on passing readiness assessment.'
          : 'Revoked/Disapproved by Faculty.',
      });
      setMessage({
        type: 'success',
        text: res?.data?.message || (isApproved ? 'Successfully approved for the final exam' : 'Approval revoked.'),
      });
      if (res?.data?.records && res?.data?.metrics) {
        setData((prev: any) => ({
          ...prev,
          metrics: res.data.metrics,
          records: res.data.records,
        }));
      } else {
        fetchApprovals();
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.error || err?.message || 'Failed to update approval status.',
      });
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const records = data?.records || [];

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
            <Award className="w-7 h-7 text-purple-600" />
            University Final Exam Eligibility & Faculty Approvals
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {data?.unit?.code} • {data?.unit?.name} — Certify student clearance for the official invigilated university examination sitting.
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <span className="font-semibold">{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold underline ml-4 cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Distinction Callout */}
      <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-4 text-xs text-purple-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-purple-950">Readiness Pass vs. Official University Sitting Approval</p>
          <p className="mt-0.5 text-purple-800 leading-relaxed">
            In compliance with academic governance standards, passing the internal MaxLabs Final Readiness Assessment (≥ 17.5/30 - 58.33%) and completing all 15 curriculum laboratories is an institutional prerequisite. Formal entry to the actual invigilated university examination hall requires explicit faculty sign-off, recorded below with immutable timestamps.
          </p>
        </div>
      </div>

      {/* KPI Stats - Derived from displayed underlying 15 records */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Enrolled Cohort</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{metrics.total_enrolled || 15}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Registered candidates</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-brand-700 uppercase">Readiness Exam Passed</span>
          <div className="mt-2 text-2xl font-extrabold text-brand-600">{metrics.final_test_passed_count ?? 0}</div>
          <p className="text-[11px] text-brand-700 mt-0.5">Met 17.5/30 pass threshold</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-purple-700 uppercase">Officially Approved</span>
          <div className="mt-2 text-2xl font-extrabold text-purple-600">{metrics.approved_for_exam_count ?? 0}</div>
          <p className="text-[11px] text-purple-700 mt-0.5">Exam clearance granted</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-amber-700 uppercase">Pending Approval</span>
          <div className="mt-2 text-2xl font-extrabold text-amber-600">{metrics.pending_approval_count ?? 0}</div>
          <p className="text-[11px] text-amber-700 mt-0.5">Awaiting faculty sign-off</p>
        </div>
      </div>

      {/* Candidate Clearance Roster */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">Final Candidate Clearance Roster</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            15 Cohort Candidates • Showing authoritative lab completion, readiness scores, and examination approval status
          </p>
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
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Lab Completion
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Readiness Score
                </th>
                <th className="px-3 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Attempts
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Grading Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Readiness Result
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Examination Clearance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {records.map((r: any) => (
                <tr key={r.student_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-900">{r.student_name}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {r.admission_number}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-900">
                        {r.lab_completion_display || `${r.labs_completed}/${r.total_labs}`}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full mt-0.5 ${
                        r.labs_completed === r.total_labs
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {r.labs_completed === r.total_labs
                          ? 'All Labs Completed'
                          : (r.outstanding_lab ? `Pending: ${r.outstanding_lab}` : 'Labs Pending')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    {r.raw_score !== null && r.raw_score !== undefined ? (
                      <span className="text-xs font-bold text-slate-900">
                        {r.raw_score}/30 <span className="text-slate-500 font-normal">({r.final_test_score}%)</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-center text-xs font-bold text-slate-700">
                    {r.attempts_count}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    {r.grading_status === 'Pending Written Review' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                        Pending Written Review
                      </span>
                    ) : r.attempts_count > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        Graded (Finalized)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        No Attempts
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    {r.final_test_passed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-800 bg-brand-100 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" /> Met 17.5/30 Criteria
                      </span>
                    ) : r.attempts_count > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> Did Not Meet 17.5/30
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> No Attempt
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {r.is_approved_for_final_exam ? (
                      <div className="inline-flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Officially Approved
                        </span>
                        {r.approved_by && (
                          <span className="text-[10px] text-slate-500">
                            By {r.approved_by}
                          </span>
                        )}
                      </div>
                    ) : r.can_approve ? (
                      <button
                        onClick={() => handleApprove(r.student_id, true)}
                        disabled={approvingId === r.student_id}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        {approvingId === r.student_id ? 'Authorizing...' : 'Approve for Final Examination'}
                      </button>
                    ) : (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                        r.labs_completed < r.total_labs
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : r.attempts_count === 0
                          ? 'bg-slate-50 text-slate-600 border-slate-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {r.pending_reason || (r.labs_completed < r.total_labs ? 'SDLC lab outstanding' : (r.attempts_count === 0 ? 'Readiness exam not attempted' : 'Readiness score below 17.5/30'))}
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
