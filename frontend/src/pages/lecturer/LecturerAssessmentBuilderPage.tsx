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
  FileCheck,
  AlertCircle,
  Video,
  Image as ImageIcon,
  BookOpen,
  CheckSquare,
  Square,
  Check,
  Send,
  HelpCircle,
  ListOrdered,
  Shuffle,
  Users,
} from 'lucide-react';

export const LecturerAssessmentBuilderPage: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<number | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'builder' | 'questions' | 'materials' | 'settings' | 'preview'>('builder');
  const [showQuestionPreview, setShowQuestionPreview] = useState(false);

  // Materials State
  const [materials, setMaterials] = useState<any[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<number[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showGroundedModal, setShowGroundedModal] = useState(false);

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
  // Available modes: Matching Exercise, Drag & Drop, Flashcards, What Would You Do? Scenario, Trivia Exercise, Group Work
  const [selectedModes, setSelectedModes] = useState<string[]>([
    'matching',
    'drag_drop',
    'flashcards',
    'scenario',
    'trivia',
  ]);

  const TESTING_MODES = [
    {
      id: 'matching',
      label: 'Matching Exercise',
      badge: '6 Marks • 30s Timer',
      desc: 'Match each SDLC phase (Planning, Analysis, Design, Implementation, Testing, Maintenance) to its primary purpose.',
    },
    {
      id: 'drag_drop',
      label: 'Drag & Drop',
      badge: '3 Marks • 20s Timer',
      desc: 'Arrange the 6 SDLC phases in correct sequential order from start to finish.',
    },
    {
      id: 'flashcards',
      label: 'Flashcards',
      badge: '3 Cards • Reveal on Click',
      desc: 'Interactive concept review cards with click-to-reveal answers (0 marks counted towards test score).',
    },
    {
      id: 'scenario',
      label: 'What Would You Do? Scenario',
      badge: '2 Marks • 25s Timer',
      desc: 'University library borrowing system scenario requiring written response (Analysis / requirements gathering).',
    },
    {
      id: 'trivia',
      label: 'Trivia Exercise',
      badge: '5 Questions • 15s Timer Each',
      desc: '5 beginner-friendly multiple choice questions covering SDLC definition, phases, and quality assurance.',
    },
    {
      id: 'group_work',
      label: 'Group Work',
      badge: 'Selectable • Classroom Activity',
      desc: 'Collaborative group exercise mode for workshop sessions (no automated test activity invented).',
    },
  ];

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
      fetchMaterials(id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMaterials = async (assessmentId: number) => {
    setLoadingMaterials(true);
    try {
      const res = await lecturerApi.getAssessmentMaterials(assessmentId);
      const mats = res.data || [];
      setMaterials(mats);

      // Preload summarized note or youtube URL if already present
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
    } finally {
      setLoadingMaterials(false);
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

  // Delete a material
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

  // STEP 3: Generate Questions with AI (Local pre-built SDLC content - ZERO Gemini/paid API calls)
  const handleGenerateQuestionsWithAI = async () => {
    if (!selectedAssessment || generating) return;
    setGenerating(true);
    setActionMsg(null);

    try {
      await lecturerApi.generateDemoContent(selectedAssessment.id, false, {
        modes: selectedModes,
      });

      // Reveal full preview on click
      setShowQuestionPreview(true);

      setActionMsg({
        type: 'success',
        text: 'Prepared SDLC activities generated successfully',
      });

      await loadAssessmentDetail(selectedAssessment.id);
    } catch (err: any) {
      setActionMsg({
        type: 'error',
        text: err?.response?.data?.error || 'Failed to generate prepared SDLC content.',
      });
    } finally {
      setGenerating(false);
    }
  };

  // STEP 4: Publish (Exact confirmation: "Completed")
  const handlePublish = async () => {
    if (!selectedAssessment || publishing) return;
    setPublishing(true);
    setActionMsg(null);

    try {
      await lecturerApi.updateAssessment(selectedAssessment.id, {
        status: 'published',
        selected_modes: selectedModes,
      });

      // EXACT required success message: "Completed"
      setActionMsg({
        type: 'success',
        text: 'Completed',
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
    if (!window.confirm('Delete this question?')) return;
    try {
      await lecturerApi.deleteQuestion(qId);
      loadAssessmentDetail(selectedAssessment.id);
      setActionMsg({ type: 'success', text: 'Question removed.' });
    } catch (err) {
      console.error(err);
    }
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

  // Filter preview questions based on selected testing modes
  const previewQuestions = (selectedAssessment?.questions || []).filter((q: any) => {
    if (q.question_type === 'mcq' && selectedModes.includes('trivia')) return true;
    if (q.question_type === 'flashcard' && selectedModes.includes('flashcards')) return true;
    if (q.question_type === 'written' && selectedModes.includes('scenario')) return true;
    if (q.question_type === 'drag_drop' && selectedModes.includes('drag_drop')) return true;
    if (q.question_type === 'matching' && selectedModes.includes('matching')) return true;
    return false;
  });

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
          <h1 className="text-2xl font-bold text-slate-900">SDLC Lab Assessment Builder</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure learning materials, select testing modes, generate prepared SDLC assessment activities, and publish.
          </p>
        </div>

        {selectedAssessment && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              Status: <strong className="capitalize text-slate-900">{selectedAssessment.status}</strong>
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
              <Sparkles className="w-4 h-4 text-amber-500" /> 4-Step Assessment Builder
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                activeTab === 'questions'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" /> Questions Pool ({selectedAssessment.questions?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                activeTab === 'materials'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Teaching Materials ({materials.length})
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
              <Eye className="w-4 h-4" /> Student View Preview
            </button>
          </div>

          <div className="p-6">
            {/* TAB: 4-STEP ASSESSMENT BUILDER */}
            {activeTab === 'builder' && (
              <div className="space-y-8">
                {/* ======================================================== */}
                {/* STEP 1: UPLOAD MATERIAL */}
                {/* ======================================================== */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                        1
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Step 1: Upload Material</h3>
                        <p className="text-xs text-slate-500">
                          Select files from your computer (PDF handout, lecture notes, SDLC diagram/image, learning resources), supply a YouTube URL, and edit summarized notes.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                      {materials.length} Resource(s) Uploaded
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Real Computer File Upload Area */}
                    <form onSubmit={handleUploadComputerFile} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Upload className="w-4 h-4 text-brand-600" /> Upload from Computer
                        </span>
                        <span className="text-[10px] text-slate-400">PDF, DOCX, TXT, PNG, JPG, WEBP</span>
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

                      {/* Real Computer File Input */}
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
                            className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xl shadow-slate-100"
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
                {/* STEP 2: SELECT TESTING MODES */}
                {/* ======================================================== */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                        2
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Step 2: Modes for Testing the Student</h3>
                        <p className="text-xs text-slate-500">
                          Select the interactive assessment activities to include in SDLC Lab 1.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-brand-700">
                      {selectedModes.length} Mode(s) Selected
                    </span>
                  </div>

                  {/* Multi-select control labelled "Modes for Testing the Student" */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {TESTING_MODES.map((mode) => {
                      const isChecked = selectedModes.includes(mode.id);
                      return (
                        <div
                          key={mode.id}
                          onClick={() => toggleMode(mode.id)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isChecked
                              ? 'border-brand-500 bg-brand-50/40 shadow-sm ring-1 ring-brand-500/30'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-slate-900">{mode.label}</span>
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                                  isChecked ? 'bg-brand-600 text-white' : 'border border-slate-300 bg-white'
                                }`}
                              >
                                {isChecked && <Check className="w-3.5 h-3.5" />}
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 inline-block mb-2">
                              {mode.badge}
                            </span>
                            <p className="text-[11px] text-slate-500 leading-relaxed">{mode.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ======================================================== */}
                {/* STEP 3: GENERATE QUESTIONS WITH AI */}
                {/* ======================================================== */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                        3
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Step 3: Generate Questions with AI</h3>
                        <p className="text-xs text-slate-500">
                          Loads prepared SDLC content matching your selected testing modes with zero network AI API calls.
                        </p>
                      </div>
                    </div>

                    {/* Button labelled Generate Questions with AI */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {showQuestionPreview && (
                        <button
                          type="button"
                          onClick={() => setShowQuestionPreview(false)}
                          className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                        >
                          Collapse Preview
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleGenerateQuestionsWithAI}
                        disabled={generating || selectedModes.length === 0}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>{generating ? 'Loading Prepared Activities...' : 'Generate Questions with AI'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Lecturer Preview Area — Collapsed by default until Generate Questions with AI is clicked */}
                  {showQuestionPreview && (
                    <div className="space-y-4 pt-1">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Lecturer Assessment Preview ({previewQuestions.length} Questions for Selected Modes)
                        </h4>
                        <span className="text-xs text-slate-500">
                          Review answers, explanations, timers and rubrics before publishing.
                        </span>
                      </div>

                      {previewQuestions.length === 0 ? (
                        <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2">
                          <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
                          <h5 className="text-xs font-bold text-slate-800">No Questions Previewed for Selected Modes</h5>
                          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                            Click <strong>"Generate Questions with AI"</strong> above to populate the prepared SDLC questions for your selected modes.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3.5">
                          {previewQuestions.map((q: any, idx: number) => (
                            <div
                              key={q.id}
                              className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition space-y-2"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                                    #{idx + 1}
                                  </span>
                                  <span className="font-bold uppercase text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded text-[10px]">
                                    {q.question_type}
                                  </span>
                                  <span className="font-medium text-slate-600 text-[11px]">
                                    {q.marks} Mark(s) • <Clock className="w-3 h-3 inline text-slate-400" /> {q.timer_seconds || 15}s Timer
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  Topic: {q.topic_tag}
                                </span>
                              </div>

                              <p className="text-xs font-bold text-slate-900 leading-snug">{q.prompt}</p>

                              {/* MCQ Options with marked correct answer */}
                              {q.options && q.options.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                  {q.options.map((opt: any) => (
                                    <div
                                      key={opt.id}
                                      className={`text-xs px-3 py-1.5 rounded-lg flex items-center justify-between ${
                                        opt.is_correct
                                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold'
                                          : 'bg-white text-slate-600 border border-slate-200'
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

                              {/* Matching Pairs preview */}
                              {q.matching_pairs && q.matching_pairs.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                  {q.matching_pairs.map((pair: any, pIdx: number) => (
                                    <div key={pIdx} className="text-xs p-2.5 rounded-lg bg-white border border-slate-200">
                                      <strong className="text-indigo-900">{pair.term || pair.phase}:</strong>{' '}
                                      <span className="text-slate-600">{pair.definition || `Order: ${pair.order}`}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Explanation / Rubric */}
                              {q.explanation && (
                                <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                                  <strong>Explanation:</strong> {q.explanation}
                                </div>
                              )}
                              {q.marking_rubric && (
                                <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-mono">
                                  <strong>Rubric:</strong> {q.marking_rubric}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ======================================================== */}
                {/* STEP 4: PUBLISH (Displayed after questions have been generated and previewed) */}
                {/* ======================================================== */}
                {showQuestionPreview && previewQuestions.length > 0 && (
                  <div className="p-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
                          4
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-white">Step 4: Publish Assessment</h3>
                          <p className="text-xs text-slate-300">
                            Save your selected testing modes and review configuration. Students can immediately access materials and take the lab.
                          </p>
                        </div>
                      </div>

                      {/* Publish Button */}
                      <button
                        type="button"
                        onClick={handlePublish}
                        disabled={publishing}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{publishing ? 'Publishing...' : 'Publish'}</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                      <span>
                        Current Status: <strong className="text-white capitalize">{selectedAssessment.status}</strong> • Total Marks:{' '}
                        <strong className="text-emerald-400">{selectedAssessment.total_marks} pts</strong>
                      </span>
                      <span>Publishing does not duplicate existing questions or attempts.</span>
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
                    <h3 className="text-base font-bold text-slate-900">Assessment Questions Pool</h3>
                    <p className="text-xs text-slate-500">
                      Manage and review individual questions across all activity types.
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
                  {selectedAssessment.questions?.map((q: any, idx: number) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
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

                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                <h3 className="text-base font-bold text-slate-900">Lab Policy & Marks</h3>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Total Marks</label>
                    <input
                      type="text"
                      disabled
                      value={`${selectedAssessment.total_marks || 16} pts`}
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
                    <label className="font-bold text-slate-700 block mb-1">Retake Limit</label>
                    <input
                      type="text"
                      disabled
                      value="Up to 3 retakes permitted"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700"
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
          </div>
        </div>
      )}

      {/* MANUAL QUESTION MODAL */}
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
