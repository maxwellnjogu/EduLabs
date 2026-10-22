import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import {
  FileCheck,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Send,
  HelpCircle,
  Lock,
} from "lucide-react";
import { CountdownTimer } from "../../components/common/CountdownTimer";
import { AITutorDrawer } from "../../components/common/AITutorDrawer";

export const StudentFinalTestPage: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Test active state
  const [testActive, setTestActive] = useState(false);
  const [testData, setTestData] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<{ [qId: number]: number }>({});
  const [writtenAnswers, setWrittenAnswers] = useState<{ [qId: number]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const uId = unitId ? parseInt(unitId) : 1;

  useEffect(() => {
    api.getStudentFinalTest(uId)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load final readiness status");
        setLoading(false);
      });
  }, [uId]);

  const handleStartTest = async () => {
    if (!data?.assessment_id) return;
    setLoading(true);
    try {
      const res = await api.getStudentAssessment(data.assessment_id);
      setTestData(res);
      setTestActive(true);
      setCurrentIdx(0);
    } catch (err: any) {
      alert(`Could not start final test: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTest = async () => {
    if (!testData) return;
    setSubmitting(true);

    const answersPayload: any[] = [];
    for (const q of testData.questions) {
      if (q.question_type === "mcq") {
        answersPayload.push({
          question_id: q.id,
          selected_option_id: mcqAnswers[q.id] || null,
        });
      } else if (q.question_type === "written") {
        answersPayload.push({
          question_id: q.id,
          written_response: writtenAnswers[q.id] || "",
        });
      }
    }

    try {
      const res = await api.submitStudentAttempt(testData.attempt_id, answersPayload);
      navigate(`/student/results/${testData.attempt_id}`, { state: { result: res } });
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">
          {error || "Final readiness test status not available."}
        </div>
      </div>
    );
  }

  const { unit, is_eligible, eligibility_reason, is_passed, latest_attempt } = data;

  // Active Test UI View (15 Questions: 14 MCQs + 1 Written)
  if (testActive && testData) {
    const q = testData.questions[currentIdx];
    const isWritten = q.question_type === "written";

    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Test Header */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-400/30">
                CAPSTONE EVALUATION
              </span>
              <span className="text-xs text-slate-400">Question {currentIdx + 1} of {testData.questions.length}</span>
            </div>
            <h1 className="text-base font-bold text-white mt-1">{testData.assessment.title}</h1>
            <p className="text-xs text-slate-400">
              Passing threshold: <span className="text-brand-400 font-bold">65%</span> (Qualifies for formal university exam)
            </p>
          </div>

          <button
            onClick={handleSubmitTest}
            disabled={submitting}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Finalize Submission</span>
          </button>
        </div>

        {/* Current Question Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Question {currentIdx + 1}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                Topic: {q.topic_tag}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {q.marks} Marks
              </span>
            </div>

            <CountdownTimer
              key={`final-timer-${q.id}`}
              secondsRemaining={q.timer_seconds || (isWritten ? 30 : 10)}
              onExpire={() => {
                if (currentIdx < testData.questions.length - 1) {
                  setCurrentIdx((p) => p + 1);
                }
              }}
            />
          </div>

          <h3 className="text-base font-bold text-slate-900 leading-snug">{q.prompt}</h3>

          {/* MCQ Options */}
          {!isWritten && (
            <div className="space-y-2.5">
              {q.options?.map((opt: any) => {
                const isSelected = mcqAnswers[q.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setMcqAnswers({ ...mcqAnswers, [q.id]: opt.id })}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition flex items-center justify-between ${
                      isSelected
                        ? "bg-brand-50 border-brand-500 text-brand-900 font-bold ring-2 ring-brand-500/20"
                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/80 text-slate-800"
                    }`}
                  >
                    <span>{opt.option_text}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Written Question Textarea */}
          {isWritten && (
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <span className="font-bold text-slate-700">Marking Rubric: </span>
                <span>{q.marking_rubric}</span>
              </div>
              <textarea
                rows={5}
                value={writtenAnswers[q.id] || ""}
                onChange={(e) => setWrittenAnswers({ ...writtenAnswers, [q.id]: e.target.value })}
                placeholder="Type your structured engineering response addressing the question rubric..."
                className="w-full p-3.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              ></textarea>
            </div>
          )}

          {/* Question Nav */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
              disabled={currentIdx === 0}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 disabled:opacity-30"
            >
              ← Previous
            </button>

            {currentIdx < testData.questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((p) => p + 1)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
              >
                Next Question →
              </button>
            ) : (
              <button
                onClick={handleSubmitTest}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
              >
                Submit Readiness Exam
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Pre-Test Gate View (Eligibility & Checklist)
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-brand-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-400/30">
              {unit?.code}
            </span>
            <span className="text-xs text-brand-300">Capstone Milestone</span>
          </div>
          <h1 className="text-2xl font-bold">Practice Exam Readiness Assessment</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Passing threshold: 65%. Practice readiness evaluation to demonstrate student mastery across all 15 Software Engineering syllabus topics. Note: This is an internal readiness benchmark, not the actual Riara University formal final examination.
          </p>
        </div>

        {is_eligible ? (
          <button
            onClick={handleStartTest}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition flex items-center gap-2 flex-shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Begin Readiness Exam</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="px-4 py-2 rounded-xl bg-slate-800/80 text-amber-300 text-xs font-semibold border border-amber-400/30 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Locked (Pass SDLC Lab to Unlock)</span>
          </div>
        )}
      </div>

      {/* Eligibility Status Banner */}
      <div
        className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
          is_eligible
            ? "bg-brand-50 border-brand-200 text-brand-900"
            : "bg-amber-50 border-amber-200 text-amber-900"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-xl text-white ${is_eligible ? "bg-brand-600" : "bg-amber-500"}`}
          >
            {is_eligible ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <span className="font-bold block">
              {is_eligible ? "Eligible for Final Readiness Exam" : "Prerequisites Incomplete"}
            </span>
            <span className="text-slate-600">{eligibility_reason}</span>
          </div>
        </div>

        {latest_attempt && (
          <div className="text-right">
            <span className="font-bold block">Latest Score: {latest_attempt.percentage}%</span>
            <span
              className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded ${
                latest_attempt.passed ? "bg-brand-100 text-brand-800" : "bg-rose-100 text-rose-800"
              }`}
            >
              {latest_attempt.passed ? "Passed" : "Retake Available"}
            </span>
          </div>
        )}
      </div>

      {/* Structure & Test Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase">Format</span>
          <div className="text-base font-bold text-slate-900">60 Questions</div>
          <p className="text-[11px] text-slate-500">45 Multiple Choice + 15 Scenario Written</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase">Timing</span>
          <div className="text-base font-bold text-slate-900">Timed Sections</div>
          <p className="text-[11px] text-slate-500">60s per MCQ • 120s for written question</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase">Benchmark</span>
          <div className="text-base font-bold text-brand-600">&ge; 35/60 Score (58.3%)</div>
          <p className="text-[11px] text-slate-500">Confers formal eligibility for university final exam</p>
        </div>
      </div>

      {/* Pre-Exam Preparation Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Preparation Checklist</h3>
        <div className="space-y-3 text-xs text-slate-700">
          <div className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">SDLC 5-Phase Model: </span>
              <span>Requirement Analysis &rarr; Design &rarr; Implementation &rarr; Testing &rarr; Evolution.</span>
            </div>
          </div>
          <div className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Methodologies: </span>
              <span>Waterfall (predictive, sequential gates) vs. Agile (adaptive, iterative sprint cycles).</span>
            </div>
          </div>
          <div className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Deployment Segregation: </span>
              <span>Understanding the separation between Development, QA staging, and Production environments.</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
          <Link to={`/student/revision/${unit?.id}`} className="text-xs font-bold text-purple-600 hover:underline">
            ← Review Revision Hub Notes First
          </Link>
          {is_eligible && (
            <button
              onClick={handleStartTest}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow transition"
            >
              Start Final Readiness Exam →
            </button>
          )}
        </div>
      </div>

      <AITutorDrawer />
    </div>
  );
};
