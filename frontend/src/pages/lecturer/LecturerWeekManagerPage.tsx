import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lecturerApi } from '../../api/client';
import {
  Calendar,
  FileText,
  Video,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  Clock,
  Plus,
  ArrowLeft,
  Eye,
  Trash2,
  ExternalLink,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const LecturerWeekManagerPage: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const [weeks, setWeeks] = useState<any[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<any | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewWeekModal, setShowNewWeekModal] = useState(false);
  const [unitDetail, setUnitDetail] = useState<any | null>(null);
  const [newWeekTitle, setNewWeekTitle] = useState('');
  const [newWeekDesc, setNewWeekDesc] = useState('');
  const [creatingWeek, setCreatingWeek] = useState(false);
  const [title, setTitle] = useState('');
  const [materialType, setMaterialType] = useState('notes');
  const [description, setDescription] = useState('');
  const [contentText, setContentText] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(true);

  const fetchWeeks = async () => {
    if (!unitId) return;
    try {
      const res = await lecturerApi.getWeeks(Number(unitId));
      const weeksList = Array.isArray(res.data) ? res.data : (res.data?.weeks || []);
      const unitObj = res.data?.unit || null;
      setWeeks(weeksList);
      if (unitObj) setUnitDetail(unitObj);
      if (weeksList.length > 0) {
        const initial = selectedWeek ? weeksList.find((w: any) => w.id === selectedWeek.id) || weeksList[0] : weeksList[0];
        setSelectedWeek(initial);
        fetchMaterials(initial.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async (weekId: number) => {
    try {
      const res = await lecturerApi.getMaterials(weekId);
      setMaterials(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWeeks();
  }, [unitId]);

  const handleSelectWeek = (week: any) => {
    setSelectedWeek(week);
    fetchMaterials(week.id);
    setMessage(null);
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeek) return;
    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('week', selectedWeek.id.toString());
      formData.append('title', title);
      formData.append('material_type', materialType);
      formData.append('description', description);
      formData.append('content_text', contentText);
      formData.append('youtube_url', youtubeUrl);
      formData.append('is_published', isPublished.toString());
      if (file) {
        formData.append('file', file);
      }

      await lecturerApi.createMaterial(formData);
      setMessage({ type: 'success', text: 'Material successfully created and published!' });
      setShowUploadModal(false);
      // Reset form
      setTitle('');
      setDescription('');
      setContentText('');
      setYoutubeUrl('');
      setFile(null);
      fetchMaterials(selectedWeek.id);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.error || err?.response?.data?.file?.[0] || 'Failed to upload material. Ensure file is under 15MB and safe format.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (matId: number) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await lecturerApi.deleteMaterial(matId);
      if (selectedWeek) fetchMaterials(selectedWeek.id);
      setMessage({ type: 'success', text: 'Resource deleted.' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateWeek = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitId) return;
    setCreatingWeek(true);
    try {
      const res = await lecturerApi.createWeek(Number(unitId), {
        title: newWeekTitle,
        description: newWeekDesc,
      });
      setMessage({ type: 'success', text: `Week ${res.data.week_number} successfully added to curriculum!` });
      setShowNewWeekModal(false);
      setNewWeekTitle('');
      setNewWeekDesc('');
      await fetchWeeks();
      setSelectedWeek(res.data);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.error || 'Failed to create new week slot.' });
    } finally {
      setCreatingWeek(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/lecturer/units"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Assigned Units
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Curriculum & Practical Lab Manager</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {unitDetail ? `${unitDetail.name} (${unitDetail.code})` : 'Software Engineering (RCS 305)'} • Flexible week curation, lab assessments, and syllabus materials.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Material to Week {selectedWeek?.week_number}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between ${
          message.type === 'success' ? 'bg-brand-50 text-brand-900 border border-brand-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold underline ml-4">Dismiss</button>
        </div>
      )}

      {/* Week Selector Chips */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {weeks.map((w) => {
            const isSelected = selectedWeek?.id === w.id;
            return (
              <button
                key={w.id}
                onClick={() => handleSelectWeek(w)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>Week {w.week_number}</span>
                {w.week_number === 1 && (
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-brand-300' : 'bg-brand-500'}`} />
                )}
              </button>
            );
          })}
          <button
            onClick={() => setShowNewWeekModal(true)}
            className="px-3.5 py-2 rounded-lg text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Week Slot</span>
          </button>
        </div>
      </div>

      {/* Selected Week View */}
      {selectedWeek && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                  Week {selectedWeek.week_number}
                </span>
                {selectedWeek.is_published ? (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">
                    Published to Students
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Draft (Unpublished)
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-2">{selectedWeek.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{selectedWeek.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/lecturer/units/${unitId}/builder`}
                className="px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg text-xs font-semibold hover:bg-brand-100 transition-colors"
              >
                Configure Lab Assessment
              </Link>
            </div>
          </div>

          {/* Published Materials List */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Published Course Assets & Resources ({materials.length})
            </h3>

            {materials.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No materials published for Week {selectedWeek.week_number} yet.</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Weeks 2–14 start empty as required by the specification until you author content or upload files.
                </p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="mt-4 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700"
                >
                  Upload First Resource
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {materials.map((mat) => (
                  <div key={mat.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 flex items-center gap-1.5">
                          {mat.material_type === 'video' && <Video className="w-3.5 h-3.5 text-rose-500" />}
                          {mat.material_type === 'document' && <FileText className="w-3.5 h-3.5 text-blue-500" />}
                          {mat.material_type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-brand-500" />}
                          {mat.material_type === 'notes' && <FileText className="w-3.5 h-3.5 text-brand-500" />}
                          {mat.material_type}
                        </span>

                        <button
                          onClick={() => handleDeleteMaterial(mat.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete material"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">{mat.title}</h4>
                      {mat.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{mat.description}</p>
                      )}

                      {mat.youtube_url && (
                        <div className="mt-2 text-xs text-brand-600 font-mono truncate flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> {mat.youtube_url}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                      <span>Status: {mat.is_published ? 'Published' : 'Draft'}</span>
                      {mat.file && (
                        <a
                          href={mat.file}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-brand-600 hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View File
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Add Material to Week {selectedWeek?.week_number}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Upload PDF lecture slides, system diagrams, or attach video tutorial links.
            </p>

            <form onSubmit={handleCreateMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Software Development Life Cycle (SDLC) Guide"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Material Type</label>
                  <select
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="notes">Reading Notes (Markdown/HTML)</option>
                    <option value="pdf">PDF Document / Slides</option>
                    <option value="docx">Word DOCX Document</option>
                    <option value="txt">Plain Text Document</option>
                    <option value="image">Diagram / Image</option>
                    <option value="video">Video Resource</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Publish Status</label>
                  <select
                    value={isPublished ? 'true' : 'false'}
                    onChange={(e) => setIsPublished(e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="true">Publish Immediately</option>
                    <option value="false">Save as Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description / Summary</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of learning objectives covered in this material..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {materialType === 'video' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">YouTube URL</label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtu.be/..."
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              )}

              {materialType !== 'video' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Upload File (PDF, DOCX, TXT, PNG, JPG, WEBP &lt; 15MB)</label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                  />
                </div>
              )}

              {materialType === 'notes' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes Content (Markdown/Text)</label>
                  <textarea
                    rows={4}
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    placeholder="Enter full lecture notes, code snippets, or definitions..."
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm disabled:opacity-50"
                >
                  {uploading ? 'Processing & Validating...' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Week Modal */}
      {showNewWeekModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Curriculum Week Slot</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add an additional lecture/lab week to this course without arbitrary semester caps.
            </p>
            <form onSubmit={handleCreateWeek} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Week Title</label>
                <input
                  type="text"
                  required
                  value={newWeekTitle}
                  onChange={(e) => setNewWeekTitle(e.target.value)}
                  placeholder="e.g. Week 16: Microservices & Cloud Deployment"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Module Description</label>
                <textarea
                  rows={3}
                  value={newWeekDesc}
                  onChange={(e) => setNewWeekDesc(e.target.value)}
                  placeholder="Summary of learning outcomes, architectural topics, and hands-on lab exercise..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewWeekModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingWeek}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 shadow-sm disabled:opacity-50"
                >
                  {creatingWeek ? 'Creating...' : 'Create Week'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
