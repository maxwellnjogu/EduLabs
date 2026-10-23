import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RotateCw,
  Send,
  HelpCircle,
  FileText,
  Layers,
  MoveUp,
  MoveDown,
  GripVertical,
  CheckSquare,
  Square,
  BookOpen,
  Award,
  BookCheck,
} from "lucide-react";
import { CountdownTimer } from "../../components/common/CountdownTimer";

export const StudentLabAreaPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Active section tab
  const [activeSection, setActiveSection] = useState<string>("trivia");

  // Pagination for trivia
  const [currentTriviaIdx, setCurrentTriviaIdx] = useState(0);

  // Student answer state
  // Trivia / MCQ: { [questionId: number]: optionId }
  const [mcqAnswers, setMcqAnswers] = useState<{ [qId: number]: number }>({});
  // Multi-select: { [questionId: number]: number[] }
  const [multiSelectAnswers, setMultiSelectAnswers] = useState<{ [qId: number]: number[] }>({});
  // Fill in blanks: { [questionId: number]: { [blankKey: string]: string } }
  const [fillBlankAnswers, setFillBlankAnswers] = useState<{ [qId: number]: { [key: string]: string } }>({});
  // Written Scenario: { [questionId: number]: string }
  const [writtenAnswers, setWrittenAnswers] = useState<{ [qId: number]: string }>({});
  // Case Study: { [questionId: number]: string }
  const [caseStudyAnswers, setCaseStudyAnswers] = useState<{ [qId: number]: string }>({});
  // Drag & Drop: { [questionId: number]: string[] }
  const [dragDropAnswers, setDragDropAnswers] = useState<{ [qId: number]: string[] }>({});
  // Matching: { [questionId: number]: { [term: string]: string } }
  const [matchingAnswers, setMatchingAnswers] = useState<{ [qId: number]: { [term: string]: string } }>({});

  // Flashcards flipped state
  const [flippedCards, setFlippedCards] = useState<{ [cardId: number]: boolean }>({});

  // Dragging state for HTML5 drag & drop
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const aId = assessmentId ? parseInt(assessmentId) : 1;

  useEffect(() => {
    api.getStudentAssessment(aId)
      .then((res) => {
        setData(res);
        if (res?.questions) {
          const initialDrag: { [qId: number]: string[] } = {};
          res.questions.forEach((q: any) => {
            if (q.question_type === "drag_drop") {
              initialDrag[q.id] = q.drag_items || [
                "Planning",
                "Analysis",
                "Design",
                "Implementation",
                "Testing",
                "Maintenance",
              ];
            }
          });
          setDragDropAnswers(initialDrag);

          // Set initial active section to the first available question type
          const types = res.questions.map((q: any) => q.question_type);
          if (types.includes("trivia") || types.includes("mcq")) setActiveSection("trivia");
          else if (types.includes("multi_select")) setActiveSection("multi_select");
          else if (types.includes("fill_blanks")) setActiveSection("fill_blanks");
          else if (types.includes("flashcard")) setActiveSection("flashcards");
          else if (types.includes("matching")) setActiveSection("matching");
          else if (types.includes("drag_drop")) setActiveSection("drag_drop");
          else if (types.includes("scenario") || types.includes("written")) setActiveSection("scenario");
          else if (types.includes("case_study")) setActiveSection("case_study");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load assessment activities");
        setLoading(false);
      });
  }, [aId]);

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
        <div className="p-5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl space-y-3">
          <div className="font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Assessment Error</span>
          </div>
          <p className="text-xs">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-xs font-bold text-rose-700 underline"
          >
            ← Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { assessment, attempt_id, attempt_number, questions } = data;

  const triviaQuestions = questions.filter((q: any) => q.question_type === "trivia" || q.question_type === "mcq");
  const multiSelectQuestions = questions.filter((q: any) => q.question_type === "multi_select");
  const fillBlankQuestions = questions.filter((q: any) => q.question_type === "fill_blanks");
  const flashcardQuestions = questions.filter((q: any) => q.question_type === "flashcard");
  const matchingQuestions = questions.filter((q: any) => q.question_type === "matching");
  const dragDropQuestions = questions.filter((q: any) => q.question_type === "drag_drop");
  const scenarioQuestions = questions.filter((q: any) => q.question_type === "scenario" || q.question_type === "written");
  const caseStudyQuestions = questions.filter((q: any) => q.question_type === "case_study");

  const currentTrivia = triviaQuestions[currentTriviaIdx];

  // Reorder phase items up or down
  const handleMovePhase = (qId: number, fromIdx: number, toIdx: number) => {
    const list = [...(dragDropAnswers[qId] || [])];
    if (toIdx < 0 || toIdx >= list.length) return;
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);
    setDragDropAnswers({ ...dragDropAnswers, [qId]: list });
  };

  // Drag and drop handlers
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (qId: number, dropIdx: number) => {
    if (draggedIdx === null || draggedIdx === dropIdx) return;
    handleMovePhase(qId, draggedIdx, dropIdx);
    setDraggedIdx(null);
  };

  // Toggle multi-select checkbox
  const handleToggleMultiSelect = (qId: number, optId: number) => {
    const current = multiSelectAnswers[qId] || [];
    const updated = current.includes(optId)
      ? current.filter((id) => id !== optId)
      : [...current, optId];
    setMultiSelectAnswers({ ...multiSelectAnswers, [qId]: updated });
  };

  // Submit all responses to backend for authoritative scoring
  const handleSubmitAttempt = async () => {
    setSubmitting(true);
    const answersPayload: any[] = [];

    // Append Trivia (MCQ)
    for (const q of triviaQuestions) {
      answersPayload.push({
        question_id: q.id,
        selected_option_id: mcqAnswers[q.id] || null,
      });
    }

    // Append Multiple Select
    for (const q of multiSelectQuestions) {
      answersPayload.push({
        question_id: q.id,
        selected_option_ids: multiSelectAnswers[q.id] || [],
      });
    }

    // Append Fill in Blanks
    for (const q of fillBlankQuestions) {
      answersPayload.push({
        question_id: q.id,
        blanks: fillBlankAnswers[q.id] || {},
      });
    }

    // Append Flashcards (marked as reviewed, ungraded unless configured)
    for (const q of flashcardQuestions) {
      answersPayload.push({
        question_id: q.id,
        written_response: "reviewed",
      });
    }

    // Append Drag & Drop
    for (const q of dragDropQuestions) {
      answersPayload.push({
        question_id: q.id,
        ordered_items: dragDropAnswers[q.id] || q.drag_items || [],
      });
    }

    // Append Matching
    for (const q of matchingQuestions) {
      answersPayload.push({
        question_id: q.id,
        matched_pairs: matchingAnswers[q.id] || {},
      });
    }

    // Append Scenario
    for (const q of scenarioQuestions) {
      answersPayload.push({
        question_id: q.id,
        written_response: writtenAnswers[q.id] || "",
      });
    }

    // Append Case Study
    for (const q of caseStudyQuestions) {
      answersPayload.push({
        question_id: q.id,
        written_response: caseStudyAnswers[q.id] || "",
      });
    }

    try {
      const result = await api.submitStudentAttempt(attempt_id, answersPayload);
      navigate(`/student/results/${attempt_id}`, { state: { result } });
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Test Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
              {assessment.unit_code || "COMP101"}
            </span>
            <span className="text-xs text-slate-400">Attempt #{attempt_number}</span>
          </div>
          <h1 className="text-lg font-bold text-white mt-1">{assessment.title}</h1>
          <p className="text-xs text-slate-400">
            Passing threshold: <span className="text-brand-400 font-bold">{assessment.passing_threshold}%</span> • Total Marks: {assessment.total_marks} pts
          </p>
        </div>

        {/* Submit Early button */}
        <button
          onClick={handleSubmitAttempt}
          disabled={submitting}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center space-x-2"
        >
          {submitting ? (
            <span>Evaluating submission...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Finalize & Submit Lab</span>
            </>
          )}
        </button>
      </div>

      {/* Mode Navigation Tabs (Dynamic for published modes) */}
      <div className="flex flex-wrap gap-2 text-xs font-bold">
        {triviaQuestions.length > 0 && (
          <button
            onClick={() => setActiveSection("trivia")}
            className={`px-3.5 py-2.5 rounded-xl border transition flex items-center space-x-2 ${
              activeSection === "trivia"
                ? "bg-blue-50 border-blue-300 text-blue-800 shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Trivia ({triviaQuestions.length})</span>
          </button>
        )}

        {multiSelectQuestions.length > 0 && (
          <button
            onClick={() => setActiveSection("multi_select")}
            className={`px-3.5 py-2.5 rounded-xl border transition flex items-center space-x-2 ${
              activeSection === "multi_select"
                ? "bg-teal-50 border-teal-300 text-teal-800 shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Multi-Select ({multiSelectQuestions.length})</span>
          </button>
        )}

        {fillBlankQuestions.length > 0 && (
          <button
            onClick={() => setActiveSection("fill_blanks")}
            className={`px-3.5 py-2.5 rounded-xl border transition flex items-center space-x-2 ${
              activeSection === "fill_blanks"
                ? "bg-indigo-50 border-indigo-300 text-indigo-800 shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Fill Blanks ({fillBlankQuestions.length})</span>
          </button>
        )}

        {flashcardQuestions.length > 0 && (
          <button
            onClick={() => setActiveSection("flashcards")}
            className={`px-3.5 py-2.5 rounded-xl border transition flex items-center space-x-2 ${
              activeSection === "flashcards"
                ? "bg-purple-50 border-purple-300 text-purple-800 shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Flashcards ({flashcardQuestions.length})</span>
          </button>
        )}

        {matchingQuestions.length > 0 && (
          <button
            onClick={() => setActiveSection("matching")}
            className={`px-3.5 py-2.5 rounded-xl border transition flex items-center space-x-2 ${
              activeSection === "matching"
                ? "bg-cyan-50 border-cyan-300 text-cyan-800 shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Matching Activity</span>
          </button>
        )}

        {dragDropQuestions.length > 0 && (
          <button
            onClick={() => setActiveSection("drag_drop")}
            className={`px-3.5 py-2.5 rounded-xl border transition flex items-center space-x-2 ${
              activeSection === "drag_drop"
                ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Drag & Drop Order</span>
          </button>
        )}

        {scenarioQuestions.length > 0 && (
          <button
            onClick={() => setActiveSection("scenario")}
            className={`px-3.5 py-2.5 rounded-xl border transition flex items-center space-x-2 ${
              activeSection === "scenario"
                ? "bg-amber-50 border-amber-300 text-amber-800 shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Scenario ({scenarioQuestions.length})</span>
          </button>
        )}

        {caseStudyQuestions.length > 0 && (
          <button
            onClick={() => setActiveSection("case_study")}
            className={`px-3.5 py-2.5 rounded-xl border transition flex items-center space-x-2 ${
              activeSection === "case_study"
                ? "bg-rose-50 border-rose-300 text-rose-800 shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Case Study ({caseStudyQuestions.length})</span>
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* 1. TRIVIA (MCQs) */}
      {/* ======================================================== */}
      {activeSection === "trivia" && currentTrivia && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                Question {currentTriviaIdx + 1} of {triviaQuestions.length}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Topic: {currentTrivia.topic_tag || 'SDLC'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                {currentTrivia.marks} Mark
              </span>
            </div>

            {currentTrivia.timer_seconds > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Timer:</span>
                <CountdownTimer
                  key={`timer-${currentTrivia.id}`}
                  secondsRemaining={currentTrivia.timer_seconds}
                />
              </div>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-900 leading-snug">{currentTrivia.prompt}</h3>

          <div className="space-y-2.5 pt-2">
            {currentTrivia.options?.map((opt: any) => {
              const isSelected = mcqAnswers[currentTrivia.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setMcqAnswers({ ...mcqAnswers, [currentTrivia.id]: opt.id })}
                  className={`w-full text-left p-4 rounded-xl border text-xs font-medium transition flex items-center justify-between ${
                    isSelected
                      ? "bg-blue-50 border-blue-500 text-blue-900 font-bold ring-2 ring-blue-500/20"
                      : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/80 text-slate-800"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                      isSelected ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-300 text-slate-500"
                    }`}>
                      {String.fromCharCode(64 + opt.order)}
                    </span>
                    <span>{opt.option_text}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Question Palette / Direct Numbered Navigation */}
          {triviaQuestions.length > 1 && (
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Question Palette ({Object.keys(mcqAnswers).length} of {triviaQuestions.length} answered)
                </span>
                <span className="text-[10px] text-slate-400">Click any number to jump directly</span>
              </div>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50/80 rounded-xl border border-slate-200">
                {triviaQuestions.map((q: any, idx: number) => {
                  const isCurrent = currentTriviaIdx === idx;
                  const isAnswered = mcqAnswers[q.id] !== undefined;
                  return (
                    <button
                      key={q.id || idx}
                      type="button"
                      onClick={() => setCurrentTriviaIdx(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                        isCurrent
                          ? "bg-blue-600 text-white ring-2 ring-blue-500/40 shadow-sm"
                          : isAnswered
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                      title={`Question ${idx + 1}: ${q.prompt?.slice(0, 45)}...`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentTriviaIdx((p) => Math.max(0, p - 1))}
              disabled={currentTriviaIdx === 0}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-40 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Question</span>
            </button>

            {currentTriviaIdx < triviaQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentTriviaIdx((p) => p + 1)}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1 shadow-sm"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  if (multiSelectQuestions.length > 0) setActiveSection("multi_select");
                  else if (fillBlankQuestions.length > 0) setActiveSection("fill_blanks");
                  else if (flashcardQuestions.length > 0) setActiveSection("flashcards");
                  else {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }
                }}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1 shadow-sm"
              >
                <span>Proceed to Review & Submit</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MULTIPLE-SELECT QUESTIONS */}
      {/* ======================================================== */}
      {activeSection === "multi_select" && multiSelectQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-xs text-teal-900 flex items-center justify-between">
            <span className="font-semibold">
              Multiple-Select Questions: Select all choices that apply. Partial credit is awarded for correct selections.
            </span>
            <span className="font-bold text-teal-800">{multiSelectQuestions.length} Questions</span>
          </div>

          {multiSelectQuestions.map((q: any, qIdx: number) => {
            const selectedOpts = multiSelectAnswers[q.id] || [];

            return (
              <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Question #{qIdx + 1}</span>
                    <span className="font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px]">
                      Select All That Apply
                    </span>
                    <span className="font-semibold text-slate-600">{q.marks} Marks</span>
                  </div>
                  {q.timer_seconds > 0 && (
                    <span className="text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {q.timer_seconds}s
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{q.prompt}</h3>

                <div className="space-y-2 pt-1">
                  {q.options?.map((opt: any) => {
                    const isChecked = selectedOpts.includes(opt.id);

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleToggleMultiSelect(q.id, opt.id)}
                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                          isChecked
                            ? "bg-teal-50/70 border-teal-500 text-teal-950 font-semibold ring-1 ring-teal-500/30"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                            isChecked ? "bg-teal-600 border-teal-600 text-white" : "bg-white border-slate-300"
                          }`}>
                            {isChecked && <CheckCircle2 className="w-4 h-4" />}
                          </div>
                          <span>{opt.option_text}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. FILL IN THE BLANKS */}
      {/* ======================================================== */}
      {activeSection === "fill_blanks" && fillBlankQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-900 flex items-center justify-between">
            <span className="font-semibold">
              Fill in the Blanks: Type the missing engineering or lifecycle terminology into the input fields below.
            </span>
            <span className="font-bold text-indigo-800">{fillBlankQuestions.length} Questions</span>
          </div>

          {fillBlankQuestions.map((q: any, qIdx: number) => {
            const currentBlanks = fillBlankAnswers[q.id] || {};

            return (
              <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Question #{qIdx + 1}</span>
                    <span className="font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px]">
                      Terminology Completion
                    </span>
                    <span className="font-semibold text-slate-600">{q.marks} Marks</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{q.prompt}</h3>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    Your Terminology Answer:
                  </label>
                  <input
                    type="text"
                    value={currentBlanks["blank_1"] || ""}
                    onChange={(e) =>
                      setFillBlankAnswers({
                        ...fillBlankAnswers,
                        [q.id]: { ...currentBlanks, blank_1: e.target.value },
                      })
                    }
                    placeholder="Enter missing term (e.g. Planning, Requirements Analysis, Testing)..."
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. FLASHCARDS (Ungraded revision by default) */}
      {/* ======================================================== */}
      {activeSection === "flashcards" && flashcardQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs text-purple-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="font-semibold">
              Flashcard Revision: Click or tap any card to reveal its answer. This is an ungraded revision activity designed to reinforce your technical knowledge.
            </span>
            <span className="font-bold text-purple-700 whitespace-nowrap">{flashcardQuestions.length} Cards in Set</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {flashcardQuestions.map((fc: any, idx: number) => {
              const isFlipped = flippedCards[fc.id] || false;
              return (
                <div
                  key={fc.id}
                  onClick={() => setFlippedCards({ ...flippedCards, [fc.id]: !isFlipped })}
                  className="cursor-pointer perspective-1000 min-h-[220px] group"
                >
                  <div
                    className={`relative w-full h-full rounded-2xl p-5 transition-all duration-500 shadow-sm border flex flex-col justify-between ${
                      isFlipped
                        ? "bg-gradient-to-br from-purple-800 to-indigo-950 text-white border-purple-700"
                        : "bg-white text-slate-900 border-slate-200 hover:border-purple-300"
                    }`}
                  >
                    {!isFlipped ? (
                      <div className="flex flex-col justify-between h-full">
                        <div>
                          <div className="flex items-center justify-between text-xs text-purple-600 font-bold mb-2">
                            <span>Card #{idx + 1} (Question)</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-medium">
                              SDLC Concept
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">{fc.prompt}</h4>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-4 border-t border-slate-100">
                          <RotateCw className="w-3.5 h-3.5 text-purple-500" />
                          <span>Tap card to reveal answer</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col justify-between h-full">
                        <div>
                          <div className="flex items-center justify-between text-xs text-purple-300 font-bold mb-2">
                            <span>Card #{idx + 1} (Answer)</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700">
                              Verified
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed text-purple-50 font-medium">
                            {fc.explanation || "Define project goals, scope, cost and timeline."}
                          </p>
                        </div>
                        <div className="text-[10px] text-purple-300 flex items-center gap-1.5 pt-4 border-t border-purple-700/50">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Click to flip back to question</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MATCHING EXERCISE */}
      {/* ======================================================== */}
      {activeSection === "matching" && matchingQuestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-cyan-100 text-cyan-800">
                Matching Exercise
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-2">
                Match each SDLC phase to its primary engineering purpose
              </h3>
            </div>

            {matchingQuestions[0].timer_seconds > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Timer:</span>
                <CountdownTimer
                  key={`matching-timer-${matchingQuestions[0].id}`}
                  secondsRemaining={matchingQuestions[0].timer_seconds}
                />
              </div>
            )}
          </div>

          <div className="space-y-3.5">
            {(matchingQuestions[0].matching_terms || [
              "Planning",
              "Analysis",
              "Design",
              "Implementation",
              "Testing",
              "Maintenance",
            ]).map((term: string, idx: number) => {
              const currentMatches = matchingAnswers[matchingQuestions[0].id] || {};
              const selectedDef = currentMatches[term] || "";
              const defOptions = matchingQuestions[0].matching_definitions || [
                "Define project goals, feasibility, schedule, and budgetary boundaries",
                "Gather, document, and validate functional and non-functional requirements",
                "Create software architecture, data schemas, and UI wireframes",
                "Write source code, unit tests, and build system components",
                "Validate defect-free software functionality and user acceptance",
                "Apply bug fixes, performance monitoring, and enhancement updates",
              ];

              return (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="font-bold text-xs text-slate-800 md:w-1/3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span>{term}</span>
                  </div>
                  <div className="md:w-2/3">
                    <select
                      value={selectedDef}
                      onChange={(e) => {
                        const updated = { ...currentMatches, [term]: e.target.value };
                        setMatchingAnswers({ ...matchingAnswers, [matchingQuestions[0].id]: updated });
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                    >
                      <option value="">-- Select matching purpose --</option>
                      {defOptions.map((opt: string, optIdx: number) => (
                        <option key={optIdx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. DRAG & DROP: ORDER SDLC PHASES */}
      {/* ======================================================== */}
      {activeSection === "drag_drop" && dragDropQuestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
                Phase Ordering Interaction
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {dragDropQuestions[0].marks} Marks
              </span>
            </div>

            {dragDropQuestions[0].timer_seconds > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Timer:</span>
                <CountdownTimer
                  key={`dragdrop-timer-${dragDropQuestions[0].id}`}
                  secondsRemaining={dragDropQuestions[0].timer_seconds}
                />
              </div>
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {dragDropQuestions[0].prompt || "Arrange these six phases in the correct sequential order from first to last."}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Use the Up (↑) / Down (↓) buttons or drag cards directly to position the phases in correct order.
            </p>
          </div>

          <div className="space-y-2.5 max-w-xl mx-auto py-2">
            {(dragDropAnswers[dragDropQuestions[0].id] || dragDropQuestions[0].drag_items || []).map(
              (phaseName: string, pIdx: number) => {
                const totalItems = (dragDropAnswers[dragDropQuestions[0].id] || dragDropQuestions[0].drag_items || []).length;
                return (
                  <div
                    key={phaseName}
                    draggable
                    onDragStart={() => handleDragStart(pIdx)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(dragDropQuestions[0].id, pIdx)}
                    className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-xl transition shadow-sm select-none cursor-move group"
                  >
                    <div className="flex items-center space-x-3">
                      <GripVertical className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                        {pIdx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{phaseName}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleMovePhase(dragDropQuestions[0].id, pIdx, pIdx - 1)}
                        disabled={pIdx === 0}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 text-slate-700"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePhase(dragDropQuestions[0].id, pIdx, pIdx + 1)}
                        disabled={pIdx === totalItems - 1}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 text-slate-700"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. WHAT WOULD YOU DO? SCENARIO */}
      {/* ======================================================== */}
      {activeSection === "scenario" && scenarioQuestions.length > 0 && (
        <div className="space-y-4">
          {scenarioQuestions.map((sc: any, scIdx: number) => (
            <div key={sc.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">
                    What Would You Do? Scenario #{scIdx + 1}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    {sc.marks} Marks
                  </span>
                </div>

                {sc.timer_seconds > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Timer:</span>
                    <CountdownTimer
                      key={`written-timer-${sc.id}`}
                      secondsRemaining={sc.timer_seconds}
                    />
                  </div>
                )}
              </div>

              <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs text-amber-950 space-y-1.5">
                <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px] block">Scenario Context:</span>
                <p className="leading-relaxed font-medium">
                  “A university wants a system that allows students to borrow books and check return dates. Before coding starts, the development team meets the librarian to understand the requirements.”
                </p>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {sc.prompt}
              </h3>

              <div>
                <textarea
                  rows={4}
                  value={writtenAnswers[sc.id] || ""}
                  onChange={(e) =>
                    setWrittenAnswers({ ...writtenAnswers, [sc.id]: e.target.value })
                  }
                  placeholder="State the phase and explain why the team is performing this activity..."
                  className="w-full p-3.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans leading-relaxed"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Marking Criterion: Technical justification conforming to SDLC principles.</span>
                  <span>Words: {(writtenAnswers[sc.id] || "").split(/\s+/).filter(Boolean).length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. CASE STUDY ANALYSIS */}
      {/* ======================================================== */}
      {activeSection === "case_study" && caseStudyQuestions.length > 0 && (
        <div className="space-y-4">
          {caseStudyQuestions.map((cs: any, csIdx: number) => (
            <div key={cs.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">
                    Case Study Analysis #{csIdx + 1}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    {cs.marks} Marks
                  </span>
                </div>

                {cs.timer_seconds > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Timer:</span>
                    <CountdownTimer
                      key={`case-timer-${cs.id}`}
                      secondsRemaining={cs.timer_seconds}
                    />
                  </div>
                )}
              </div>

              {cs.case_description && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1.5">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                    Enterprise Case Background: {cs.case_title || "Legacy System Migration"}
                  </span>
                  <p className="leading-relaxed">{cs.case_description}</p>
                </div>
              )}

              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {cs.prompt}
              </h3>

              <div>
                <textarea
                  rows={5}
                  value={caseStudyAnswers[cs.id] || ""}
                  onChange={(e) =>
                    setCaseStudyAnswers({ ...caseStudyAnswers, [cs.id]: e.target.value })
                  }
                  placeholder="Provide structured analysis identifying architectural risks, phase breakdown, and verification strategy..."
                  className="w-full p-3.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-sans leading-relaxed"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Marking Criterion: Architectural depth, risk mitigation, and lifecycle phase mapping.</span>
                  <span>Words: {(caseStudyAnswers[cs.id] || "").split(/\s+/).filter(Boolean).length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Global Bottom Submit Panel */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Ready to complete your assessment?</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Your responses will be evaluated authoritatively by the EduLabs grading engine.
          </p>
        </div>

        <button
          onClick={handleSubmitAttempt}
          disabled={submitting}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {submitting ? (
            <span>Grading submission...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Finalize & Submit Lab</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
