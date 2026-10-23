import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  X,
  Layers,
  HelpCircle,
  Eye,
  EyeOff,
  BookOpen,
  Sparkles,
  AlertCircle,
  Check,
} from "lucide-react";
import { lecturerApi } from "../../api/client";

export interface PracticeQuestion {
  id: number;
  unit: number;
  unit_name?: string;
  week?: number | null;
  assessment?: number | null;
  assessment_title?: string;
  topic: string;
  prompt: string;
  options: Array<{ key: string; text: string }>;
  correct_answer: string;
  explanation: string;
  order: number;
  status: "draft" | "published";
  created_by_name?: string;
  created_at?: string;
  updated_at?: string;
}

interface Props {
  unitId: number;
  assessmentId?: number;
  selectedAssessment?: any;
  assessments?: any[];
}

export const LecturerPracticeQuestionsManager: React.FC<Props> = ({
  unitId,
  assessmentId,
  selectedAssessment,
  assessments = [],
}) => {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [targetAssessmentId, setTargetAssessmentId] = useState<number | string>(assessmentId || "");
  const [topic, setTopic] = useState("SDLC Fundamentals");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState([
    { key: "A", text: "" },
    { key: "B", text: "" },
    { key: "C", text: "" },
    { key: "D", text: "" },
  ]);
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [explanation, setExplanation] = useState("");
  const [statusVal, setStatusVal] = useState<"draft" | "published">("published");
  const [order, setOrder] = useState<number>(1);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await lecturerApi.getPracticeQuestions({ unitId });
      setQuestions(res.data);
    } catch (err: any) {
      setActionMsg({
        type: "error",
        text: err?.message || "Failed to load practice questions",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (unitId) {
      fetchQuestions();
    }
  }, [unitId]);

  useEffect(() => {
    if (assessmentId) {
      setTargetAssessmentId(assessmentId);
    }
  }, [assessmentId]);

  const resetForm = () => {
    setEditingId(null);
    setTargetAssessmentId(assessmentId || (selectedAssessment ? selectedAssessment.id : ""));
    setTopic("SDLC Fundamentals");
    setPrompt("");
    setOptions([
      { key: "A", text: "" },
      { key: "B", text: "" },
      { key: "C", text: "" },
      { key: "D", text: "" },
    ]);
    setCorrectAnswer("A");
    setExplanation("");
    setStatusVal("published");
    setOrder(questions.length + 1);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (q: PracticeQuestion) => {
    setEditingId(q.id);
    setTargetAssessmentId(q.assessment || "");
    setTopic(q.topic || "SDLC Fundamentals");
    setPrompt(q.prompt);

    // Format options to 4 keys
    const rawOpts = q.options || [];
    const formattedOpts = ["A", "B", "C", "D"].map((key) => {
      const found = rawOpts.find((o) => o.key?.toUpperCase() === key);
      return { key, text: found ? found.text : "" };
    });
    setOptions(formattedOpts);

    setCorrectAnswer(q.correct_answer?.toUpperCase() || "A");
    setExplanation(q.explanation || "");
    setStatusVal(q.status);
    setOrder(q.order || 1);
    setShowModal(true);
  };

  const handleOptionChange = (index: number, text: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], text };
      return next;
    });
  };

  const handleSaveQuestion = async (e: React.FormEvent, forcedStatus?: "draft" | "published") => {
    e.preventDefault();
    if (submitting) return;

    if (!prompt.trim()) {
      setActionMsg({ type: "error", text: "Please provide a question prompt." });
      return;
    }

    const filledOptions = options.map((o) => ({ key: o.key, text: o.text.trim() }));
    if (filledOptions.some((o) => !o.text)) {
      setActionMsg({ type: "error", text: "All 4 answer options (A, B, C, D) are required." });
      return;
    }

    setSubmitting(true);
    setActionMsg(null);

    const payload = {
      unit_id: unitId,
      assessment_id: targetAssessmentId ? Number(targetAssessmentId) : null,
      topic: topic.trim() || "SDLC Fundamentals",
      prompt: prompt.trim(),
      options: filledOptions,
      correct_answer: correctAnswer.toUpperCase(),
      explanation: explanation.trim(),
      status: forcedStatus || statusVal,
      order: Number(order) || questions.length + 1,
    };

    try {
      if (editingId) {
        await lecturerApi.updatePracticeQuestion(editingId, payload);
        setActionMsg({ type: "success", text: "Practice question updated successfully." });
      } else {
        await lecturerApi.createPracticeQuestion(payload);
        setActionMsg({
          type: "success",
          text: `Practice question ${payload.status === "published" ? "published" : "saved as draft"} successfully.`,
        });
      }
      setShowModal(false);
      resetForm();
      fetchQuestions();
    } catch (err: any) {
      setActionMsg({
        type: "error",
        text: err?.message || "Failed to save practice question.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this practice question?")) return;
    try {
      await lecturerApi.deletePracticeQuestion(id);
      setActionMsg({ type: "success", text: "Practice question deleted." });
      fetchQuestions();
    } catch (err: any) {
      setActionMsg({
        type: "error",
        text: err?.message || "Failed to delete practice question.",
      });
    }
  };

  const handleToggleStatus = async (q: PracticeQuestion) => {
    const nextStatus = q.status === "published" ? "draft" : "published";
    try {
      await lecturerApi.updatePracticeQuestion(q.id, { status: nextStatus });
      setActionMsg({
        type: "success",
        text: `Question marked as ${nextStatus}.`,
      });
      fetchQuestions();
    } catch (err: any) {
      setActionMsg({
        type: "error",
        text: err?.message || "Failed to update question status.",
      });
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= questions.length) return;

    const reordered = [...questions];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIdx, 0, moved);

    setQuestions(reordered);

    const orderIds = reordered.map((item) => item.id);
    try {
      await lecturerApi.reorderPracticeQuestions(orderIds);
    } catch (err: any) {
      setActionMsg({
        type: "error",
        text: err?.message || "Failed to update question ordering.",
      });
      fetchQuestions();
    }
  };

  const publishedCount = questions.filter((q) => q.status === "published").length;
  const draftCount = questions.filter((q) => q.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* Alert message */}
      {actionMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            actionMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{actionMsg.text}</span>
          </div>
          <button
            onClick={() => setActionMsg(null)}
            className="text-slate-400 hover:text-slate-700 ml-4 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Top Action & Stats Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">
              Learning Activities Manager
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>Manage Practice Questions</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, edit, reorder, and publish interactive dropdown practice questions for students on the SDLC learning page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <span className="text-emerald-700 font-bold">{publishedCount} Published</span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-700 font-bold">{draftCount} Drafts</span>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Practice Question</span>
          </button>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto" />
          <p className="text-xs text-slate-500 mt-2 font-medium">Loading practice questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Practice Questions Yet</h3>
          <p className="text-xs text-slate-500">
            Create interactive 4-choice dropdown questions with instant feedback for students to practice before the official lab assessment.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Question</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => {
            const isPublished = q.status === "published";
            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all space-y-3.5"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-mono font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isPublished
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {isPublished ? "Published" : "Draft"}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                      Topic: {q.topic}
                    </span>
                    {q.assessment_title && (
                      <span className="text-[11px] text-slate-500">
                        Lab: {q.assessment_title}
                      </span>
                    )}
                  </div>

                  {/* Ordering & Action buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(idx, "up")}
                      disabled={idx === 0}
                      title="Move Question Up"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, "down")}
                      disabled={idx === questions.length - 1}
                      title="Move Question Down"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-px h-4 bg-slate-200 mx-1" />

                    <button
                      onClick={() => handleToggleStatus(q)}
                      title={isPublished ? "Unpublish (Make Draft)" : "Publish Question"}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        isPublished
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isPublished ? "Set Draft" : "Publish"}</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(q)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition"
                      title="Edit Question"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Prompt */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {q.prompt}
                  </h4>
                </div>

                {/* Options 4-grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options?.map((opt) => {
                    const isCorrect = opt.key.toUpperCase() === q.correct_answer.toUpperCase();
                    return (
                      <div
                        key={opt.key}
                        className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                          isCorrect
                            ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-md font-mono font-bold text-[11px] flex items-center justify-center shrink-0 ${
                            isCorrect ? "bg-emerald-600 text-white" : "bg-white border border-slate-300 text-slate-700"
                          }`}
                        >
                          {opt.key}
                        </span>
                        <div className="flex-1">
                          <span>{opt.text}</span>
                          {isCorrect && (
                            <span className="ml-1.5 text-[10px] text-emerald-700 font-extrabold uppercase">
                              (Correct Answer)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 space-y-0.5">
                    <span className="font-bold text-slate-900 block text-[11px]">Explanation:</span>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Add / Edit Question */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingId ? "Edit Practice Question" : "Add Practice Question"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Associate with unit, lab assessment, and provide 4 choices with correct answer and explanation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Lab Assessment selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Associate with Lab Assessment
                  </label>
                  <select
                    value={targetAssessmentId}
                    onChange={(e) => setTargetAssessmentId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="">-- General Unit Question --</option>
                    {assessments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Topic / Concept Classification
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. SDLC Phases - Analysis"
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Prompt textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Question Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Which activity belongs to the Analysis phase?"
                  required
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* 4 Choices */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Four Answer Choices (Select the radio of the correct answer)
                  </label>
                  <span className="text-[11px] text-purple-700 font-bold">
                    Correct: Option {correctAnswer}
                  </span>
                </div>

                <div className="space-y-2">
                  {options.map((opt, i) => (
                    <div
                      key={opt.key}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition ${
                        correctAnswer === opt.key
                          ? "bg-purple-50/60 border-purple-300 ring-1 ring-purple-400"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <label className="flex items-center gap-1.5 cursor-pointer px-1">
                        <input
                          type="radio"
                          name="correct_answer_radio"
                          value={opt.key}
                          checked={correctAnswer === opt.key}
                          onChange={() => setCorrectAnswer(opt.key)}
                          className="w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                        <span className="font-mono font-bold text-xs text-slate-800">
                          {opt.key}.
                        </span>
                      </label>

                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        placeholder={`Option ${opt.key} answer text`}
                        required
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Explanation / Answer Feedback
                </label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain why the selected choice is correct to aid student understanding..."
                  required
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Publication Status & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Publication Status
                  </label>
                  <div className="flex items-center gap-3 mt-1">
                    <label className="flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="status_radio"
                        value="published"
                        checked={statusVal === "published"}
                        onChange={() => setStatusVal("published")}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="font-bold text-emerald-700">Published</span>
                      <span className="text-[10px] text-slate-400">(Visible to students)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="status_radio"
                        value="draft"
                        checked={statusVal === "draft"}
                        onChange={() => setStatusVal("draft")}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="font-bold text-amber-700">Draft</span>
                      <span className="text-[10px] text-slate-400">(Hidden from students)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSaveQuestion(e, "draft")}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{editingId ? "Update Question" : "Publish Question"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
