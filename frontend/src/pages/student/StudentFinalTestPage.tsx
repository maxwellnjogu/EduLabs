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

  const {
    unit,
    is_eligible,
    eligibility_reason,
    is_passed,
    latest_attempt,
    priority_revision_areas,
    lecturer_recommended_topics,
    exam_configuration,
  } = data;

  const totalQuestions = exam_configuration?.total_questions || 30;
  const timerSeconds = exam_configuration?.timer_seconds || 30;
  const passThreshold = exam_configuration?.passing_threshold || 17;
  const passPercentage = exam_configuration?.passing_percentage || 56.7;

  // Active Test UI View (30 Questions, 30s per question)
  if (testActive && testData) {
    const questions = testData.questions || [];
    const q = questions[currentIdx];
    const isWritten = q?.question_type === "written";
    const answeredCount = Object.keys(mcqAnswers).length + Object.keys(writtenAnswers).filter(k => writtenAnswers[parseInt(k)]?.trim()).length;

    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Test Header */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-400/30">
                CAPSTONE EVALUATION
              </span>
              <span className="text-xs text-slate-400">
                Question {currentIdx + 1} of {questions.length} ({answeredCount} answered)
              </span>
            </div>
            <h1 className="text-base font-bold text-white mt-1">{testData.assessment.title}</h1>
            <p className="text-xs text-slate-400">
              Pass mark: <span className="text-brand-400 font-bold">{passThreshold}/{totalQuestions} ({passPercentage}%)</span> • Strict 30s per question
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

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-brand-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / (questions.length || 1)) * 100}%` }}
          />
        </div>

        {/* Question Selector Bubbles */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] font-bold text-slate-500 mr-2">Jump to:</span>
          {questions.map((item: any, idx: number) => {
            const isAnswered = mcqAnswers[item.id] !== undefined || (writtenAnswers[item.id] && writtenAnswers[item.id].trim().length > 0);
            const isCurrent = idx === currentIdx;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentIdx(idx)}
                className={`w-7 h-7 text-[11px] font-bold rounded-lg transition-all ${
                  isCurrent
                    ? "bg-brand-600 text-white ring-2 ring-brand-400"
                    : isAnswered
                    ? "bg-brand-100 text-brand-800 border border-brand-300"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Current Question Card */}
        {q && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Question {currentIdx + 1} of {questions.length}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                  Topic: {q.topic_tag}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {q.marks} Mark{q.marks > 1 ? "s" : ""}
                </span>
              </div>

              <CountdownTimer
                key={`final-timer-${q.id}`}
                secondsRemaining={q.timer_seconds || timerSeconds}
                onExpire={() => {
                  if (currentIdx < questions.length - 1) {
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

              {currentIdx < questions.length - 1 ? (
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
        )}
      </div>
    );
  }

  // Pre-Test Revision Dashboard & Gate View
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
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
            Pass benchmark: <span className="text-amber-300 font-bold">{passThreshold}/{totalQuestions} ({passPercentage}%)</span> • 30 seconds per question. Review your personalized revision dashboard below before launching the exam.
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
            <span>Locked (Complete All 15 Labs to Unlock)</span>
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
            <span className="font-bold block text-sm">
              {is_eligible ? "Eligible for Final Readiness Exam" : "Prerequisites Incomplete"}
            </span>
            <span className="text-slate-600">
              {eligibility_reason || `Completed ${data?.labs_completed || 0} of ${data?.total_labs || 15} labs required.`}
            </span>
          </div>
        </div>

        {latest_attempt && (
          <div className="text-right">
            <span className="font-bold block text-sm">
              Latest Score: {latest_attempt.score}/{latest_attempt.total_marks} ({latest_attempt.percentage}%)
            </span>
            <span
              className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded ${
                latest_attempt.passed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
              }`}
            >
              {latest_attempt.passed ? "Passed Threshold" : "Retake Permitted"}
            </span>
          </div>
        )}
      </div>

      {/* Readiness Exam Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase">Exam Pool</span>
          <div className="text-xl font-bold text-slate-900">{totalQuestions} Questions</div>
          <p className="text-[11px] text-slate-500">Comprehensive syllabus coverage (SDLC, SPM, Design, V&V)</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase">Time Allocation</span>
          <div className="text-xl font-bold text-slate-900">{timerSeconds}s / Question</div>
          <p className="text-[11px] text-slate-500">Fast-paced evaluation measuring engineering concept recall</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase">Pass Requirement</span>
          <div className="text-xl font-bold text-brand-600">≥ {passThreshold}/{totalQuestions} ({passPercentage}%)</div>
          <p className="text-[11px] text-slate-500">Authoritative benchmark required for exam hall clearance</p>
        </div>
      </div>

      {/* SECTION A: Your Priority Revision Areas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900">Your Priority Revision Areas</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Targeted revision priorities derived from student lab performance and curriculum benchmarks across the completed labs.
            </p>
          </div>
          <Link
            to={`/student/revision/${unit?.id}`}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <span>Open Revision Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(priority_revision_areas || [
            {
              topic: "Unified Modeling Language (UML)",
              priority: "High",
              explanation: "Consolidate structural vs behavioral relationships: focus on Class Diagrams, Sequence lifelines, and state machine transitions.",
              relevant_lab: "Lab 4: UML & Architectural Design",
              study_link: `/student/revision/${unit?.id}?topic=uml`,
              note: "Configured revision recommendation",
            },
            {
              topic: "Software Project Management",
              priority: "High",
              explanation: "Review Agile sprint sizing, critical path method (CPM), PERT estimations, and risk contingency budgeting.",
              relevant_lab: "Lab 8: Agile Project Estimation & Planning",
              study_link: `/student/revision/${unit?.id}?topic=project-management`,
              note: "Configured revision recommendation",
            },
            {
              topic: "Development Methodologies",
              priority: "Low",
              explanation: "Compare linear sequential phase gates (Waterfall) against empirical feedback loops and sprint velocity (Scrum/Kanban).",
              relevant_lab: "Lab 1: SDLC Methodologies",
              study_link: `/student/units/${unit?.id}/weeks/1`,
              note: "Configured revision recommendation",
            },
          ]).map((area: any, idx: number) => {
            const isHigh = area.priority?.toLowerCase() === "high";
            return (
              <div
                key={idx}
                className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-purple-300 transition-colors space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        isHigh
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {area.priority} Priority
                    </span>
                    {area.relevant_lab && (
                      <span className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">
                        {area.relevant_lab}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">{area.topic}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{area.explanation}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 italic">
                    {area.note || "Configured revision recommendation"}
                  </span>
                  <Link
                    to={area.study_link || `/student/revision/${unit?.id}`}
                    className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                  >
                    <span>Study Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION B: Lecturer-Recommended Exam Focus Areas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Lecturer-Recommended Exam Focus Areas</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Curated by the academic faculty as high-yield examination themes. Stored separately from personal lab weaknesses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(lecturer_recommended_topics || [
            {
              topic: "Software Quality Assurance",
              priority: "High",
              subtopics: [
                "ISO 9001 & CMMI Process Standards",
                "Defect Lifecycle Management & Root Cause Analysis",
                "Automated Regression & Static Code Analysis",
              ],
              study_link: `/student/revision/${unit?.id}?topic=sqa`,
            },
            {
              topic: "Requirements Elicitation",
              priority: "High",
              subtopics: [
                "Functional vs Non-Functional Requirements (NFRs)",
                "Stakeholder Interviewing & Conflict Resolution",
                "Use Case Specifications & User Story Mapping",
              ],
              study_link: `/student/revision/${unit?.id}?topic=requirements`,
            },
            {
              topic: "Software Testing Methods",
              priority: "Medium",
              subtopics: [
                "Boundary Value Analysis & Equivalence Partitioning",
                "Integration Testing & API Contract Verification",
                "White-Box Path Coverage vs Black-Box Suites",
              ],
              study_link: `/student/revision/${unit?.id}?topic=testing`,
            },
          ]).map((rec: any, idx: number) => {
            const isHigh = rec.priority?.toLowerCase() === "high";
            return (
              <div
                key={idx}
                className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-300 transition-colors space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        isHigh
                          ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {rec.priority || "High"} Priority
                    </span>
                    <span className="text-[10px] text-indigo-500 font-semibold">Faculty Recommended</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{rec.topic}</h3>

                  {rec.subtopics && rec.subtopics.length > 0 && (
                    <ul className="mt-2.5 space-y-1 text-xs text-slate-600">
                      {rec.subtopics.map((sub: string, sIdx: number) => (
                        <li key={sIdx} className="flex items-start gap-1.5">
                          <span className="text-indigo-500 font-bold">•</span>
                          <span>{sub}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-2 border-t border-indigo-100 flex items-center justify-end">
                  <Link
                    to={rec.study_link || `/student/revision/${unit?.id}`}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <span>Revision Material</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Start Button & Checklist footer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Ready to take the practice exam?</h4>
          <p className="text-xs text-slate-500">
            {is_eligible
              ? "You meet the 15-lab completion requirement. The 30 questions are strictly timed at 30 seconds each."
              : "Readiness exam will unlock once all 15 syllabus labs are marked complete on the server."}
          </p>
        </div>

        {is_eligible ? (
          <button
            onClick={handleStartTest}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 flex-shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Start 30-Question Readiness Exam</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            disabled
            className="px-6 py-3 rounded-xl bg-slate-200 text-slate-500 font-bold text-xs flex items-center gap-2 cursor-not-allowed"
          >
            <Lock className="w-4 h-4" />
            <span>Complete All 15 Labs to Unlock</span>
          </button>
        )}
      </div>

      <AITutorDrawer />
    </div>
  );
};
