import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lecturerApi } from '../../api/client';
import {
  FileText,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Eye,
  Sliders,
  Layers,
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  Upload,
  AlertCircle,
  Video,
  BookOpen,
  CheckSquare,
  Check,
  Send,
  HelpCircle,
  Edit3,
  MoveUp,
  MoveDown,
  X,
  Settings2,
  ListOrdered,
  Shuffle,
  Award,
} from 'lucide-react';
import { LecturerPracticeQuestionsManager } from '../../components/lecturer/LecturerPracticeQuestionsManager';

interface ModeConfig {
  count: number;
  timer_seconds: number;
  marks_per_item: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  scoring_method: 'standard' | 'partial' | 'all_or_nothing' | 'ungraded';
  feedback_visibility: 'immediate' | 'after_submission';
  allow_retry: boolean;
  is_graded: boolean;
}

interface TestingModeDef {
  id: string;
  category: 'knowledge' | 'application';
  label: string;
  defaultConfig: ModeConfig;
  desc: string;
}

const TESTING_MODES_DEF: TestingModeDef[] = [
  // Knowledge Checks
  {
    id: 'trivia',
    category: 'knowledge',
    label: 'Trivia',
    defaultConfig: {
      count: 5,
      timer_seconds: 15,
      marks_per_item: 1,
      difficulty: 'Medium',
      topic: 'SDLC Fundamentals',
      scoring_method: 'standard',
      feedback_visibility: 'after_submission',
      allow_retry: true,
      is_graded: true,
    },
    desc: 'Rapid-fire multiple choice trivia questions testing core definitions, lifecycle phases, and QA principles.',
  },
  {
    id: 'multi_select',
    category: 'knowledge',
    label: 'Multiple-Select Questions',
    defaultConfig: {
      count: 3,
      timer_seconds: 20,
      marks_per_item: 2,
      difficulty: 'Medium',
      topic: 'SDLC Methodologies',
      scoring_method: 'partial',
      feedback_visibility: 'after_submission',
      allow_retry: true,
      is_graded: true,
    },
    desc: 'Multi-option questions where students select all applicable answers with partial-credit scoring.',
  },
  {
    id: 'fill_blanks',
    category: 'knowledge',
    label: 'Fill in the Blanks',
    defaultConfig: {
      count: 3,
      timer_seconds: 20,
      marks_per_item: 2,
      difficulty: 'Medium',
      topic: 'SDLC Lifecycle Terminology',
      scoring_method: 'standard',
      feedback_visibility: 'after_submission',
      allow_retry: true,
      is_graded: true,
    },
    desc: 'Sentence and passage completion tasks where students identify missing technical terms and phase names.',
  },
  {
    id: 'flashcards',
    category: 'knowledge',
    label: 'Flashcards',
    defaultConfig: {
      count: 5,
      timer_seconds: 0,
      marks_per_item: 0,
      difficulty: 'Easy',
      topic: 'SDLC Core Concepts',
      scoring_method: 'ungraded',
      feedback_visibility: 'immediate',
      allow_retry: true,
      is_graded: false, // Default to ungraded revision unless explicitly configured
    },
    desc: 'Interactive concept review cards for student revision (ungraded by default; does not affect assessment score).',
  },

  // Application and Problem-Solving
  {
    id: 'matching',
    category: 'application',
    label: 'Matching Exercise',
    defaultConfig: {
      count: 6,
      timer_seconds: 30,
      marks_per_item: 1,
      difficulty: 'Medium',
      topic: 'SDLC Phase Mappings',
      scoring_method: 'standard',
      feedback_visibility: 'after_submission',
      allow_retry: true,
      is_graded: true,
    },
    desc: 'Interactive exercise requiring students to map SDLC phases and engineering roles directly to their responsibilities.',
  },
  {
    id: 'drag_drop',
    category: 'application',
    label: 'Drag & Drop',
    defaultConfig: {
      count: 6,
      timer_seconds: 25,
      marks_per_item: 0.5,
      difficulty: 'Medium',
      topic: 'SDLC Phase Sequencing',
      scoring_method: 'standard',
      feedback_visibility: 'after_submission',
      allow_retry: true,
      is_graded: true,
    },
    desc: 'Sequential ordering challenge where students arrange lifecycle stages into the correct engineering chronology.',
  },
  {
    id: 'scenario',
    category: 'application',
    label: 'What Would You Do? Scenario',
    defaultConfig: {
      count: 1,
      timer_seconds: 60,
      marks_per_item: 4,
      difficulty: 'Hard',
      topic: 'Real-World SDLC Situations',
      scoring_method: 'standard',
      feedback_visibility: 'after_submission',
      allow_retry: false,
      is_graded: true,
    },
    desc: 'Realistic engineering challenge requiring technical analysis, requirement elicitation, and written reasoning.',
  },
  {
    id: 'case_study',
    category: 'application',
    label: 'Case Study Analysis',
    defaultConfig: {
      count: 1,
      timer_seconds: 90,
      marks_per_item: 5,
      difficulty: 'Hard',
      topic: 'Enterprise System Modernization',
      scoring_method: 'standard',
      feedback_visibility: 'after_submission',
      allow_retry: false,
      is_graded: true,
    },
    desc: 'Multi-part architectural case study evaluating legacy system migration, risk management, and governance tradeoffs.',
  },
];

export const LecturerAssessmentBuilderPage: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'builder' | 'questions' | 'practice' | 'materials' | 'settings' | 'preview'>('builder');
  const [showQuestionPreview, setShowQuestionPreview] = useState(false);
  const [generationStageText, setGenerationStageText] = useState('Preparing course materials');

  // Materials State
  const [materials, setMaterials] = useState<any[]>([]);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<number[]>([]);

  // Step 1: Upload Material form state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileCategory, setFileCategory] = useState<'pdf' | 'notes' | 'image' | 'resource'>('pdf');
  const [fileTitle, setFileTitle] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [savingYoutube, setSavingYoutube] = useState(false);

  const [summarizedNote, setSummarizedNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Step 2: Testing Modes state
  const [selectedModes, setSelectedModes] = useState<string[]>([
    'trivia',
    'multi_select',
    'fill_blanks',
    'flashcards',
    'matching',
    'drag_drop',
    'scenario',
    'case_study',
  ]);

  // Mode configurations state
  const [modeConfigs, setModeConfigs] = useState<Record<string, ModeConfig>>(() => {
    const initial: Record<string, ModeConfig> = {};
    TESTING_MODES_DEF.forEach((m) => {
      initial[m.id] = { ...m.defaultConfig };
    });
    return initial;
  });

  // Modal for configuring a specific mode
  const [configuringModeId, setConfiguringModeId] = useState<string | null>(null);

  // Preview filtering state
  const [previewFilterMode, setPreviewFilterMode] = useState<string>('all');

  // Question editing state
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [regeneratingQId, setRegeneratingQId] = useState<number | null>(null);

  // Manual Question Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [qType, setQType] = useState('mcq');
  const [marks, setMarks] = useState(2);
  const [timeSeconds, setTimeSeconds] = useState(15);
  const [explanation, setExplanation] = useState('');
  const [topicTag, setTopicTag] = useState('SDLC Fundamentals');
  const [options, setOptions] = useState([
    { text: '', is_correct: true },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
  ]);

  const fetchAssessments = async () => {
    if (!unitId) return;
    try {
      const res = await lecturerApi.getAssessments(Number(unitId));
      setAssessments(res.data);
      if (res.data.length > 0) {
        const found = selectedAssessment
          ? res.data.find((a: any) => a.id === selectedAssessment.id) || res.data[0]
          : res.data[0];
        loadAssessmentDetail(found.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAssessmentDetail = async (id: number) => {
    try {
      const res = await lecturerApi.getAssessmentDetail(id);
      setSelectedAssessment(res.data);

      // Preload saved mode configs if present in backend
      if (res.data?.activity_config && Object.keys(res.data.activity_config).length > 0) {
        setModeConfigs((prev) => ({
          ...prev,
          ...res.data.activity_config,
        }));
      }

      fetchMaterials(id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMaterials = async (assessmentId: number) => {
    try {
      const res = await lecturerApi.getAssessmentMaterials(assessmentId);
      const mats = res.data || [];
      setMaterials(mats);

      const noteMat = mats.find((m: any) => m.material_type === 'notes');
      if (noteMat && noteMat.content) {
        setSummarizedNote(noteMat.content);
      }
      const ytMat = mats.find((m: any) => m.material_type === 'youtube' || m.url);
      if (ytMat && ytMat.url) {
        setYoutubeUrl(ytMat.url);
      }

      const processedIds = mats.filter((m: any) => m.processing_status === 'processed').map((m: any) => m.id);
      setSelectedMaterialIds(processedIds);
    } catch (err) {
      console.error('Failed to load assessment materials', err);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [unitId]);

  const toggleMode = (modeId: string) => {
    setSelectedModes((prev) =>
      prev.includes(modeId) ? prev.filter((m) => m !== modeId) : [...prev, modeId]
    );
  };

  const updateModeConfigField = (modeId: string, field: keyof ModeConfig, value: any) => {
    setModeConfigs((prev) => ({
      ...prev,
      [modeId]: {
        ...prev[modeId],
        [field]: value,
      },
    }));
  };

  // STEP 1: Computer File Upload Handler
  const handleUploadComputerFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessment || !selectedFile) {
      setActionMsg({ type: 'error', text: 'Please select a file from your computer.' });
      return;
    }
    setUploadingFile(true);
    setActionMsg(null);

    try {
      const formData = new FormData();
      formData.append('assessment_id', selectedAssessment.id.toString());
      if (selectedAssessment.week?.id) {
        formData.append('week_id', selectedAssessment.week.id.toString());
      }
      const titleToUse = fileTitle.trim() || selectedFile.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      formData.append('title', titleToUse);
      formData.append('material_type', fileCategory);
      formData.append('file', selectedFile);

      const res = await lecturerApi.uploadAssessmentMaterial(selectedAssessment.id, formData);
      setActionMsg({
        type: 'success',
        text: `Uploaded "${res.data.title}" successfully from computer.`,
      });
      setSelectedFile(null);
      setFileTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchMaterials(selectedAssessment.id);
    } catch (err: any) {
      setActionMsg({
        type: 'error',
        text: err?.response?.data?.error || err?.message || 'Failed to upload file. Ensure format is supported.',
      });
    } finally {
      setUploadingFile(false);
    }
  };

  // STEP 1: Save YouTube URL
  const handleSaveYouTubeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessment || !youtubeUrl.trim()) return;
    setSavingYoutube(true);
    setActionMsg(null);

    try {
      const formData = new FormData();
      formData.append('assessment_id', selectedAssessment.id.toString());
      if (selectedAssessment.week?.id) {
        formData.append('week_id', selectedAssessment.week.id.toString());
      }
      formData.append('title', 'Software Development Life Cycle (SDLC) Video');
      formData.append('material_type', 'youtube');
      formData.append('url', youtubeUrl.trim());

      await lecturerApi.uploadAssessmentMaterial(selectedAssessment.id, formData);
      setActionMsg({ type: 'success', text: 'YouTube reference URL saved successfully.' });
      fetchMaterials(selectedAssessment.id);
    } catch (err: any) {
      setActionMsg({
        type: 'error',
        text: err?.response?.data?.error || 'Failed to save YouTube URL.',
      });
    } finally {
      setSavingYoutube(false);
    }
  };

  // STEP 1: Save Summarized Lecture Note
  const handleSaveSummarizedNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessment || !summarizedNote.trim()) return;
    setSavingNote(true);
    setActionMsg(null);

    try {
      const formData = new FormData();
      formData.append('assessment_id', selectedAssessment.id.toString());
      if (selectedAssessment.week?.id) {
        formData.append('week_id', selectedAssessment.week.id.toString());
      }
      formData.append('title', 'SDLC Fundamentals: Complete Curriculum Lecture Notes');
      formData.append('material_type', 'notes');
      formData.append('content', summarizedNote.trim());

      await lecturerApi.uploadAssessmentMaterial(selectedAssessment.id, formData);
      setActionMsg({ type: 'success', text: 'Summarized lecture note saved successfully.' });
      fetchMaterials(selectedAssessment.id);
    } catch (err: any) {
      setActionMsg({
        type: 'error',
        text: err?.response?.data?.error || 'Failed to save summarized lecture note.',
      });
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteMaterial = async (matId: number) => {
    if (!window.confirm('Delete this learning resource?')) return;
    try {
      await lecturerApi.deleteMaterial(matId);
      setActionMsg({ type: 'success', text: 'Material removed.' });
      if (selectedAssessment) fetchMaterials(selectedAssessment.id);
    } catch (err: any) {
      setActionMsg({
        type: 'error',
        text: err?.response?.data?.error || 'Failed to delete material.',
      });
    }
  };

  // STEP 3: Generate Questions with AI
  const handleGenerateQuestionsWithAI = async () => {
    if (!selectedAssessment || generating) return;
    if (selectedModes.length === 0) {
      setActionMsg({ type: 'error', text: 'Please select at least one testing mode in Step 2.' });
      return;
    }
    setGenerating(true);
    setActionMsg(null);
    setShowQuestionPreview(false);

    // Rotating status messages during generation
    const stages = [
      'Preparing course materials',
      'Creating assessment questions',
      'Checking answers and marking rules',
      'Preparing your preview',
    ];
    setGenerationStageText(stages[0]);
    let stageIdx = 0;
    const stageInterval = setInterval(() => {
      stageIdx = (stageIdx + 1) % stages.length;
      setGenerationStageText(stages[stageIdx]);
    }, 1750);

    const startTime = Date.now();

    try {
      // 1. Perform actual assessment generation grounded in local SDLC curriculum resources
      await lecturerApi.generateDemoContent(selectedAssessment.id, false, {
        modes: selectedModes,
        mode_configs: modeConfigs,
      });

      // 2. Fetch fresh assessment detail to validate generated questions
      const detailRes = await lecturerApi.getAssessmentDetail(selectedAssessment.id);
      const freshAssessment = detailRes.data;

      // 3. Enforce presentation delay: wait until at least 7 seconds (7000ms) have elapsed
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, 7000 - elapsed);
      if (remainingDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingDelay));
      }

      clearInterval(stageInterval);

      // 4. Validate assessment questions exist before revealing preview
      const activeQuestions = (freshAssessment?.questions || []).filter((q: any) => q.is_active !== false);
      if (!activeQuestions || activeQuestions.length === 0) {
        setShowQuestionPreview(false);
        setActionMsg({
          type: 'error',
          text: 'Generation completed but returned 0 valid questions. Preserving draft without displaying empty preview.',
        });
        return;
      }

      // 5. Reveal preview
      setSelectedAssessment(freshAssessment);
      setShowQuestionPreview(true);
      setActionMsg({
        type: 'success',
        text: `Successfully generated ${activeQuestions.length} questions across ${selectedModes.length} selected testing mode(s). Review all content below before publishing.`,
      });
    } catch (err: any) {
      clearInterval(stageInterval);
      setShowQuestionPreview(false);
      setActionMsg({
        type: 'error',
        text: err?.response?.data?.error || err?.message || 'Failed to generate assessment content. Preserving draft.',
      });
    } finally {
      clearInterval(stageInterval);
      setGenerating(false);
    }
  };

  // STEP 4: Publish
  const handlePublish = async () => {
    if (!selectedAssessment || publishing) return;
    setPublishing(true);
    setActionMsg(null);

    try {
      await lecturerApi.updateAssessment(selectedAssessment.id, {
        status: 'published',
        selected_modes: selectedModes,
        activity_config: modeConfigs,
      });

      setActionMsg({
        type: 'success',
        text: 'Assessment published successfully to students. Status: Published.',
      });

      await loadAssessmentDetail(selectedAssessment.id);
      fetchAssessments();
    } catch (err: any) {
      setActionMsg({
        type: 'error',
        text: err?.response?.data?.error || 'Failed to publish assessment.',
      });
    } finally {
      setPublishing(false);
    }
  };

  // Delete single question
  const handleDeleteQuestion = async (qId: number) => {
    if (!window.confirm('Remove this question from the assessment?')) return;
    try {
      await lecturerApi.deleteQuestion(qId);
      loadAssessmentDetail(selectedAssessment.id);
      setActionMsg({ type: 'success', text: 'Question removed from preview.' });
    } catch (err) {
      console.error(err);
    }
  };

  // Regenerate single question
  const handleRegenerateQuestion = async (qId: number) => {
    setRegeneratingQId(qId);
    try {
      await lecturerApi.regenerateQuestion(qId, selectedMaterialIds);
      await loadAssessmentDetail(selectedAssessment.id);
      setActionMsg({ type: 'success', text: 'Question regenerated successfully.' });
    } catch (err: any) {
      setActionMsg({ type: 'error', text: 'Failed to regenerate question.' });
    } finally {
      setRegeneratingQId(null);
    }
  };

  // Save edited question
  const handleSaveEditedQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    try {
      const payload: any = {
        prompt: editingQuestion.prompt,
        explanation: editingQuestion.explanation,
        marks: editingQuestion.marks,
        timer_seconds: editingQuestion.timer_seconds,
        topic_tag: editingQuestion.topic_tag,
      };

      if (editingQuestion.options && editingQuestion.options.length > 0) {
        payload.options = editingQuestion.options;
      }
      if (editingQuestion.matching_pairs) {
        payload.matching_pairs = editingQuestion.matching_pairs;
      }
      if (editingQuestion.marking_rubric) {
        payload.marking_rubric = editingQuestion.marking_rubric;
      }

      await lecturerApi.updateQuestion(editingQuestion.id, payload);
      setActionMsg({ type: 'success', text: 'Question changes saved successfully.' });
      setEditingQuestion(null);
      loadAssessmentDetail(selectedAssessment.id);
    } catch (err: any) {
      setActionMsg({ type: 'error', text: 'Failed to update question.' });
    }
  };

  // Move question up or down
  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (!selectedAssessment?.questions) return;
    const questions = [...selectedAssessment.questions];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    const [moved] = questions.splice(index, 1);
    questions.splice(targetIdx, 0, moved);
    setSelectedAssessment({
      ...selectedAssessment,
      questions,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  // Filter questions based on selected modes
  const allActiveQuestions = (selectedAssessment?.questions || []).filter((q: any) => {
    if ((q.question_type === 'mcq' || q.question_type === 'trivia') && selectedModes.includes('trivia')) return true;
    if (q.question_type === 'multi_select' && selectedModes.includes('multi_select')) return true;
    if (q.question_type === 'fill_blanks' && selectedModes.includes('fill_blanks')) return true;
    if (q.question_type === 'flashcard' && selectedModes.includes('flashcards')) return true;
    if (q.question_type === 'matching' && selectedModes.includes('matching')) return true;
    if (q.question_type === 'drag_drop' && selectedModes.includes('drag_drop')) return true;
    if ((q.question_type === 'written' || q.question_type === 'scenario') && selectedModes.includes('scenario')) return true;
    if (q.question_type === 'case_study' && selectedModes.includes('case_study')) return true;
    return false;
  });

  // Filter for tab in preview
  const previewQuestions = allActiveQuestions.filter((q: any) => {
    if (previewFilterMode === 'all') return true;
    if (previewFilterMode === 'trivia') return q.question_type === 'trivia' || q.question_type === 'mcq';
    if (previewFilterMode === 'scenario') return q.question_type === 'scenario' || q.question_type === 'written';
    return q.question_type === previewFilterMode;
  });

  // Stats calculation
  const totalPreviewMarks = allActiveQuestions.reduce((sum: number, q: any) => sum + (Number(q.marks) || 0), 0);
  const totalPreviewQuestions = allActiveQuestions.length;

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
          <h1 className="text-2xl font-bold text-slate-900">Lab Assessment Builder</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Select testing modes &rarr; Configure activities &rarr; Generate with AI &rarr; Preview all questions &rarr; Publish to students.
          </p>
        </div>

        {selectedAssessment && (
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                selectedAssessment.status === 'published'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${selectedAssessment.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              Status: <strong className="capitalize">{selectedAssessment.status}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Confirmation Notification Alert */}
      {actionMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="text-sm">{actionMsg.text}</span>
          </div>
          <button onClick={() => setActionMsg(null)} className="font-bold underline ml-4 hover:opacity-80">
            Dismiss
          </button>
        </div>
      )}

      {/* Assessment Selector Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Assessment:</span>
          {assessments.map((ass) => {
            const isSelected = selectedAssessment?.id === ass.id;
            return (
              <button
                key={ass.id}
                onClick={() => loadAssessmentDetail(ass.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{ass.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded capitalize ${
                    ass.status === 'published' ? 'bg-brand-200 text-brand-900' : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {ass.status}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Builder Workspace */}
      {selectedAssessment && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-6 pt-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab('builder')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                activeTab === 'builder'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" /> Lab Assessment Builder Workflow
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                activeTab === 'questions'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" /> Active Pool ({allActiveQuestions.length})
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                activeTab === 'practice'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-purple-600" /> Quick Practice Questions
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                activeTab === 'materials'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Curriculum Materials ({materials.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                activeTab === 'settings'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4" /> Assessment Policy & Marks
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                activeTab === 'preview'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Eye className="w-4 h-4" /> Student View Simulation
            </button>
          </div>

          <div className="p-6">
            {/* TAB: 4-STEP ASSESSMENT BUILDER */}
            {activeTab === 'builder' && (
              <div className="space-y-8">
                {/* ======================================================== */}
                {/* STEP 1: CURRICULUM SOURCE MATERIALS */}
                {/* ======================================================== */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                        1
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Step 1: Curriculum Source Materials</h3>
                        <p className="text-xs text-slate-500">
                          AI generation grounds all assessment questions in these materials (PDF notes, diagrams, YouTube references, and lecture summaries).
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                      {materials.length} Resource(s) Available
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Computer File Upload Area */}
                    <form onSubmit={handleUploadComputerFile} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Upload className="w-4 h-4 text-brand-600" /> Upload Handout or Resource
                        </span>
                        <span className="text-[10px] text-slate-400">PDF, DOCX, TXT, PNG, JPG</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Resource Category</label>
                        <select
                          value={fileCategory}
                          onChange={(e: any) => setFileCategory(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="pdf">PDF Handout</option>
                          <option value="notes">Lecture Notes Document</option>
                          <option value="image">SDLC Diagram or Image</option>
                          <option value="resource">Other Learning Resource</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Resource Title (Optional)</label>
                        <input
                          type="text"
                          value={fileTitle}
                          onChange={(e) => setFileTitle(e.target.value)}
                          placeholder="e.g. SDLC Complete Phase Guide"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Choose Computer File *</label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
                          required
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setSelectedFile(e.target.files[0]);
                              if (!fileTitle) {
                                setFileTitle(e.target.files[0].name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
                              }
                            }
                          }}
                          className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={uploadingFile || !selectedFile}
                        className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingFile ? 'Uploading to Server...' : 'Upload File to Assessment'}</span>
                      </button>
                    </form>

                    {/* YouTube Video URL & Summarized Notes */}
                    <div className="space-y-4">
                      {/* YouTube URL field */}
                      <form onSubmit={handleSaveYouTubeUrl} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-rose-600" /> YouTube Video Reference
                        </span>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                          <button
                            type="submit"
                            disabled={savingYoutube || !youtubeUrl.trim()}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 whitespace-nowrap"
                          >
                            {savingYoutube ? 'Saving...' : 'Save URL'}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400">Embeds an SDLC video lecture directly into student learning area.</p>
                      </form>

                      {/* Summarized Lecture Note */}
                      <form onSubmit={handleSaveSummarizedNote} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-indigo-600" /> Summarized Lecture Note
                        </span>
                        <textarea
                          rows={3}
                          value={summarizedNote}
                          onChange={(e) => setSummarizedNote(e.target.value)}
                          placeholder="Add or edit summarized SDLC lecture notes for students..."
                          className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed font-sans"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={savingNote || !summarizedNote.trim()}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                          >
                            {savingNote ? 'Saving Notes...' : 'Save Summarized Note'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Uploaded Materials List */}
                  {materials.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                        Currently Uploaded Resources:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {materials.map((mat) => (
                          <div
                            key={mat.id}
                            className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-sm"
                          >
                            <div className="truncate space-y-0.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                {mat.material_type}
                              </span>
                              <h5 className="text-xs font-bold text-slate-900 truncate">{mat.title}</h5>
                              {mat.file_size > 0 && (
                                <span className="text-[10px] text-slate-400 block">{formatFileSize(mat.file_size)}</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteMaterial(mat.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition"
                              title="Delete resource"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ======================================================== */}
                {/* STEP 2: MODES FOR TESTING THE STUDENT */}
                {/* ======================================================== */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                        2
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Step 2: Modes for Testing the Student</h3>
                        <p className="text-xs text-slate-500">
                          Select and configure the assessment modes students must complete. Group work is omitted until collaborative scoring is available.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 border border-brand-200">
                        {selectedModes.length} Mode(s) Selected
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedModes(TESTING_MODES_DEF.map((m) => m.id))}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-800 underline"
                      >
                        Select All
                      </button>
                    </div>
                  </div>

                  {/* CATEGORY 1: KNOWLEDGE CHECKS */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-brand-600" />
                        Knowledge Checks (Foundational Recall & Verification)
                      </h4>
                      <span className="text-[11px] text-slate-400">Flashcards default to ungraded revision</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      {TESTING_MODES_DEF.filter((m) => m.category === 'knowledge').map((mode) => {
                        const isChecked = selectedModes.includes(mode.id);
                        const cfg = modeConfigs[mode.id] || mode.defaultConfig;
                        const isFlashcard = mode.id === 'flashcards';
                        const isGraded = isFlashcard ? cfg.is_graded : true;
                        const totalMarks = isGraded ? cfg.count * cfg.marks_per_item : 0;

                        return (
                          <div
                            key={mode.id}
                            className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                              isChecked
                                ? 'border-brand-500 bg-brand-50/30 shadow-sm ring-1 ring-brand-500/20'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <button
                                  type="button"
                                  onClick={() => toggleMode(mode.id)}
                                  className="text-left font-bold text-xs text-slate-900 hover:text-brand-600 flex-1"
                                >
                                  {mode.label}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleMode(mode.id)}
                                  className={`w-5 h-5 rounded-md flex items-center justify-center transition shrink-0 ${
                                    isChecked ? 'bg-brand-600 text-white' : 'border border-slate-300 bg-white'
                                  }`}
                                  aria-label={`Toggle ${mode.label}`}
                                >
                                  {isChecked && <Check className="w-3.5 h-3.5" />}
                                </button>
                              </div>

                              {/* Badges: Count, Marks, Timer, Graded status */}
                              <div className="flex flex-wrap gap-1.5 mb-2.5">
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                  {cfg.count} {isFlashcard ? 'Cards' : 'Questions'}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    isGraded
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-indigo-100 text-indigo-800'
                                  }`}
                                >
                                  {isGraded ? `${totalMarks} Marks` : 'Ungraded Revision'}
                                </span>
                                {cfg.timer_seconds > 0 ? (
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-800 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-amber-600" /> {cfg.timer_seconds}s
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                                    No Timer
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3 mb-3">
                                {mode.desc}
                              </p>
                            </div>

                            {/* Configure Button */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 capitalize">
                                Difficulty: <strong className="text-slate-700">{cfg.difficulty}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isChecked) toggleMode(mode.id);
                                  setConfiguringModeId(mode.id);
                                }}
                                className="text-[11px] font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                              >
                                <Settings2 className="w-3.5 h-3.5" /> Configure
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* CATEGORY 2: APPLICATION & PROBLEM-SOLVING */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-purple-600" />
                        Application & Problem-Solving (Practical Tasks & Enterprise Cases)
                      </h4>
                      <span className="text-[11px] text-slate-400">Scored activities with rubrics & timers</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      {TESTING_MODES_DEF.filter((m) => m.category === 'application').map((mode) => {
                        const isChecked = selectedModes.includes(mode.id);
                        const cfg = modeConfigs[mode.id] || mode.defaultConfig;
                        const totalMarks = cfg.count * cfg.marks_per_item;

                        return (
                          <div
                            key={mode.id}
                            className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                              isChecked
                                ? 'border-purple-500 bg-purple-50/20 shadow-sm ring-1 ring-purple-500/20'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <button
                                  type="button"
                                  onClick={() => toggleMode(mode.id)}
                                  className="text-left font-bold text-xs text-slate-900 hover:text-purple-600 flex-1"
                                >
                                  {mode.label}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleMode(mode.id)}
                                  className={`w-5 h-5 rounded-md flex items-center justify-center transition shrink-0 ${
                                    isChecked ? 'bg-purple-600 text-white' : 'border border-slate-300 bg-white'
                                  }`}
                                  aria-label={`Toggle ${mode.label}`}
                                >
                                  {isChecked && <Check className="w-3.5 h-3.5" />}
                                </button>
                              </div>

                              {/* Badges */}
                              <div className="flex flex-wrap gap-1.5 mb-2.5">
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                  {cfg.count} {cfg.count === 1 ? 'Task' : 'Tasks'}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                  Graded • {totalMarks} Marks
                                </span>
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-800 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-600" /> {cfg.timer_seconds}s
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3 mb-3">
                                {mode.desc}
                              </p>
                            </div>

                            {/* Configure Button */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 capitalize">
                                Difficulty: <strong className="text-slate-700">{cfg.difficulty}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isChecked) toggleMode(mode.id);
                                  setConfiguringModeId(mode.id);
                                }}
                                className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                              >
                                <Settings2 className="w-3.5 h-3.5" /> Configure
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ======================================================== */}
                {/* STEP 3: GENERATE QUESTIONS WITH AI & PREVIEW */}
                {/* ======================================================== */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                        3
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Step 3: Generate Questions with AI & Preview</h3>
                        <p className="text-xs text-slate-500">
                          Prepares authoritative assessment activities for all {selectedModes.length} selected mode(s) grounded in your curriculum materials.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={handleGenerateQuestionsWithAI}
                        disabled={generating || selectedModes.length === 0}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-700 hover:to-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>{generating ? 'Generating Content with AI...' : 'Generate Questions with AI'}</span>
                      </button>
                    </div>
                  </div>

                  {/* GENERATING STATE WITH ROTATING MESSAGES */}
                  {generating && (
                    <div className="py-12 px-6 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-center space-y-4">
                      <div className="flex items-center justify-center">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                          <Sparkles className="w-5 h-5 text-amber-500 absolute inset-0 m-auto animate-pulse" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 animate-pulse">
                          {generationStageText}
                        </h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          Analyzing curriculum materials, formulating question banks, and synthesizing rubrics across your selected testing modes...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* INITIAL UNGENERATED STATE */}
                  {!generating && !showQuestionPreview && (
                    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">
                        Generate your assessment to review the questions before publishing.
                      </p>
                      <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                        Click "Generate Questions with AI" above to review the questions before publishing.
                      </p>
                    </div>
                  )}

                  {/* PREVIEW CONTAINER (Revealed ONLY after generation succeeds) */}
                  {!generating && showQuestionPreview && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                            Lecturer Comprehensive Preview
                          </h4>
                        <p className="text-[11px] text-slate-500">
                          Total Active Questions: <strong>{totalPreviewQuestions}</strong> • Total Available Marks: <strong>{totalPreviewMarks} pts</strong>
                        </p>
                      </div>

                      {/* Filter by Mode Tabs */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        <button
                          type="button"
                          onClick={() => setPreviewFilterMode('all')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                            previewFilterMode === 'all'
                              ? 'bg-slate-900 text-white'
                              : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          All ({allActiveQuestions.length})
                        </button>
                        {selectedModes.map((modeId) => {
                          const mDef = TESTING_MODES_DEF.find((m) => m.id === modeId);
                          if (!mDef) return null;
                          const count = allActiveQuestions.filter((q: any) => {
                            if (modeId === 'trivia') return q.question_type === 'trivia' || q.question_type === 'mcq';
                            if (modeId === 'scenario') return q.question_type === 'scenario' || q.question_type === 'written';
                            return q.question_type === modeId;
                          }).length;

                          return (
                            <button
                              key={modeId}
                              type="button"
                              onClick={() => setPreviewFilterMode(modeId)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                                previewFilterMode === modeId
                                  ? 'bg-brand-600 text-white'
                                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                              }`}
                            >
                              {mDef.label} ({count})
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {previewQuestions.length === 0 ? (
                      <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2">
                        <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
                        <h5 className="text-xs font-bold text-slate-800">No Assessment Content Previewed Yet</h5>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          Click <strong>"Generate Questions with AI"</strong> above to populate authentic SDLC questions and activities for all selected modes.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {previewQuestions.map((q: any, idx: number) => {
                          const isRegenerating = regeneratingQId === q.id;

                          return (
                            <div
                              key={q.id}
                              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-sm space-y-3"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                    #{idx + 1}
                                  </span>
                                  <span className="font-bold uppercase text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded text-[10px]">
                                    {q.question_type}
                                  </span>
                                  <span className="font-semibold text-slate-700 text-[11px]">
                                    {q.marks} Mark(s)
                                  </span>
                                  {q.timer_seconds > 0 && (
                                    <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-amber-600" /> {q.timer_seconds}s Timer
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-500">
                                    Topic: <strong>{q.topic_tag || 'SDLC'}</strong>
                                  </span>
                                </div>

                                {/* Question action buttons: Edit, Regenerate, Move, Delete */}
                                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveQuestion(idx, 'up')}
                                    disabled={idx === 0}
                                    title="Move question up"
                                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                  >
                                    <MoveUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveQuestion(idx, 'down')}
                                    disabled={idx === previewQuestions.length - 1}
                                    title="Move question down"
                                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                  >
                                    <MoveDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingQuestion(q)}
                                    className="px-2 py-1 text-[11px] font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-md transition flex items-center gap-1"
                                  >
                                    <Edit3 className="w-3 h-3" /> Edit
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isRegenerating}
                                    onClick={() => handleRegenerateQuestion(q.id)}
                                    className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition flex items-center gap-1 disabled:opacity-50"
                                  >
                                    <RotateCcw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                                    <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                                    title="Delete question"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Question prompt */}
                              <div className="text-xs font-bold text-slate-900 leading-snug">
                                {q.prompt}
                              </div>

                              {/* MCQ & Multi-Select Options Preview */}
                              {q.options && q.options.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                  {q.options.map((opt: any) => (
                                    <div
                                      key={opt.id || opt.order}
                                      className={`text-xs px-3 py-1.5 rounded-lg flex items-center justify-between ${
                                        opt.is_correct
                                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold'
                                          : 'bg-slate-50 text-slate-700 border border-slate-200'
                                      }`}
                                    >
                                      <span>{opt.option_text}</span>
                                      {opt.is_correct && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white flex items-center gap-0.5">
                                          <Check className="w-3 h-3" /> Correct
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Fill in Blanks Preview */}
                              {q.question_type === 'fill_blanks' && (
                                <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs text-indigo-900 space-y-1">
                                  <span className="font-bold block text-[10px] uppercase text-indigo-700">Accepted Answers / Blanks:</span>
                                  <p className="font-mono text-[11px] text-indigo-800">
                                    {Array.isArray(q.config?.accepted_answers)
                                      ? q.config.accepted_answers.join(' | ')
                                      : 'Requirements Analysis, Planning'}
                                  </p>
                                </div>
                              )}

                              {/* Flashcards Preview */}
                              {q.question_type === 'flashcard' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                  <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
                                    <strong className="text-amber-900 block text-[10px] uppercase mb-0.5">Card Front (Concept):</strong>
                                    <span className="text-slate-800">{q.prompt}</span>
                                  </div>
                                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                                    <strong className="text-emerald-900 block text-[10px] uppercase mb-0.5">Card Back (Explanation):</strong>
                                    <span className="text-slate-800">{q.explanation}</span>
                                  </div>
                                </div>
                              )}

                              {/* Matching Pairs preview */}
                              {q.matching_pairs && q.matching_pairs.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                  {q.matching_pairs.map((pair: any, pIdx: number) => (
                                    <div key={pIdx} className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                                      <strong className="text-brand-900">{pair.term || pair.phase}:</strong>{' '}
                                      <span className="text-slate-600">{pair.definition || `Order position: ${pair.order}`}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Case Study Background */}
                              {q.config?.case_description && (
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
                                  <strong className="text-slate-900 block text-[11px]">Case Study Scenario:</strong>
                                  <p className="text-[11px] leading-relaxed text-slate-600">{q.config.case_description}</p>
                                </div>
                              )}

                              {/* Explanation & Marking Rubric */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                                {q.explanation && (
                                  <div className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                    <strong className="text-slate-800">Explanation:</strong> {q.explanation}
                                  </div>
                                )}
                                {q.marking_rubric && (
                                  <div className="text-amber-900 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200">
                                    <strong className="text-amber-800">Marking Rubric:</strong> {q.marking_rubric}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                </div>

                {/* ======================================================== */}
                {/* STEP 4: PUBLISH TO STUDENTS (Only when valid preview exists) */}
                {/* ======================================================== */}
                {showQuestionPreview && allActiveQuestions.length > 0 && (
                  <div className="p-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
                          4
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-white">Step 4: Publish to Students</h3>
                          <p className="text-xs text-slate-300">
                            Saves all configured testing activities and publishes the assessment immediately to students.
                          </p>
                        </div>
                      </div>

                      {/* Publish to Students Button */}
                      <button
                        type="button"
                        onClick={handlePublish}
                        disabled={publishing || allActiveQuestions.length === 0}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition disabled:opacity-40 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{publishing ? 'Publishing Assessment...' : 'Publish to Students'}</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
                      <div className="flex items-center gap-3">
                        <span>
                          Status:{' '}
                          <strong className="text-emerald-400 capitalize">{selectedAssessment.status}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Total Active Questions: <strong className="text-white">{totalPreviewQuestions}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Total Marks: <strong className="text-emerald-400">{totalPreviewMarks} pts</strong>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Repeated publishing is safe and preserves all student attempt histories.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: QUESTIONS POOL */}
            {activeTab === 'questions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Active Questions Pool ({allActiveQuestions.length})</h3>
                    <p className="text-xs text-slate-500">
                      Manage individual questions across all 8 assessment activity types.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Custom Question
                  </button>
                </div>

                <div className="space-y-3">
                  {allActiveQuestions.map((q: any, idx: number) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                            #{idx + 1}
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                            {q.question_type}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {q.marks} Marks • {q.timer_seconds || 15}s timer
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">{q.prompt}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingQuestion(q)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 transition"
                          title="Edit question"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                          title="Delete question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: MATERIALS */}
            {activeTab === 'materials' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Uploaded Teaching Materials</h3>
                  <button
                    onClick={() => setActiveTab('builder')}
                    className="text-xs font-bold text-brand-700 underline"
                  >
                    Go to Upload Area &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {materials.map((mat) => (
                    <div key={mat.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {mat.material_type}
                        </span>
                        <button
                          onClick={() => handleDeleteMaterial(mat.id)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{mat.title}</h4>
                      {mat.description && <p className="text-xs text-slate-500">{mat.description}</p>}
                      {mat.url && (
                        <a
                          href={mat.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-600 underline truncate block"
                        >
                          {mat.url}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="max-w-xl space-y-4">
                <h3 className="text-base font-bold text-slate-900">Assessment Policy & Marks</h3>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Total Assessment Marks</label>
                    <input
                      type="text"
                      disabled
                      value={`${totalPreviewMarks || selectedAssessment.total_marks || 16} pts`}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Passing Threshold</label>
                    <input
                      type="text"
                      disabled
                      value={`${selectedAssessment.passing_threshold || 66.67}%`}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-brand-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Student Attempt Policy</label>
                    <input
                      type="text"
                      disabled
                      value="Laboratory practice allows continuous retakes for skill mastery"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-emerald-800 font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PREVIEW */}
            {activeTab === 'preview' && (
              <div className="space-y-4">
                <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-900 flex items-center justify-between">
                  <span>Student View Mode • Interactive simulation</span>
                  <Link to={`/student/lab/${selectedAssessment.id}`} className="font-bold text-brand-700 underline">
                    Open Live Student Lab Area &rarr;
                  </Link>
                </div>
              </div>
            )}

            {/* TAB: MANAGE PRACTICE QUESTIONS */}
            {activeTab === 'practice' && (
              <div className="space-y-4">
                <LecturerPracticeQuestionsManager
                  unitId={Number(unitId)}
                  assessmentId={selectedAssessment.id}
                  selectedAssessment={selectedAssessment}
                  assessments={assessments}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE CONFIGURATION MODAL */}
      {/* ======================================================== */}
      {configuringModeId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto space-y-4">
            {(() => {
              const modeDef = TESTING_MODES_DEF.find((m) => m.id === configuringModeId);
              if (!modeDef) return null;
              const cfg = modeConfigs[configuringModeId] || modeDef.defaultConfig;
              const isFlashcard = configuringModeId === 'flashcards';

              return (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                        Assessment Settings
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        Configure {modeDef.label}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfiguringModeId(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    {/* Graded vs Ungraded (Flashcards special case) */}
                    {isFlashcard && (
                      <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-indigo-900">Flashcard Grading Status</label>
                          <select
                            value={cfg.is_graded ? 'graded' : 'ungraded'}
                            onChange={(e) => {
                              const isGraded = e.target.value === 'graded';
                              updateModeConfigField('flashcards', 'is_graded', isGraded);
                              if (!isGraded) {
                                updateModeConfigField('flashcards', 'marks_per_item', 0);
                              } else {
                                updateModeConfigField('flashcards', 'marks_per_item', 1);
                              }
                            }}
                            className="px-2 py-1 bg-white border border-indigo-300 rounded-lg text-xs font-semibold"
                          >
                            <option value="ungraded">Ungraded Revision (Default, 0 Marks)</option>
                            <option value="graded">Scored Activity (Graded)</option>
                          </select>
                        </div>
                        <p className="text-[11px] text-indigo-700">
                          Flashcards default to ungraded revision so students can practice freely without altering official assessment marks.
                        </p>
                      </div>
                    )}

                    {/* Number of questions & Timer */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          {isFlashcard ? 'Number of Cards' : 'Number of Questions/Tasks'}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={cfg.count}
                          onChange={(e) =>
                            updateModeConfigField(configuringModeId, 'count', Math.max(1, parseInt(e.target.value) || 1))
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Time Limit (Seconds)</label>
                        <input
                          type="number"
                          min={0}
                          max={300}
                          value={cfg.timer_seconds}
                          onChange={(e) =>
                            updateModeConfigField(configuringModeId, 'timer_seconds', Math.max(0, parseInt(e.target.value) || 0))
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Marks per item & Difficulty */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Marks per Question/Activity</label>
                        <input
                          type="number"
                          step="0.5"
                          min={0}
                          value={cfg.marks_per_item}
                          disabled={isFlashcard && !cfg.is_graded}
                          onChange={(e) =>
                            updateModeConfigField(configuringModeId, 'marks_per_item', Math.max(0, parseFloat(e.target.value) || 0))
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Target Difficulty</label>
                        <select
                          value={cfg.difficulty}
                          onChange={(e: any) => updateModeConfigField(configuringModeId, 'difficulty', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                    </div>

                    {/* Topic or Learning Objective */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Topic / Learning Objective</label>
                      <input
                        type="text"
                        value={cfg.topic}
                        onChange={(e) => updateModeConfigField(configuringModeId, 'topic', e.target.value)}
                        placeholder="e.g. SDLC Phases, Requirement Analysis"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    {/* Scoring Method & Feedback Visibility */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Scoring Method</label>
                        <select
                          value={cfg.scoring_method}
                          onChange={(e: any) => updateModeConfigField(configuringModeId, 'scoring_method', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="standard">Standard Scoring</option>
                          <option value="partial">Partial Credit</option>
                          <option value="all_or_nothing">All or Nothing</option>
                          <option value="ungraded">Ungraded Revision</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Feedback Visibility</label>
                        <select
                          value={cfg.feedback_visibility}
                          onChange={(e: any) => updateModeConfigField(configuringModeId, 'feedback_visibility', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="after_submission">After Assessment Completion</option>
                          <option value="immediate">Immediate After Activity</option>
                        </select>
                      </div>
                    </div>

                    {/* Allow Retries */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="allowRetry"
                        checked={cfg.allow_retry}
                        onChange={(e) => updateModeConfigField(configuringModeId, 'allow_retry', e.target.checked)}
                        className="w-4 h-4 text-brand-600 rounded border-slate-300"
                      />
                      <label htmlFor="allowRetry" className="font-semibold text-slate-700">
                        Allow students to retry this activity during the lab
                      </label>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setConfiguringModeId(null)}
                        className="px-4 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700"
                      >
                        Save Configuration
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT QUESTION MODAL */}
      {/* ======================================================== */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                  Edit Question #{editingQuestion.id}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Edit {editingQuestion.question_type} Activity
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Question / Task Prompt *</label>
                <textarea
                  rows={3}
                  required
                  value={editingQuestion.prompt || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, prompt: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Marks</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingQuestion.marks || 0}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, marks: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Timer (Seconds)</label>
                  <input
                    type="number"
                    value={editingQuestion.timer_seconds || 15}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, timer_seconds: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Options editing for MCQ / Trivia */}
              {editingQuestion.options && editingQuestion.options.length > 0 && (
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700 uppercase">
                    Answer Options (Mark Correct Choice)
                  </label>
                  {editingQuestion.options.map((opt: any, optIdx: number) => (
                    <div key={opt.id || optIdx} className="flex items-center gap-2">
                      <input
                        type={editingQuestion.question_type === 'multi_select' ? 'checkbox' : 'radio'}
                        name="edit_correct_opt"
                        checked={opt.is_correct}
                        onChange={() => {
                          const updated = editingQuestion.options.map((o: any, idx: number) => {
                            if (editingQuestion.question_type === 'multi_select') {
                              return idx === optIdx ? { ...o, is_correct: !o.is_correct } : o;
                            }
                            return { ...o, is_correct: idx === optIdx };
                          });
                          setEditingQuestion({ ...editingQuestion, options: updated });
                        }}
                      />
                      <input
                        type="text"
                        value={opt.option_text}
                        onChange={(e) => {
                          const updated = [...editingQuestion.options];
                          updated[optIdx] = { ...updated[optIdx], option_text: e.target.value };
                          setEditingQuestion({ ...editingQuestion, options: updated });
                        }}
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Explanation</label>
                <textarea
                  rows={2}
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  placeholder="Explanation shown to students after submitting..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              {editingQuestion.marking_rubric !== undefined && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Marking Rubric</label>
                  <input
                    type="text"
                    value={editingQuestion.marking_rubric || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, marking_rubric: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700"
                >
                  Save Question Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MANUAL QUESTION MODAL */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add Custom Question</h3>
            <p className="text-xs text-slate-500 mb-4">Manually configure a question in this assessment.</p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!selectedAssessment) return;
                try {
                  const payload: any = {
                    assessment: selectedAssessment.id,
                    prompt: questionText,
                    question_type: qType,
                    marks,
                    timer_seconds: timeSeconds,
                    explanation,
                    topic_tag: topicTag,
                    order: (selectedAssessment.questions?.length || 0) + 1,
                  };
                  if (qType === 'mcq') {
                    payload.options = options.map((opt, i) => ({
                      option_text: opt.text,
                      is_correct: opt.is_correct,
                      order: i + 1,
                    }));
                  }
                  await lecturerApi.createQuestion(payload);
                  setActionMsg({ type: 'success', text: 'Question added successfully!' });
                  setShowAddModal(false);
                  setQuestionText('');
                  setExplanation('');
                  loadAssessmentDetail(selectedAssessment.id);
                } catch (err: any) {
                  setActionMsg({ type: 'error', text: 'Failed to add question.' });
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Question Prompt *</label>
                <textarea
                  rows={2}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the question prompt..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Type</label>
                  <select
                    value={qType}
                    onChange={(e) => setQType(e.target.value)}
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="mcq">MCQ</option>
                    <option value="flashcard">Flashcard</option>
                    <option value="written">Written</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Marks</label>
                  <input
                    type="number"
                    value={marks}
                    onChange={(e) => setMarks(Number(e.target.value))}
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Timer (s)</label>
                  <input
                    type="number"
                    value={timeSeconds}
                    onChange={(e) => setTimeSeconds(Number(e.target.value))}
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {qType === 'mcq' && (
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700 uppercase">Answer Options (Select correct)</label>
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct_opt"
                        checked={opt.is_correct}
                        onChange={() => {
                          const updated = options.map((o, idx) => ({ ...o, is_correct: idx === i }));
                          setOptions(updated);
                        }}
                      />
                      <input
                        type="text"
                        required
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...options];
                          updated[i].text = e.target.value;
                          setOptions(updated);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Explanation</label>
                <input
                  type="text"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explanation shown after answering..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
