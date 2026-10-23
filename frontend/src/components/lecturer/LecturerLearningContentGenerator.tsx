import React, { useState, useEffect } from 'react';
import { lecturerApi } from '../../api/client';
import {
  Sparkles,
  CheckCircle2,
  BookOpen,
  FileText,
  Layers,
  Send,
  HelpCircle,
  Eye,
  Check,
  RotateCw,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { SDLCMindMapViewer } from '../learning/SDLCMindMapViewer';

interface LecturerLearningContentGeneratorProps {
  unitId: number;
  onPublished?: () => void;
}

export const LecturerLearningContentGenerator: React.FC<LecturerLearningContentGeneratorProps> = ({
  unitId,
  onPublished,
}) => {
  // Modes selection (all 4 selected by default)
  const [selectedModes, setSelectedModes] = useState<string[]>([
    'practice_questions',
    'summary_notes',
    'flashcards',
    'mind_map',
  ]);

  // Loading & Progress state (10s progress indicator)
  const [generating, setGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Analyzing learning materials...');
  const [progressPercent, setProgressPercent] = useState(0);

  // Content preview state
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'practice' | 'notes' | 'flashcards' | 'mindmap'>('practice');

  // Publishing state
  const [publishing, setPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Check persistent publication status
  useEffect(() => {
    const saved = localStorage.getItem(`edulabs_published_content_${unitId}`);
    if (saved === 'true') {
      setIsPublished(true);
    }
  }, [unitId]);

  const toggleMode = (mode: string) => {
    setSelectedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const handleGenerate = async () => {
    if (selectedModes.length === 0) return;
    setGenerating(true);
    setProgressPercent(10);
    setProgressMsg('Analyzing learning materials & uploaded SDLC resources...');
    setSuccessToast(null);

    // 10-second demo progress simulation
    const timer1 = setTimeout(() => {
      setProgressPercent(40);
      setProgressMsg('Preparing practice questions & comprehensive summary notes...');
    }, 3000);

    const timer2 = setTimeout(() => {
      setProgressPercent(75);
      setProgressMsg('Building revision resources & interactive SDLC mind map...');
    }, 6500);

    const timer3 = setTimeout(async () => {
      setProgressPercent(100);
      try {
        const res = await lecturerApi.generateLearningContent(unitId, {
          selected_modes: selectedModes,
          action: 'preview',
        });
        setPreviewData(res.data.preview);
        // Switch to first available selected preview mode
        if (selectedModes.includes('practice_questions')) setActivePreviewTab('practice');
        else if (selectedModes.includes('summary_notes')) setActivePreviewTab('notes');
        else if (selectedModes.includes('flashcards')) setActivePreviewTab('flashcards');
        else if (selectedModes.includes('mind_map')) setActivePreviewTab('mindmap');
      } catch (err: any) {
        console.error('Generation error', err);
      } finally {
        setGenerating(false);
      }
    }, 10000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  const handlePublish = async () => {
    if (!previewData && selectedModes.length === 0) return;
    setPublishing(true);
    try {
      const res = await lecturerApi.generateLearningContent(unitId, {
        selected_modes: selectedModes,
        action: 'publish',
      });
      setIsPublished(true);
      localStorage.setItem(`edulabs_published_content_${unitId}`, 'true');
      setSuccessToast(
        res.data?.message || 'Learning content successfully published to students\' SDLC Lab 1 and Revision Hub!'
      );
      if (onPublished) onPublished();
    } catch (err: any) {
      alert(`Publish error: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      {/* Header & Reused Materials Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900">AI Learning Content Generator</h3>
            {isPublished ? (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Status: Published
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Status: Draft / Ready to Generate
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Author and ground interactive learning resources across 4 study modes reusing curriculum assets.
          </p>
        </div>

        {/* Existing Resource Notice */}
        <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-purple-600 shrink-0" />
          <span>
            Reusing existing uploaded SDLC PDF, saved YouTube link, and sample questions.
          </span>
        </div>
      </div>

      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:underline font-bold text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Selected Learning Modes Checkboxes */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Selected Learning Modes
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'practice_questions', label: 'Practice Questions', desc: 'Dropdown choices & feedback' },
            { id: 'summary_notes', label: 'Summary Notes', desc: 'Syllabus notes & headings' },
            { id: 'flashcards', label: 'Flashcards', desc: 'Interactive concept cards' },
            { id: 'mind_map', label: 'Mind Map', desc: 'Interactive SDLC Map & Lifecycle' },
          ].map((mode) => {
            const isChecked = selectedModes.includes(mode.id);
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => toggleMode(mode.id)}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  isChecked
                    ? 'border-purple-500 bg-purple-50/50 ring-1 ring-purple-500/20 text-slate-900'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold">{mode.label}</span>
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                      isChecked ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                  </div>
                </div>
                <span className="text-[10px] text-slate-500">{mode.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Generate Button & Progress State */}
      <div className="space-y-3 pt-1">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || selectedModes.length === 0}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition flex items-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{generating ? 'Generating Content...' : 'Generate Learning Content with AI'}</span>
        </button>

        {generating && (
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-purple-900 font-semibold">
              <span className="flex items-center gap-2">
                <RotateCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
                {progressMsg}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 italic">
              Demonstration: Synthesizing grounded syllabus concepts across selected learning modes (~10s).
            </p>
          </div>
        )}
      </div>

      {/* Content Preview & Review Area */}
      {previewData && !generating && (
        <div className="space-y-4 pt-3 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-600" />
                Learning Resources Preview (Review Before Publishing)
              </h4>
              <p className="text-xs text-slate-500">
                Review generated resources. Content remains draft until published to students.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing || isPublished}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 ${
                isPublished
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isPublished ? 'Published to Students' : publishing ? 'Publishing...' : 'Publish to Students'}</span>
            </button>
          </div>

          {/* Preview Mode Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            {selectedModes.includes('practice_questions') && (
              <button
                type="button"
                onClick={() => setActivePreviewTab('practice')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activePreviewTab === 'practice'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Practice Questions ({previewData.practice_questions?.length || 3})
              </button>
            )}
            {selectedModes.includes('summary_notes') && (
              <button
                type="button"
                onClick={() => setActivePreviewTab('notes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activePreviewTab === 'notes'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Summary Notes
              </button>
            )}
            {selectedModes.includes('flashcards') && (
              <button
                type="button"
                onClick={() => setActivePreviewTab('flashcards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activePreviewTab === 'flashcards'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Flashcards ({previewData.flashcards?.length || 3})
              </button>
            )}
            {selectedModes.includes('mind_map') && (
              <button
                type="button"
                onClick={() => setActivePreviewTab('mindmap')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activePreviewTab === 'mindmap'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Mind Map Preview
              </button>
            )}
          </div>

          {/* Active Preview Body */}
          <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-5">
            {/* 1. Practice Questions Preview */}
            {activePreviewTab === 'practice' && previewData.practice_questions && (
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                  Practice Questions with Feedback
                </span>
                {previewData.practice_questions.map((pq: any, idx: number) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-700">Question {idx + 1}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        SDLC Fundamentals
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{pq.prompt}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {pq.options?.map((opt: any, oIdx: number) => (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                            opt.is_correct
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{opt.key}. {opt.text}</span>
                          {opt.is_correct && <span className="text-[10px] font-bold text-emerald-700">(Correct)</span>}
                        </div>
                      ))}
                    </div>
                    {pq.explanation && (
                      <p className="text-xs text-slate-500 pt-1">
                        <strong className="text-slate-700">Explanation: </strong>
                        {pq.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 2. Summary Notes Preview */}
            {activePreviewTab === 'notes' && previewData.summary_notes && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-base font-bold text-slate-900">{previewData.summary_notes.title}</h4>
                <div className="prose prose-sm max-w-none text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                  {previewData.summary_notes.content}
                </div>
              </div>
            )}

            {/* 3. Flashcards Preview */}
            {activePreviewTab === 'flashcards' && previewData.flashcards && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Interactive Concept Cards ({previewData.flashcards.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {previewData.flashcards.map((fc: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 uppercase">
                          Card {idx + 1}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 mt-2">{fc.prompt}</h5>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                        <strong className="text-slate-700 block text-[10px] uppercase mb-0.5">Answer</strong>
                        <span>{fc.answer || fc.explanation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Mind Map Preview */}
            {activePreviewTab === 'mindmap' && (
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Interactive SDLC Mind Map & Lifecycle Blueprint
                  </h5>
                  <p className="text-xs text-slate-500 mb-4">
                    Students will explore the 5 circular phases with clickable nodes for Planning, Analysis, Design, Coding, Testing, Deployment, and Maintenance.
                  </p>
                  <div className="max-h-[500px] overflow-y-auto rounded-xl border border-slate-100">
                    <SDLCMindMapViewer />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Publish Bar */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              {isPublished
                ? 'Status: Published and live in student Lab 1 & Revision Hub.'
                : 'Review complete? Click "Publish to Students" to push resources.'}
            </span>

            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing || isPublished}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 ${
                isPublished
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isPublished ? 'Published to Students' : publishing ? 'Publishing...' : 'Publish to Students'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
