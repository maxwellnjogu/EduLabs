import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lecturerApi } from '../../api/client';
import {
  FileCheck,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Filter,
  Search,
  Eye,
  Sliders,
  Send,
  HelpCircle,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';

export const LecturerExamReadinessBuilderPage: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const [assessment, setAssessment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<number | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<'all' | 'mcq' | 'written'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Generation Modal State
  const [showGenModal, setShowGenModal] = useState(false);
  const [topics, setTopics] = useState<string[]>([
    'SDLC Methodologies & Architecture',
    'Requirements Engineering & Specification',
    'Software Architecture & Design Patterns',
    'Verification, Validation & Testing',
    'Project Management & Evolution',
  ]);
  const [weakAreas, setWeakAreas] = useState<string[]>([
    'Unified Modeling Language (UML) Diagrams',
    'Design Patterns & Object-Orientation',
    'Boundary Value & Integration Testing',
  ]);
  const [mcqCount, setMcqCount] = useState(45);
  const [writtenCount, setWrittenCount] = useState(15);
  const [difficulty, setDifficulty] = useState('medium');

  // Manual Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'mcq' | 'written'>('mcq');
  const [addPrompt, setAddPrompt] = useState('');
  const [addTopic, setAddTopic] = useState('UML Diagrams');
  const [addTimer, setAddTimer] = useState(60);
  const [addExplanation, setAddExplanation] = useState('');
  const [addRubric, setAddRubric] = useState('');
  const [addOptions, setAddOptions] = useState([
    { text: '', is_correct: true },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
  ]);

  const fetchReadinessAssessment = async () => {
    if (!unitId) return;
    setLoading(true);
    try {
      const res = await lecturerApi.getAssessments(Number(unitId));
      const found = res.data.find(
        (a: any) => a.assessment_type === 'final_readiness' || a.title?.toLowerCase().includes('final exam readiness')
      );
      if (found) {
        const detailRes = await lecturerApi.getAssessmentDetail(found.id);
        setAssessment(detailRes.data);
      } else {
        setAssessment(null);
      }
    } catch (err) {
      console.error('Failed to load readiness assessment', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadinessAssessment();
  }, [unitId]);

  const handleGenerateReadiness = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!unitId) return;
    setGenerating(true);
    setActionMsg(null);
    setShowGenModal(false);

    try {
      const res = await lecturerApi.generateExamReadiness(Number(unitId), {
        topics,
        weak_areas: weakAreas,
        mcq_count: mcqCount,
        written_count: writtenCount,
        difficulty,
      });

      setActionMsg({
        type: 'success',
        text: `Exam Readiness Builder: ${res.data.message || 'Generated 60 questions successfully.'} (${res.data.questions_generated} questions in draft)`
      });
      fetchReadinessAssessment();
    } catch (err: any) {
      setActionMsg({
        type: 'error',
        text: err?.response?.data?.error || err?.message || 'Failed to generate exam readiness questions.'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!assessment) return;
    const newStatus = assessment.status === 'published' ? 'draft' : 'published';
    try {
      await lecturerApi.updateAssessment(assessment.id, { status: newStatus });
      setActionMsg({
        type: 'success',
        text: `Exam Readiness Assessment status updated to ${newStatus.toUpperCase()}.`
      });
      fetchReadinessAssessment();
    } catch (err: any) {
      setActionMsg({
        type: 'error',
        text: err?.response?.data?.error || 'Failed to update assessment status.'
      });
    }
  };

  const handleDeleteQuestion = async (qId: number) => {
    if (!window.confirm('Delete this question from the readiness exam?')) return;
    try {
      await lecturerApi.deleteQuestion(qId);
      setActionMsg({ type: 'success', text: 'Question deleted.' });
      if (assessment) {
        setAssessment({
          ...assessment,
          questions: assessment.questions.filter((q: any) => q.id !== qId)
        });
      }
    } catch (err: any) {
      setActionMsg({
        type: 'error',
        text: err?.response?.data?.error || 'Failed to delete question.'
      });
    }
  };

  const handleRegenerateQuestion = async (qId: number) => {
    setRegeneratingId(qId);
    setActionMsg(null);
    try {
      const res = await lecturerApi.regenerateQuestion(qId);
      if (assessment) {
        setAssessment({
          ...assessment,
          questions: assessment.questions.map((q: any) => (q.id === qId ? { ...q, ...res.data } : q))
        });
      }
      setActionMsg({ type: 'success', text: 'Question regenerated with Gemini AI.' });
    } catch (err: any) {
      setActionMsg({
        type: 'error',
        text: err?.response?.data?.error || 'Failed to regenerate question.'
      });
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessment) return;

    try {
      const payload: any = {
        question_type: addType,
        prompt: addPrompt,
        marks: 1.0,
        timer_seconds: addTimer,
        topic_tag: addTopic,
        explanation: addExplanation,
      };

      if (addType === 'mcq') {
        payload.options = addOptions.map((o, idx) => ({
          option_text: o.text,
          is_correct: o.is_correct,
          order: idx + 1,
        }));
      } else {
        payload.marking_rubric = addRubric;
      }

      payload.assessment = assessment.id;
      await lecturerApi.createQuestion(payload);
      setActionMsg({ type: 'success', text: 'Question added to readiness assessment.' });
      setShowAddModal(false);
      // Reset form
      setAddPrompt('');
      setAddExplanation('');
      setAddRubric('');
      fetchReadinessAssessment();
    } catch (err: any) {
      setActionMsg({
        type: 'error',
        text: err?.response?.data?.error || 'Failed to create question.'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const allQuestions = assessment?.questions || [];
  const mcqs = allQuestions.filter((q: any) => q.question_type === 'mcq');
  const written = allQuestions.filter((q: any) => q.question_type === 'written');

  const filteredQuestions = allQuestions.filter((q: any) => {
    if (typeFilter !== 'all' && q.question_type !== typeFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchPrompt = q.prompt?.toLowerCase().includes(term);
      const matchTopic = q.topic_tag?.toLowerCase().includes(term);
      if (!matchPrompt && !matchTopic) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            to="/lecturer/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <FileCheck className="w-7 h-7 text-indigo-600" />
            Capstone Final Exam Readiness Assessment Builder
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure the 60 timed questions (45 MCQs + 15 Written Scenarios) that determine student university exam clearance. Pass mark: 35/60.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGenModal(true)}
            disabled={generating}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            {generating ? 'Generating 60 Questions...' : 'Generate 60 Questions (AI)'}
          </button>

          {assessment && (
            <button
              onClick={handlePublishToggle}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                assessment.status === 'published'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {assessment.status === 'published' ? 'Published (Click to Draft)' : 'Publish Assessment'}
            </button>
          )}
        </div>
      </div>

      {actionMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)} className="font-bold underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Questions</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{allQuestions.length} / 60</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Target: 60 questions</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-indigo-700 uppercase">Question Format</span>
          <div className="mt-2 text-2xl font-extrabold text-indigo-600">{mcqs.length} MCQ • {written.length} Written</div>
          <p className="text-[11px] text-indigo-700 mt-0.5">45 MCQs (60s) + 15 Written (120s)</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-brand-700 uppercase">Pass Threshold</span>
          <div className="mt-2 text-2xl font-extrabold text-brand-600">35 / 60 Marks</div>
          <p className="text-[11px] text-brand-700 mt-0.5">58.33% clearance score</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Assessment Status</span>
          <div className="mt-2 text-xl font-bold flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                assessment?.status === 'published'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {assessment?.status || 'NOT CONFIGURED'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {assessment?.status === 'published' ? 'Live to 14/14 lab students' : 'Draft stage (Lecturer visible)'}
          </p>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50 text-xs font-semibold">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-md transition ${
                typeFilter === 'all' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({allQuestions.length})
            </button>
            <button
              onClick={() => setTypeFilter('mcq')}
              className={`px-3 py-1.5 rounded-md transition ${
                typeFilter === 'mcq' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Multiple Choice ({mcqs.length})
            </button>
            <button
              onClick={() => setTypeFilter('written')}
              className={`px-3 py-1.5 rounded-md transition ${
                typeFilter === 'written' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Written Scenarios ({written.length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search questions or topics..."
              className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg w-60 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Question
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Assessment Questions Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Click &quot;Generate 60 Questions (AI)&quot; to instantly build the complete timed examination readiness assessment with Gemini AI.
            </p>
            <button
              onClick={() => setShowGenModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> Generate Assessment
            </button>
          </div>
        ) : (
          filteredQuestions.map((q: any, idx: number) => {
            const isMcq = q.question_type === 'mcq';
            return (
              <div
                key={q.id || idx}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Q{idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        isMcq
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {isMcq ? 'Multiple Choice' : 'Written Scenario'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      {q.topic_tag}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {q.timer_seconds}s
                    </span>
                    <span className="text-xs text-slate-400">1.0 pt</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRegenerateQuestion(q.id)}
                      disabled={regeneratingId === q.id}
                      title="Regenerate question with Gemini AI"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition disabled:opacity-50"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${regeneratingId === q.id ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      title="Delete question"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-900 leading-snug">{q.prompt}</p>

                {isMcq && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    {q.options?.map((opt: any, optIdx: number) => (
                      <div
                        key={opt.id || optIdx}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                          opt.is_correct
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{opt.option_text || opt.text}</span>
                        {opt.is_correct && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-2" />}
                      </div>
                    ))}
                  </div>
                )}

                {!isMcq && q.marking_rubric && (
                  <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-purple-950 uppercase tracking-wider text-[10px]">
                      Grading Rubric
                    </span>
                    <p className="text-purple-900">{q.marking_rubric}</p>
                  </div>
                )}

                {q.explanation && (
                  <div className="text-xs text-slate-500 pt-1">
                    <span className="font-bold text-slate-700">Explanation: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* GENERATE 60 QUESTIONS MODAL */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Generate 60 Final Exam Readiness Questions
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Grounds the assessment in syllabus topics with focused emphasis on weak areas like UML diagrams and Design Patterns.
            </p>

            <form onSubmit={handleGenerateReadiness} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Target Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="medium">Medium (Standard Undergraduate Benchmark)</option>
                  <option value="hard">Hard (Rigorous Architectural Scenarios)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Priority Weak Areas (Heavily Tested)
                </label>
                <div className="space-y-1.5 text-xs">
                  {weakAreas.map((wa, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded bg-indigo-50/60 border border-indigo-100 text-indigo-900">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{wa}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">MCQ Count</label>
                  <input
                    type="number"
                    value={mcqCount}
                    onChange={(e) => setMcqCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">60s timer each</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Written Count</label>
                  <input
                    type="number"
                    value={writtenCount}
                    onChange={(e) => setWrittenCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">120s timer + rubrics</p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <span className="font-bold">Total Questions: {mcqCount + writtenCount} (Pass Mark: 35/60)</span>
                <p className="mt-0.5 text-amber-800">
                  This will generate the complete 60 questions and save them as DRAFT. You can edit or publish whenever ready.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {generating ? 'Running Gemini AI...' : 'Generate 60 Questions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD QUESTION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add Question to Readiness Exam</h3>
            <p className="text-xs text-slate-500 mb-4">Create a Multiple Choice Question or Written Scenario.</p>

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Type</label>
                <select
                  value={addType}
                  onChange={(e: any) => setAddType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="mcq">Multiple Choice Question (4 Options)</option>
                  <option value="written">Written Scenario Question with Rubric</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Topic Tag</label>
                <input
                  type="text"
                  required
                  value={addTopic}
                  onChange={(e) => setAddTopic(e.target.value)}
                  placeholder="e.g. UML Diagrams, Design Patterns"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Prompt *</label>
                <textarea
                  rows={2}
                  required
                  value={addPrompt}
                  onChange={(e) => setAddPrompt(e.target.value)}
                  placeholder="Enter the question or scenario..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              {addType === 'mcq' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Answer Options (Mark Correct)</label>
                  {addOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct_opt"
                        checked={opt.is_correct}
                        onChange={() => {
                          setAddOptions(addOptions.map((o, idx) => ({ ...o, is_correct: idx === i })));
                        }}
                      />
                      <input
                        type="text"
                        required
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...addOptions];
                          updated[i].text = e.target.value;
                          setAddOptions(updated);
                        }}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              {addType === 'written' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Marking Rubric *</label>
                  <textarea
                    rows={2}
                    required
                    value={addRubric}
                    onChange={(e) => setAddRubric(e.target.value)}
                    placeholder="Key concepts and criteria for awarding marks..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Explanation / Model Answer</label>
                <textarea
                  rows={2}
                  value={addExplanation}
                  onChange={(e) => setAddExplanation(e.target.value)}
                  placeholder="Explanation of the correct answer..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 shadow-sm"
                >
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
