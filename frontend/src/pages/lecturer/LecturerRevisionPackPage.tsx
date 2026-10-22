import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lecturerApi } from '../../api/client';
import {
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  FileText,
  Star,
  Sparkles,
  Upload,
  AlertCircle
} from 'lucide-react';

export const LecturerRevisionPackPage: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const [packData, setPackData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);

  // Topic Form
  const [topicName, setTopicName] = useState('');
  const [subtopics, setSubtopics] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [justification, setJustification] = useState('');

  // Resource Form
  const [resTitle, setResTitle] = useState('');
  const [resType, setResType] = useState('summary');
  const [resSummary, setResSummary] = useState('');
  const [resContent, setResContent] = useState('');

  const fetchPack = async () => {
    if (!unitId) return;
    try {
      const res = await lecturerApi.getRevisionPack(Number(unitId));
      setPackData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPack();
  }, [unitId]);

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitId) return;
    try {
      await lecturerApi.createRevisionTopic(Number(unitId), {
        topic_name: topicName,
        subtopics,
        priority,
        justification,
        is_published: true,
      });
      setActionMsg({ type: 'success', text: 'Lecturer recommended topic published to cohort!' });
      setShowTopicModal(false);
      setTopicName('');
      setSubtopics('');
      setJustification('');
      fetchPack();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: 'Failed to add topic.' });
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitId) return;
    try {
      await lecturerApi.createRevisionResource(Number(unitId), {
        title: resTitle,
        resource_type: resType,
        summary: resSummary,
        content_text: resContent,
        is_published: true,
      });
      setActionMsg({ type: 'success', text: 'Revision pack document published to cohort!' });
      setShowResourceModal(false);
      setResTitle('');
      setResSummary('');
      setResContent('');
      fetchPack();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: 'Failed to add revision resource.' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const topics = packData?.recommended_topics || [];
  const resources = packData?.resources || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            to="/lecturer/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-brand-600" />
            Consolidated Revision Pack Editor
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Software Engineering (SE401) • Author faculty-recommended exam focal areas, past-paper hints, and comprehensive summaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTopicModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Recommend Exam Topic
          </button>
          <button
            onClick={() => setShowResourceModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            <Upload className="w-4 h-4" /> Add Revision Doc
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between ${
          actionMsg.type === 'success' ? 'bg-brand-50 text-brand-900 border border-brand-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)} className="font-bold underline ml-4">Dismiss</button>
        </div>
      )}

      {/* Recommended Topics Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" /> Faculty Recommended Exam Topics ({topics.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These topics are automatically ingested into the student Final Readiness Assessment pool.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map((t: any) => (
            <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  t.priority === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {t.priority} Priority
                </span>
                <span className="text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 font-semibold">
                  Published to Cohort
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{t.topic_name || t.title}</h3>
              <p className="text-xs text-slate-600"><strong>Subtopics:</strong> {t.subtopics || t.description}</p>
              {(t.justification || t.rationale) && (
                <p className="text-xs text-slate-500 italic">Lecturer note: {t.justification || t.rationale}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Revision Resources Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" /> Revision Packs & Practice Packs ({resources.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive reference documents available to students prior to the final readiness exam.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {resources.map((res: any) => (
            <div key={res.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                  {res.resource_type}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{res.title}</h3>
                <p className="text-xs text-slate-600 mt-0.5">{res.summary}</p>
              </div>

              <span className="text-xs font-semibold text-brand-700 bg-brand-100 px-2.5 py-1 rounded-full">
                Active
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Topic Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Recommend Exam Topic</h3>
            <p className="text-xs text-slate-500 mb-4">Focus student revision efforts on critical curriculum milestones.</p>

            <form onSubmit={handleAddTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Topic Name *</label>
                <input
                  type="text"
                  required
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  placeholder="e.g. Scrum Roles and Ceremonies"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subtopics *</label>
                <input
                  type="text"
                  required
                  value={subtopics}
                  onChange={(e) => setSubtopics(e.target.value)}
                  placeholder="Product Owner, Scrum Master, Sprint Backlog, Daily Standup"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lecturer Justification</label>
                <textarea
                  rows={2}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Essential for question 3 on systems engineering..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
                >
                  Publish Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resource Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add Revision Document</h3>
            <p className="text-xs text-slate-500 mb-4">Attach revision notes or past-paper solution guidelines.</p>

            <form onSubmit={handleAddResource} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder="e.g. SDLC Comprehensive Review Guide"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Resource Type</label>
                <select
                  value={resType}
                  onChange={(e) => setResType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="summary">Consolidated Summary</option>
                  <option value="past_paper">Past Paper Review</option>
                  <option value="practice_questions">Practice Question Pack</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Summary</label>
                <textarea
                  rows={2}
                  value={resSummary}
                  onChange={(e) => setResSummary(e.target.value)}
                  placeholder="Key concepts, diagrams, and methodologies..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResourceModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm"
                >
                  Publish Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
