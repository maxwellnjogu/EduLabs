import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../api/client";
import {
  BookOpen,
  FileText,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Layers,
  Inbox,
} from "lucide-react";
import { AITutorDrawer } from "../../components/common/AITutorDrawer";
import { MarkdownRenderer } from "../../components/common/MarkdownRenderer";

function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube-nocookie.com/embed/${match[2]}` : null;
}

export const StudentWeekLearningPage: React.FC = () => {
  const { unitId, weekNumber, weekId } = useParams<{ unitId?: string; weekNumber?: string; weekId?: string }>();
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const targetWeek = weekNumber ? parseInt(weekNumber) : (weekId ? parseInt(weekId) : 1);
  const targetUnit = unitId ? parseInt(unitId) : 1;

  useEffect(() => {
    api.getStudentWeekDetail(targetWeek, targetUnit)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load weekly learning resources");
        setLoading(false);
      });
  }, [targetWeek, targetUnit]);

  const toggleQuestion = (id: number) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">
          {error || "Weekly materials not found."}
        </div>
      </div>
    );
  }

  const { week_number, title, description, materials = [], lab, practice_questions = [] } = data;

  const notesMaterials = materials.filter((m: any) => m.material_type === "notes");
  const videoMaterials = materials.filter((m: any) => m.material_type === "youtube" || m.material_type === "video" || m.url);
  const imageMaterials = materials.filter((m: any) => m.material_type === "image");
  const docMaterials = materials.filter((m: any) => ["pdf", "docx", "txt"].includes(m.material_type));

  const hasAnyPublishedContent = materials.length > 0 || practice_questions.length > 0;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-28">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs text-slate-500 mb-2">
          <Link to={`/student/units/${targetUnit}`} className="hover:text-brand-600 transition">
            {data.unit?.name || "Software Engineering"}
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">Week {week_number}</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800">
                Week {week_number} Academic Curriculum
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              {description}
            </p>
          </div>

          {/* Interactive Lab Link Button */}
          {lab && (
            <Link
              to={`/student/lab/${lab.id}`}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition flex-shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Enter Lab Test Area</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Lab Banner / Status */}
      {lab ? (
        <div className="bg-gradient-to-r from-brand-50 via-brand-50 to-blue-50 border border-brand-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl text-white ${lab.is_passed ? "bg-brand-600" : "bg-amber-500"}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-slate-900">{lab.title}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    lab.is_passed ? "bg-brand-100 text-brand-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {lab.is_passed ? "Completed & Passed (14/14 Required)" : "Pending Completion (Pass Mark: 20/30)"}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Total Marks: {lab.total_marks} pts • Pass Threshold: {lab.passing_threshold}% (20/30) • Best Score:{" "}
                {lab.best_percentage ? `${lab.best_percentage}%` : "Not attempted yet"}
              </p>
            </div>
          </div>

          <Link
            to={`/student/lab/${lab.id}`}
            className="text-xs font-bold text-brand-700 hover:text-brand-800 underline flex items-center gap-1"
          >
            {lab.is_passed ? "Take Practice Retake" : "Start Lab Assessment"} →
          </Link>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-600 flex items-center gap-3">
          <Layers className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-slate-800">Lab Assessment Status: </span>
            <span>The lecturer is preparing this week's 30-question interactive assessment. It will unlock here once published.</span>
          </div>
        </div>
      )}

      {/* Main Learning Content Area */}
      {!hasAnyPublishedContent ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-2xl mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
            <Inbox className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">No Learning Materials Published Yet</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            Your lecturer has not published any lecture notes, diagrams, video references, or practice questions for Week {week_number} yet. Published resources will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Navigation Filter Tabs */}
          <div className="border-b border-slate-200 flex space-x-1 sm:space-x-2 text-xs font-semibold overflow-x-auto pb-px">
            <button
              onClick={() => setActiveTab("all")}
              className={`pb-3 px-3 sm:px-4 border-b-2 flex items-center space-x-2 transition whitespace-nowrap ${
                activeTab === "all"
                  ? "border-brand-600 text-brand-700 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>All Materials ({materials.length})</span>
            </button>

            {notesMaterials.length > 0 && (
              <button
                onClick={() => setActiveTab("notes")}
                className={`pb-3 px-3 sm:px-4 border-b-2 flex items-center space-x-2 transition whitespace-nowrap ${
                  activeTab === "notes"
                    ? "border-brand-600 text-brand-700 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Lecture Notes ({notesMaterials.length})</span>
              </button>
            )}

            {docMaterials.length > 0 && (
              <button
                onClick={() => setActiveTab("docs")}
                className={`pb-3 px-3 sm:px-4 border-b-2 flex items-center space-x-2 transition whitespace-nowrap ${
                  activeTab === "docs"
                    ? "border-brand-600 text-brand-700 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Documents & Handouts ({docMaterials.length})</span>
              </button>
            )}

            {imageMaterials.length > 0 && (
              <button
                onClick={() => setActiveTab("images")}
                className={`pb-3 px-3 sm:px-4 border-b-2 flex items-center space-x-2 transition whitespace-nowrap ${
                  activeTab === "images"
                    ? "border-brand-600 text-brand-700 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Diagrams & Blueprints ({imageMaterials.length})</span>
              </button>
            )}

            {videoMaterials.length > 0 && (
              <button
                onClick={() => setActiveTab("videos")}
                className={`pb-3 px-3 sm:px-4 border-b-2 flex items-center space-x-2 transition whitespace-nowrap ${
                  activeTab === "videos"
                    ? "border-brand-600 text-brand-700 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Video Tutorials ({videoMaterials.length})</span>
              </button>
            )}

            {practice_questions.length > 0 && (
              <button
                onClick={() => setActiveTab("practice")}
                className={`pb-3 px-3 sm:px-4 border-b-2 flex items-center space-x-2 transition whitespace-nowrap ${
                  activeTab === "practice"
                    ? "border-brand-600 text-brand-700 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Practice Questions ({practice_questions.length})</span>
              </button>
            )}
          </div>

          {/* Tab Content Display */}
          <div className="space-y-6">
            {/* Notes Section */}
            {(activeTab === "all" || activeTab === "notes") && notesMaterials.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-600" />
                  <span>Curriculum Lecture Notes</span>
                </h3>
                {notesMaterials.map((mat: any) => (
                  <div key={mat.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{mat.title}</h4>
                        {mat.description && <p className="text-xs text-slate-500 mt-0.5">{mat.description}</p>}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        Lecture Notes
                      </span>
                    </div>
                    <MarkdownRenderer content={mat.content || mat.extracted_text || "No notes content provided."} className="text-slate-800 max-w-none text-xs leading-relaxed" />
                  </div>
                ))}
              </div>
            )}

            {/* Video Section */}
            {(activeTab === "all" || activeTab === "videos") && videoMaterials.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Video className="w-4 h-4 text-brand-600" />
                  <span>Video Tutorials & Lectures</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {videoMaterials.map((mat: any) => {
                    const embedUrl = getYouTubeEmbedUrl(mat.url);
                    return (
                      <div key={mat.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{mat.title}</h4>
                            {mat.description && <p className="text-[11px] text-slate-500 mt-0.5">{mat.description}</p>}
                          </div>
                          {mat.url && (
                            <a
                              href={mat.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 shrink-0"
                            >
                              <span>Open</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {embedUrl ? (
                          <div className="aspect-video w-full bg-slate-950">
                            <iframe
                              className="w-full h-full"
                              src={embedUrl}
                              title={mat.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        ) : mat.url ? (
                          <div className="p-8 text-center bg-slate-50 flex flex-col items-center justify-center space-y-2">
                            <Video className="w-8 h-8 text-brand-600" />
                            <a href={mat.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-brand-700 underline">
                              Watch Tutorial Video Directly →
                            </a>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Diagrams & Images Section */}
            {(activeTab === "all" || activeTab === "images") && imageMaterials.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-brand-600" />
                  <span>Architectural Diagrams & Visual Blueprints</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {imageMaterials.map((mat: any) => (
                    <div key={mat.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-5 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{mat.title}</h4>
                          {mat.description && <p className="text-[11px] text-slate-500 mt-0.5">{mat.description}</p>}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">Diagram</span>
                      </div>
                      {mat.file_url ? (
                        <div
                          onClick={() => setPreviewImage(mat.file_url)}
                          className="cursor-pointer group relative bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center min-h-[220px]"
                        >
                          <img src={mat.file_url} alt={mat.title} className="max-h-80 w-auto object-contain rounded-lg transition group-hover:scale-[1.02]" />
                          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                            <Eye className="w-4 h-4" /> Click to enlarge
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">Image asset uploaded without direct file stream.</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents & PDFs Section */}
            {(activeTab === "all" || activeTab === "docs") && docMaterials.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-600" />
                  <span>Syllabus Handouts & Reference Documents</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {docMaterials.map((mat: any) => (
                    <div key={mat.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 shrink-0">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900">{mat.title}</h4>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {mat.material_type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{mat.description || "Course study document provided by faculty."}</p>
                          {mat.file_size > 0 && (
                            <span className="text-[10px] text-slate-400 mt-1 block">{(mat.file_size / 1024).toFixed(0)} KB</span>
                          )}
                        </div>
                      </div>
                      {mat.file_url && (
                        <a
                          href={mat.file_url}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Practice Questions Accordion */}
            {(activeTab === "all" || activeTab === "practice") && practice_questions.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" />
                    <span>Sample Practice Questions</span>
                  </h3>
                  <span className="text-xs font-semibold text-slate-500">{practice_questions.length} Questions</span>
                </div>

                <div className="space-y-3" role="region" aria-label="Practice Questions Accordion">
                  {practice_questions.map((q: any, idx: number) => {
                    const isExpanded = Boolean(expandedQuestions[q.id || idx]);
                    return (
                      <div key={q.id || idx} className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden transition">
                        <button
                          onClick={() => toggleQuestion(q.id || idx)}
                          className="w-full px-4 py-3.5 flex items-start justify-between text-left gap-3 focus:outline-none"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className={`mt-0.5 text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${isExpanded ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                              {isExpanded ? "[-]" : "[+]"}
                            </span>
                            <div>
                              <span className="text-xs font-bold text-slate-900">
                                Question {idx + 1}: {q.prompt}
                              </span>
                              {q.topic && (
                                <div className="mt-1">
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                    Topic: {q.topic}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-brand-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-brand-50/20 text-xs text-slate-700 space-y-2">
                            {q.answer && (
                              <div>
                                <span className="font-bold text-brand-900 block mb-1">Answer & Explanation:</span>
                                <div className="p-3 bg-white border border-brand-200 rounded-xl">
                                  <MarkdownRenderer content={q.answer} className="text-xs" />
                                </div>
                              </div>
                            )}
                            {q.explanation && q.explanation !== q.answer && (
                              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600">
                                <MarkdownRenderer content={q.explanation} className="text-xs" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Modal Lightbox */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl">
            <img src={previewImage} alt="Preview" className="max-h-[85vh] w-auto object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Floating Ask AI Tutor Drawer */}
      <AITutorDrawer />
    </div>
  );
};
