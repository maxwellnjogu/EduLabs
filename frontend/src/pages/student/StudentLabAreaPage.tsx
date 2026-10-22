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
} from "lucide-react";
import { CountdownTimer } from "../../components/common/CountdownTimer";

export const StudentLabAreaPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Active section
  const [activeSection, setActiveSection] = useState<"quiz" | "flashcards" | "written" | "drag_drop" | "matching">("quiz");
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [currentWrittenIdx, setCurrentWrittenIdx] = useState(0);

  // Student answer state
  // MCQs: { [questionId: number]: optionId }
  const [mcqAnswers, setMcqAnswers] = useState<{ [qId: number]: number }>({});
  // Written: { [questionId: number]: string }
  const [writtenAnswers, setWrittenAnswers] = useState<{ [qId: number]: string }>({});
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
        // Initialize drag-drop phase orders from backend shuffled items
        if (res?.questions) {
          const initialDrag: { [qId: number]: string[] } = {};
          res.questions.forEach((q: any) => {
            if (q.question_type === "drag_drop") {
              initialDrag[q.id] = q.drag_items || [
                "Design",
                "Maintenance",
                "Planning",
                "Testing",
                "Analysis",
                "Implementation",
              ];
            }
          });
          setDragDropAnswers(initialDrag);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load assessment questions");
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
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const { assessment, attempt_id, attempt_number, questions } = data;

  const mcqQuestions = questions.filter((q: any) => q.question_type === "mcq");
  const flashcardQuestions = questions.filter((q: any) => q.question_type === "flashcard");
  const writtenQuestions = questions.filter((q: any) => q.question_type === "written");
  const dragDropQuestions = questions.filter((q: any) => q.question_type === "drag_drop");
  const matchingQuestions = questions.filter((q: any) => q.question_type === "matching");

  // Timer expiry handler for individual quiz questions (15s)
  const handleQuizTimerExpire = () => {
    if (currentQuizIdx < mcqQuestions.length - 1) {
      setCurrentQuizIdx((prev) => prev + 1);
    } else {
      if (flashcardQuestions.length > 0) setActiveSection("flashcards");
      else if (writtenQuestions.length > 0) setActiveSection("written");
      else if (dragDropQuestions.length > 0) setActiveSection("drag_drop");
      else if (matchingQuestions.length > 0) setActiveSection("matching");
    }
  };

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

  // Submit all responses to backend for authoritative scoring
  const handleSubmitAttempt = async () => {
    setSubmitting(true);
    const answersPayload: any[] = [];

    // Append MCQs (Trivia)
    for (const q of mcqQuestions) {
      answersPayload.push({
        question_id: q.id,
        selected_option_id: mcqAnswers[q.id] || null,
      });
    }

    // Append Flashcards
    for (const q of flashcardQuestions) {
      answersPayload.push({
        question_id: q.id,
        written_response: "reviewed",
      });
    }

    // Append Written (Scenario)
    for (const q of writtenQuestions) {
      answersPayload.push({
        question_id: q.id,
        written_response: writtenAnswers[q.id] || "",
      });
    }

    // Append Drag & Drop (Phase ordering)
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

    try {
      const result = await api.submitStudentAttempt(attempt_id, answersPayload);
      navigate(`/student/results/${attempt_id}`, { state: { result } });
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
      setSubmitting(false);
    }
  };

  const currentMcq = mcqQuestions[currentQuizIdx];
  const currentWritten = writtenQuestions[currentWrittenIdx];
  const currentDragDrop = dragDropQuestions[0];

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

        {/* Finish / Submit Early button */}
        <button
          onClick={handleSubmitAttempt}
          disabled={submitting}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center space-x-2"
        >
          {submitting ? (
            <span>Evaluating authoritatively...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Finalize & Submit Lab</span>
            </>
          )}
        </button>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-bold">
        {mcqQuestions.length > 0 && (
          <button
            onClick={() => setActiveSection("quiz")}
            className={`px-3.5 py-2.5 rounded-xl border transition flex items-center space-x-2 ${
              activeSection === "quiz"
                ? "bg-blue-50 border-blue-300 text-blue-800 shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Trivia ({mcqQuestions.length} MCQs)</span>
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

        {writtenQuestions.length > 0 && (
          <button
            onClick={() => setActiveSection("written")}
            className={`px-3.5 py-2.5 rounded-xl border transition flex items-center space-x-2 ${
              activeSection === "written"
                ? "bg-amber-50 border-amber-300 text-amber-800 shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Scenario ({writtenQuestions.length})</span>
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
            <span>Drag & Drop Ordering</span>
          </button>
        )}

        {matchingQuestions.length > 0 && (
          <button
            onClick={() => setActiveSection("matching")}
            className={`px-3.5 py-2.5 rounded-xl border transition flex items-center space-x-2 ${
              activeSection === "matching"
                ? "bg-indigo-50 border-indigo-300 text-indigo-800 shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Matching Activity</span>
          </button>
        )}
      </div>

      {/* SECTION 1: TRIVIA EXERCISE (5 MCQs, 15s Timer, 1 Mark each) */}
      {activeSection === "quiz" && currentMcq && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                Question {currentQuizIdx + 1} of {mcqQuestions.length}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Topic: {currentMcq.topic_tag}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                {currentMcq.marks} Mark
              </span>
            </div>

            {/* 15 Seconds Countdown Timer per question */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Question Timer:</span>
              <CountdownTimer
                key={`timer-${currentMcq.id}`}
                secondsRemaining={currentMcq.timer_seconds || 15}
                onExpire={handleQuizTimerExpire}
              />
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-900 leading-snug">{currentMcq.prompt}</h3>

          {/* Options */}
          <div className="space-y-2.5 pt-2">
            {currentMcq.options?.map((opt: any) => {
              const isSelected = mcqAnswers[currentMcq.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setMcqAnswers({ ...mcqAnswers, [currentMcq.id]: opt.id })}
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

          {/* Quiz Navigation */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentQuizIdx((p) => Math.max(0, p - 1))}
              disabled={currentQuizIdx === 0}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-40 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Question</span>
            </button>

            {currentQuizIdx < mcqQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentQuizIdx((p) => p + 1)}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1 shadow-sm"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  if (flashcardQuestions.length > 0) setActiveSection("flashcards");
                  else if (writtenQuestions.length > 0) setActiveSection("written");
                  else if (dragDropQuestions.length > 0) setActiveSection("drag_drop");
                  else if (matchingQuestions.length > 0) setActiveSection("matching");
                }}
                className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center gap-1 shadow-sm"
              >
                <span>Proceed to Flashcards</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: FLASHCARDS (3 Cards, Reveal-on-click, 0 Marks towards score) */}
      {activeSection === "flashcards" && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs text-purple-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="font-semibold">
              Flashcard Revision: Click or tap any card to reveal its answer. This is a learning activity to reinforce your understanding.
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
                    className={`relative w-full h-full rounded-2xl p-5 transition-all duration-500 transform-style-3d shadow-sm border flex flex-col justify-between ${
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

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                if (writtenQuestions.length > 0) setActiveSection("written");
                else if (dragDropQuestions.length > 0) setActiveSection("drag_drop");
                else if (matchingQuestions.length > 0) setActiveSection("matching");
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <span>Proceed to Scenario</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SECTION 3: WHAT WOULD YOU DO? SCENARIO (25s Timer, Text Response) */}
      {activeSection === "written" && currentWritten && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                What Would You Do? Scenario ({currentWrittenIdx + 1} of {writtenQuestions.length})
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                {currentWritten.marks} Marks
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Timer:</span>
              <CountdownTimer
                key={`written-timer-${currentWritten.id}`}
                secondsRemaining={currentWritten.timer_seconds || 25}
              />
            </div>
          </div>

          {/* Scenario Text */}
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-amber-950 space-y-1.5">
            <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px] block">Scenario:</span>
            <p className="leading-relaxed font-medium">
              “A university wants a system that allows students to borrow books and check return dates. Before coding starts, the development team meets the librarian to understand the requirements.”
            </p>
          </div>

          <h3 className="text-sm font-bold text-slate-900 leading-snug">
            {currentWritten.prompt}
          </h3>

          {/* Textarea Dialogue Box */}
          <div>
            <textarea
              rows={4}
              value={writtenAnswers[currentWritten.id] || ""}
              onChange={(e) =>
                setWrittenAnswers({ ...writtenAnswers, [currentWritten.id]: e.target.value })
              }
              placeholder="State the phase and explain why the team is performing this activity..."
              className="w-full p-3.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-sans leading-relaxed"
            ></textarea>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>Expected: Analysis or requirements gathering phase identification with explanation.</span>
              <span>Words: {(writtenAnswers[currentWritten.id] || "").split(/\s+/).filter(Boolean).length}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setActiveSection("flashcards")}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Flashcards</span>
            </button>

            <button
              onClick={() => {
                if (dragDropQuestions.length > 0) setActiveSection("drag_drop");
                else if (matchingQuestions.length > 0) setActiveSection("matching");
              }}
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1 shadow-sm"
            >
              <span>Proceed to Phase Ordering</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SECTION 4: DRAG & DROP: ORDER THE SDLC PHASES (20s Timer, 3 Marks) */}
      {activeSection === "drag_drop" && currentDragDrop && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
                Phase Ordering Interaction
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {currentDragDrop.marks} Marks
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Timer:</span>
              <CountdownTimer
                key={`dragdrop-timer-${currentDragDrop.id}`}
                secondsRemaining={currentDragDrop.timer_seconds || 20}
              />
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {currentDragDrop.prompt || "Arrange these six phases in the correct sequential order from first to last."}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Use the <span className="font-semibold text-slate-700">Up (↑) / Down (↓)</span> buttons or drag cards directly to position the phases in correct order.
            </p>
          </div>

          {/* Reorderable phase list */}
          <div className="space-y-2.5 max-w-xl mx-auto py-2">
            {(dragDropAnswers[currentDragDrop.id] || currentDragDrop.drag_items || []).map(
              (phaseName: string, pIdx: number) => {
                const totalItems = (dragDropAnswers[currentDragDrop.id] || currentDragDrop.drag_items || []).length;
                return (
                  <div
                    key={phaseName}
                    draggable
                    onDragStart={() => handleDragStart(pIdx)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(currentDragDrop.id, pIdx)}
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
                        onClick={() => handleMovePhase(currentDragDrop.id, pIdx, pIdx - 1)}
                        disabled={pIdx === 0}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 text-slate-700"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePhase(currentDragDrop.id, pIdx, pIdx + 1)}
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

          {/* Sequence Preview */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-600">
            <span className="font-bold text-slate-700 block mb-1">Current Sequence:</span>
            <div className="flex flex-wrap items-center justify-center gap-1 font-semibold text-emerald-800">
              {(dragDropAnswers[currentDragDrop.id] || currentDragDrop.drag_items || []).map(
                (p: string, i: number, arr: string[]) => (
                  <React.Fragment key={p}>
                    <span>{p}</span>
                    {i < arr.length - 1 && <span className="text-slate-400">→</span>}
                  </React.Fragment>
                )
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setActiveSection("written")}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Scenario</span>
            </button>

            {matchingQuestions.length > 0 ? (
              <button
                onClick={() => setActiveSection("matching")}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-1 shadow-sm"
              >
                <span>Proceed to Matching Exercise</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitAttempt}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? "Grading Lab..." : "Finalize & Submit Lab"}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* SECTION 5: MATCHING EXERCISE (Only shown if matching mode selected) */}
      {activeSection === "matching" && matchingQuestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-indigo-100 text-indigo-800">
                Matching Exercise
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-2">
                Match each SDLC phase to its primary purpose
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select the corresponding definition from the dropdown for each phase.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Timer:</span>
              <CountdownTimer
                key={`matching-timer-${matchingQuestions[0].id}`}
                secondsRemaining={matchingQuestions[0].timer_seconds || 30}
              />
            </div>
          </div>

          <div className="space-y-3.5">
            {matchingQuestions[0].matching_pairs?.map((pair: any, idx: number) => {
              const currentMatches = matchingAnswers[matchingQuestions[0].id] || {};
              const selectedDef = currentMatches[pair.term] || "";

              return (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="font-bold text-xs text-slate-800 md:w-1/3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span>{pair.term}</span>
                  </div>
                  <div className="md:w-2/3">
                    <select
                      value={selectedDef}
                      onChange={(e) => {
                        const updated = { ...currentMatches, [pair.term]: e.target.value };
                        setMatchingAnswers({ ...matchingAnswers, [matchingQuestions[0].id]: updated });
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Select matching purpose --</option>
                      {matchingQuestions[0].matching_pairs.map((opt: any, optIdx: number) => (
                        <option key={optIdx} value={opt.definition}>
                          {opt.definition}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Final Submit Callout */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs text-slate-500">
              All prepared SDLC activities completed. Authoritative scoring will evaluate your attempt.
            </span>
            <button
              onClick={handleSubmitAttempt}
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-600/20 transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <span>Grading Lab...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Lab Answers</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
