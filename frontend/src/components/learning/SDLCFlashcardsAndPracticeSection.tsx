import React, { useState } from "react";
import {
  RotateCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Layers,
  Award,
} from "lucide-react";

export interface PracticeQuestionItem {
  id: number;
  prompt: string;
  topic?: string;
  options: Array<{ key: string; text: string }>;
  correct_answer?: string;
  explanation?: string;
  order?: number;
  status?: string;
}

export interface FlashcardItem {
  id?: number | string;
  prompt: string;
  explanation: string;
  topic_tag?: string;
  marks?: number;
  timer_seconds?: number;
}

export const DEFAULT_SDLC_FLASHCARDS: FlashcardItem[] = [
  {
    id: 1,
    prompt: "What does SDLC stand for?",
    explanation: "Software Development Life Cycle.",
    topic_tag: "SDLC Fundamentals",
  },
  {
    id: 2,
    prompt: "What is the purpose of the Planning phase?",
    explanation: "Define project goals, scope, feasibility, costs, and timeline.",
    topic_tag: "Planning",
  },
  {
    id: 3,
    prompt: "What happens during Requirements Analysis?",
    explanation: "Gather and finalize requirements with users and stakeholders.",
    topic_tag: "Requirements Analysis",
  },
  {
    id: 4,
    prompt: "What is the main characteristic of Waterfall?",
    explanation: "Phases are completed sequentially.",
    topic_tag: "Waterfall Model",
  },
  {
    id: 5,
    prompt: "What is a Scrum sprint?",
    explanation: "A timeboxed period for delivering a defined increment.",
    topic_tag: "Scrum Framework",
  },
];

export const DEFAULT_SDLC_PRACTICE_QUESTIONS: PracticeQuestionItem[] = [
  {
    id: 1,
    prompt: "Which activity belongs to the Analysis phase?",
    topic: "Requirements Analysis",
    options: [
      { key: "A", text: "Writing application code" },
      { key: "B", text: "Gathering and finalizing user requirements" },
      { key: "C", text: "Deploying the application" },
      { key: "D", text: "Fixing production bugs" },
    ],
    correct_answer: "B",
    explanation: "Analysis focuses on understanding and documenting stakeholder requirements.",
  },
  {
    id: 2,
    prompt: "What is the main purpose of software testing?",
    topic: "Software Testing",
    options: [
      { key: "A", text: "To define the project budget" },
      { key: "B", text: "To choose the system architecture" },
      { key: "C", text: "To identify defects and verify expected behavior" },
      { key: "D", text: "To train end-users" },
    ],
    correct_answer: "C",
    explanation: "Testing validates that the system fulfills specifications and finds defects before live deployment.",
  },
  {
    id: 3,
    prompt: "Which statement best describes the Waterfall model?",
    topic: "Waterfall Model",
    options: [
      { key: "A", text: "Work proceeds through sequential phases" },
      { key: "B", text: "Requirements are never documented" },
      { key: "C", text: "Every task must be completed by a different company" },
      { key: "D", text: "Testing happens only after maintenance" },
    ],
    correct_answer: "A",
    explanation: "Waterfall organizes development into distinct sequential phases where each phase must be finished before the next starts.",
  },
];

interface Props {
  questions?: PracticeQuestionItem[];
  flashcards?: FlashcardItem[];
  className?: string;
  activeView?: "both" | "flashcards" | "practice";
}

export const SDLCFlashcardsAndPracticeSection: React.FC<Props> = ({
  questions = [],
  flashcards = [],
  className = "",
  activeView = "both",
}) => {
  // Flashcards state
  const defaultFlashcards: FlashcardItem[] =
    flashcards && flashcards.length > 0 ? flashcards : DEFAULT_SDLC_FLASHCARDS;

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const toggleFlip = (index: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handlePrevCard = () => {
    setActiveCardIndex((prev) => (prev > 0 ? prev - 1 : defaultFlashcards.length - 1));
  };

  const handleNextCard = () => {
    setActiveCardIndex((prev) => (prev < defaultFlashcards.length - 1 ? prev + 1 : 0));
  };

  // Practice Questions state
  const effectiveQuestions: PracticeQuestionItem[] =
    questions && questions.length > 0 ? questions : DEFAULT_SDLC_PRACTICE_QUESTIONS;

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({});

  const activeQuestion = effectiveQuestions[activeQuestionIndex] || effectiveQuestions[0];

  const handleSelectOption = (qId: number, val: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: val,
    }));
  };

  const handleCheckAnswer = (qId: number) => {
    if (!selectedAnswers[qId]) return;
    setSubmittedAnswers((prev) => ({
      ...prev,
      [qId]: true,
    }));
  };

  const handleRetry = (qId: number) => {
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
    setSubmittedAnswers((prev) => ({
      ...prev,
      [qId]: false,
    }));
  };

  // Calculated practice score
  const correctCount = effectiveQuestions.reduce((acc, q) => {
    if (
      submittedAnswers[q.id] &&
      selectedAnswers[q.id]?.toUpperCase() === q.correct_answer?.toUpperCase()
    ) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const attemptedCount = effectiveQuestions.reduce((acc, q) => {
    if (submittedAnswers[q.id]) return acc + 1;
    return acc;
  }, 0);

  const showFlashcards = activeView === "both" || activeView === "flashcards";
  const showPractice = activeView === "both" || activeView === "practice";

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Responsive layout: Desktop side-by-side if both, or single column if one */}
      <div
        className={
          activeView === "both"
            ? "grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
            : "max-w-4xl mx-auto"
        }
      >
        {/* ======================================================== */}
        {/* SECTION 1: SDLC FLASHCARDS                               */}
        {/* ======================================================== */}
        {showFlashcards && (
          <section
            aria-labelledby="sdlc-flashcards-heading"
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3
                      id="sdlc-flashcards-heading"
                      className="text-base font-extrabold text-slate-900"
                    >
                      SDLC Flashcards
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Self-study concept deck • 0 marks towards lab score (Ungraded Revision)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                    Card {activeCardIndex + 1} of {defaultFlashcards.length}
                  </span>
                </div>
              </div>

              {/* Flashcard Area (Click / Keydown to flip) */}
              <div className="mt-4">
                {defaultFlashcards.length > 0 && (
                  (() => {
                    const card = defaultFlashcards[activeCardIndex];
                    const isFlipped = Boolean(flippedCards[activeCardIndex]);

                    return (
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={`Flashcard ${activeCardIndex + 1}: ${card.prompt}. Press Space or Enter to flip.`}
                        onClick={() => toggleFlip(activeCardIndex)}
                        onKeyDown={(e) => {
                          if (e.key === " " || e.key === "Enter") {
                            e.preventDefault();
                            toggleFlip(activeCardIndex);
                          }
                        }}
                        className="cursor-pointer group select-none focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-2xl"
                      >
                        <div
                          className={`min-h-[240px] p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between border ${
                            isFlipped
                              ? "bg-gradient-to-br from-purple-900 via-indigo-950 to-purple-950 text-white border-purple-800 shadow-md"
                              : "bg-gradient-to-br from-purple-50/60 via-white to-slate-50 text-slate-900 border-purple-200 hover:border-purple-400 shadow-xs"
                          }`}
                        >
                          {/* Card Header */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                isFlipped
                                  ? "bg-purple-800/80 text-purple-200"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {card.topic_tag || "SDLC Concept"}
                            </span>
                            <span
                              className={`text-xs font-semibold ${
                                isFlipped ? "text-purple-300" : "text-slate-400"
                              }`}
                            >
                              {isFlipped ? "Answer" : "Question"}
                            </span>
                          </div>

                          {/* Card Body */}
                          <div className="my-auto py-4 text-center">
                            {isFlipped ? (
                              <div className="space-y-2">
                                <p className="text-xs uppercase tracking-wider text-purple-300 font-bold">
                                  Explanation / Definition
                                </p>
                                <p className="text-sm sm:text-base font-medium text-purple-50 leading-relaxed max-w-md mx-auto">
                                  {card.explanation}
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                                  Concept Question
                                </p>
                                <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug max-w-md mx-auto">
                                  {card.prompt}
                                </h4>
                              </div>
                            )}
                          </div>

                          {/* Card Footer */}
                          <div
                            className={`pt-3 border-t flex items-center justify-between text-[11px] ${
                              isFlipped
                                ? "border-purple-800/60 text-purple-300"
                                : "border-purple-100 text-purple-700"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-semibold">
                              <RotateCw
                                className={`w-3.5 h-3.5 transition-transform group-hover:rotate-180 duration-500 ${
                                  isFlipped ? "text-purple-300" : "text-purple-600"
                                }`}
                              />
                              <span>{isFlipped ? "Click to view question" : "Click to reveal answer"}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Press Enter or Space
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>

            {/* Stepper Controls for Flashcards */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={handlePrevCard}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 transition"
                aria-label="Previous Flashcard"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              {/* Flashcard dots */}
              <div className="flex items-center gap-1.5">
                {defaultFlashcards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveCardIndex(i)}
                    aria-label={`Go to flashcard ${i + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      activeCardIndex === i
                        ? "bg-purple-600 w-5"
                        : "bg-slate-200 hover:bg-purple-300"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextCard}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 transition"
                aria-label="Next Flashcard"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* SECTION 2: QUICK PRACTICE QUESTIONS                      */}
        {/* ======================================================== */}
        {showPractice && (
          <section
            aria-labelledby="quick-practice-heading"
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3
                      id="quick-practice-heading"
                      className="text-base font-extrabold text-slate-900"
                    >
                      Quick Practice Questions
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Test comprehension • Dropdown checks with immediate feedback
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                    Question {activeQuestionIndex + 1} of {effectiveQuestions.length}
                  </span>
                </div>
              </div>

              {/* Questions Content */}
              {activeQuestion && (
                <div className="mt-4 space-y-4">
                  {/* Question header info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                        Q{activeQuestionIndex + 1}
                      </span>
                      {activeQuestion.topic && (
                        <span className="text-[11px] text-slate-500 font-semibold">
                          Topic: {activeQuestion.topic}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {activeQuestion.prompt}
                    </h4>
                  </div>

                  {/* Dropdown selection */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`dropdown-q-${activeQuestion.id}`}
                      className="block text-xs font-bold text-slate-700"
                    >
                      Select Your Answer:
                    </label>
                    <select
                      id={`dropdown-q-${activeQuestion.id}`}
                      value={selectedAnswers[activeQuestion.id] || ""}
                      onChange={(e) => handleSelectOption(activeQuestion.id, e.target.value)}
                      disabled={Boolean(submittedAnswers[activeQuestion.id])}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition disabled:bg-slate-50 disabled:text-slate-600 font-medium"
                    >
                      <option value="">-- Choose an answer choice --</option>
                      {activeQuestion.options?.map((opt) => (
                        <option key={opt.key} value={opt.key}>
                          {opt.key}. {opt.text}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action buttons (Check Answer / Retry) */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {!submittedAnswers[activeQuestion.id] ? (
                      <button
                        onClick={() => handleCheckAnswer(activeQuestion.id)}
                        disabled={!selectedAnswers[activeQuestion.id]}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Check Answer</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRetry(activeQuestion.id)}
                        className="px-4 py-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry Question</span>
                      </button>
                    )}
                  </div>

                  {/* Feedback Explanation Area (Appears ONLY after submission) */}
                  {submittedAnswers[activeQuestion.id] && (
                    <div
                      role="region"
                      aria-live="polite"
                      className={`p-4 rounded-xl border transition-all text-xs space-y-2 ${
                        selectedAnswers[activeQuestion.id]?.toUpperCase() ===
                        activeQuestion.correct_answer?.toUpperCase()
                          ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                          : "bg-rose-50 border-rose-200 text-rose-950"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {selectedAnswers[activeQuestion.id]?.toUpperCase() ===
                        activeQuestion.correct_answer?.toUpperCase() ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-bold text-xs sm:text-sm">
                            {selectedAnswers[activeQuestion.id]?.toUpperCase() ===
                            activeQuestion.correct_answer?.toUpperCase()
                              ? "Correct!"
                              : "Incorrect."}
                          </p>
                          <p className="text-[11px] mt-0.5 text-slate-700">
                            <strong>Correct Answer:</strong> {activeQuestion.correct_answer}.{" "}
                            {
                              activeQuestion.options?.find(
                                (o) =>
                                  o.key.toUpperCase() ===
                                  activeQuestion.correct_answer?.toUpperCase()
                              )?.text
                            }
                          </p>
                        </div>
                      </div>

                      {activeQuestion.explanation && (
                        <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-700 leading-relaxed">
                          <span className="font-bold text-slate-900">Explanation: </span>
                          <span>{activeQuestion.explanation}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stepper Controls & Score Status for Practice Questions */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setActiveQuestionIndex((prev) =>
                      prev > 0 ? prev - 1 : effectiveQuestions.length - 1
                    )
                  }
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  aria-label="Previous Question"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {/* Question index pill jumpers */}
                <div className="flex items-center gap-1">
                  {effectiveQuestions.map((q, idx) => {
                    const isSubmitted = Boolean(submittedAnswers[q.id]);
                    const isCorrect =
                      isSubmitted &&
                      selectedAnswers[q.id]?.toUpperCase() === q.correct_answer?.toUpperCase();

                    return (
                      <button
                        key={q.id || idx}
                        onClick={() => setActiveQuestionIndex(idx)}
                        aria-label={`Jump to question ${idx + 1}`}
                        className={`w-6 h-6 rounded-lg text-[10px] font-bold transition flex items-center justify-center border cursor-pointer ${
                          activeQuestionIndex === idx
                            ? "bg-purple-600 text-white border-purple-700"
                            : isSubmitted
                            ? isCorrect
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-rose-100 text-rose-800 border-rose-300"
                            : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-purple-100"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setActiveQuestionIndex((prev) =>
                      prev < effectiveQuestions.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  aria-label="Next Question"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Practice performance tracker */}
              <div className="text-[11px] text-slate-500 font-medium">
                Answered: <span className="font-bold text-slate-800">{attemptedCount}</span>/
                {effectiveQuestions.length} • Score:{" "}
                <span className="font-bold text-purple-700">{correctCount}</span> Correct
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
