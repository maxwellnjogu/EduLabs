import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../api/client";
import {
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  RotateCw,
  BookOpen,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  BarChart2,
  Download,
  Filter,
  Layers,
  FlaskConical,
} from "lucide-react";
import { AITutorDrawer } from "../../components/common/AITutorDrawer";

export const StudentLabResultsPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [attempt, setAttempt] = useState<any>(null);
  const [pastAttempts, setPastAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState<"all" | "incorrect" | "correct">("all");

  const attId = attemptId ? parseInt(attemptId) : 1;

  useEffect(() => {
    setLoading(true);
    api.getStudentAttemptDetail(attId)
      .then(async (res) => {
        setAttempt(res);
        if (res.assessment) {
          try {
            const hist = await api.getStudentAttemptHistory(res.assessment);
            setPastAttempts(hist || []);
          } catch {
            // optional history
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load attempt analytics record.");
        setLoading(false);
      });
  }, [attId]);

  // Topic-level breakdown derived dynamically from persisted answers
  const topicBreakdown = useMemo(() => {
    if (!attempt?.answers) return [];

    const map: Record<string, { total: number; correct: number; marks: number; maxMarks: number }> = {};
    for (const ans of attempt.answers) {
      const tag = ans.question_detail?.topic_tag || "Core Fundamentals";
      if (!map[tag]) {
        map[tag] = { total: 0, correct: 0, marks: 0, maxMarks: 0 };
      }
      map[tag].total += 1;
      if (ans.is_correct) map[tag].correct += 1;
      map[tag].marks += ans.score_awarded || 0;
      map[tag].maxMarks += ans.question_detail?.marks || 1;
    }

    return Object.entries(map).map(([topic, stats]) => {
      const pct = stats.maxMarks > 0 ? Math.round((stats.marks / stats.maxMarks) * 100) : 0;
      return {
        topic,
        total: stats.total,
        correct: stats.correct,
        marks: stats.marks,
        maxMarks: stats.maxMarks,
        pct,
        isWeak: pct < (attempt.passing_threshold || 75),
      };
    });
  }, [attempt]);

  // Weak topics derived from incorrect questions (Never hidden even if passing!)
  const weakTopics = useMemo(() => {
    return topicBreakdown.filter((t) => t.isWeak);
  }, [topicBreakdown]);

  // Filtered questions
  const filteredAnswers = useMemo(() => {
    if (!attempt?.answers) return [];
    if (filterType === "incorrect") return attempt.answers.filter((a: any) => !a.is_correct);
    if (filterType === "correct") return attempt.answers.filter((a: any) => a.is_correct);
    return attempt.answers;
  }, [attempt, filterType]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-700"></div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">
          {error || "Attempt record not found."}
        </div>
      </div>
    );
  }

  const isPassed = attempt.passed;
  const isReadiness = attempt.assessment_type === "final_readiness";
  const passThreshold = attempt.passing_threshold || (isReadiness ? 65 : 75);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* 1. Practice Test Analytics Header */}
      <section
        className={`rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 ${
          isPassed
            ? "bg-gradient-to-r from-brand-800 via-brand-700 to-slate-900 border border-brand-500/30"
            : "bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 border border-rose-500/30"
        }`}
      >
        <div className="flex items-center space-x-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${
              isPassed ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
            }`}
          >
            {isPassed ? <CheckCircle2 className="w-9 h-9" /> : <XCircle className="w-9 h-9" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  isPassed ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"
                }`}
              >
                {isPassed ? "Assessment Passed" : "Threshold Not Met"}
              </span>
              <span className="text-[10px] text-white/70">
                Attempt #{attempt.attempt_number}
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-1 tracking-tight">{attempt.assessment_title}</h1>
            <p className="text-xs text-white/80 mt-1">
              Official Grade: <strong className="text-white">{attempt.score} / {attempt.total_marks} marks</strong> ({attempt.percentage}%) • Passing Threshold: {passThreshold}%
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <Link
            to={`/student/lab/${attempt.assessment}`}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition shadow flex items-center gap-1.5 shrink-0"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Retake Assessment</span>
          </Link>
          <Link
            to="/student/analytics"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition flex items-center gap-1.5"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Lab Analytics</span>
          </Link>
          <Link
            to="/student/revision"
            className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-brand-950 font-bold text-xs shadow transition flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Revision Hub</span>
          </Link>
        </div>
      </section>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase">Official Score</span>
          <div className="text-2xl font-black text-slate-900">{attempt.percentage}%</div>
          <span className="text-[11px] text-slate-500">{attempt.score} / {attempt.total_marks} awarded points</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase">Passing Benchmark</span>
          <div className="text-2xl font-black text-slate-900">{passThreshold}%</div>
          <span className="text-[11px] text-slate-500">
            {isPassed ? "Requirement satisfied" : `Requires +${(passThreshold - attempt.percentage).toFixed(1)}% to pass`}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase">Accuracy</span>
          <div className="text-2xl font-black text-slate-900">
            {attempt.answers?.filter((a: any) => a.is_correct).length || 0} / {attempt.answers?.length || 0}
          </div>
          <span className="text-[11px] text-slate-500">Correctly answered items</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase">Questions Missed</span>
          <div className={`text-2xl font-black ${weakTopics.length > 0 ? "text-amber-600" : "text-emerald-600"}`}>
            {attempt.answers?.filter((a: any) => !a.is_correct).length || 0}
          </div>
          <span className="text-[11px] text-slate-500">
            {weakTopics.length > 0 ? "Review recommendations below" : "No missed concepts"}
          </span>
        </div>
      </div>

      {/* 3. Topic-Level Performance Breakdown */}
      <section className="bg-white rounded-2xl border border-brand-100 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-brand-700" />
            <h2 className="font-bold text-sm text-slate-900">Topic-Level Performance Breakdown</h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold">Derived from Persisted Answers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topicBreakdown.map((tb, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border text-xs space-y-2 ${
                tb.isWeak ? "bg-amber-50/50 border-amber-200" : "bg-emerald-50/40 border-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{tb.topic}</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    tb.isWeak ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {tb.pct}% ({tb.correct}/{tb.total} items)
                </span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full ${tb.isWeak ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${tb.pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>{tb.marks} / {tb.maxMarks} Marks Awarded</span>
                {tb.isWeak && (
                  <span className="text-amber-700 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Focus Area
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Weak Topics & Improvement Recommendations (Never hidden even if passing!) */}
      <section className="bg-white rounded-2xl border border-brand-100 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="font-bold text-sm text-slate-900">Specific Improvement Recommendations</h2>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">
            {weakTopics.length > 0 ? `${weakTopics.length} Focus Area(s)` : "Fully Mastered"}
          </span>
        </div>

        {weakTopics.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Based on the questions missed in this attempt, we recommend reviewing the following study guides and practicing with the related labs:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {weakTopics.map((wt, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{wt.topic}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        Accuracy: {wt.pct}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Review key architectural principles, definitions, and verification criteria for this topic before your next submission.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between gap-2">
                    <Link
                      to="/student/revision"
                      className="text-[11px] font-bold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Revision Notes</span>
                    </Link>
                    <Link
                      to={`/student/lab/${attempt.assessment}`}
                      className="text-[11px] font-bold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Retake Questions</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 text-emerald-900 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Outstanding mastery! All questions in this attempt met or exceeded passing criteria.</span>
          </div>
        )}
      </section>

      {/* 5. Previous Attempts & Score Progression */}
      {pastAttempts.length > 1 && (
        <section className="bg-white rounded-2xl border border-brand-100 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-brand-700" />
              <h2 className="font-bold text-sm text-slate-900">Score Progression Across Attempts</h2>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{pastAttempts.length} Attempts Total</span>
          </div>

          <div className="divide-y divide-slate-100">
            {pastAttempts.map((pa, idx) => (
              <div
                key={pa.id}
                className={`py-3 flex items-center justify-between text-xs ${
                  pa.id === attempt.id ? "bg-brand-50/60 px-3 rounded-xl font-bold" : ""
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-slate-700 font-bold">Attempt #{pa.attempt_number}</span>
                  <span className="text-slate-500">
                    {pa.completed_at
                      ? new Date(pa.completed_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Completed"}
                  </span>
                  {pa.id === attempt.id && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-brand-200 text-brand-900 font-bold">
                      Current View
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-900 text-sm">{pa.percentage}%</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      pa.passed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {pa.passed ? "Passed" : "Did Not Pass"}
                  </span>
                  {pa.id !== attempt.id && (
                    <Link
                      to={`/student/results/${pa.id}`}
                      className="text-[11px] text-brand-700 hover:underline font-bold"
                    >
                      View →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Question Evaluation & Feedback Review */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Question Evaluation & Detailed Rubric Feedback</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review your responses against official criteria, option explanations, and marking rubrics.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                filterType === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All ({attempt.answers?.length || 0})
            </button>
            <button
              onClick={() => setFilterType("incorrect")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                filterType === "incorrect" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              Missed ({attempt.answers?.filter((a: any) => !a.is_correct).length || 0})
            </button>
            <button
              onClick={() => setFilterType("correct")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                filterType === "correct" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              Correct ({attempt.answers?.filter((a: any) => a.is_correct).length || 0})
            </button>
          </div>
        </div>

        {/* Question Cards */}
        <div className="space-y-4 pt-1">
          {filteredAnswers.map((ans: any, idx: number) => {
            const q = ans.question_detail;
            return (
              <div
                key={ans.id}
                className={`p-4 rounded-xl border text-xs space-y-2.5 transition ${
                  ans.is_correct ? "bg-brand-50/30 border-brand-200" : "bg-rose-50/30 border-rose-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Q{idx + 1}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                      {q?.question_type}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800">
                      Topic: {q?.topic_tag || "Fundamentals"}
                    </span>
                  </div>

                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                      ans.is_correct ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {ans.score_awarded} / {q?.marks} pts
                  </span>
                </div>

                <div className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                  {q?.prompt}
                </div>

                {ans.selected_option_text && (
                  <div className="text-slate-700">
                    <span className="font-semibold">Your selection: </span>
                    <span className={ans.is_correct ? "text-emerald-800 font-medium" : "text-rose-800 font-medium"}>
                      {ans.selected_option_text}
                    </span>
                  </div>
                )}

                {ans.written_response && (
                  <div className="text-slate-700 bg-white/80 p-3 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-semibold block text-slate-800">Your written answer:</span>
                    <p className="italic">{ans.written_response}</p>
                  </div>
                )}

                {/* Explanation / Rubric Feedback */}
                <div className="pt-2 border-t border-slate-200/60 text-slate-700 space-y-1">
                  <span className="font-semibold text-slate-800">Instructor Explanation / Rubric:</span>
                  <p className="text-slate-600 leading-relaxed">
                    {ans.feedback || q?.explanation || q?.marking_rubric}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <AITutorDrawer />
    </div>
  );
};
