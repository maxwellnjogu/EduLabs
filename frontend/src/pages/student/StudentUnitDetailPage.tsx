import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileText,
  Video,
  Image as ImageIcon,
  AlertCircle,
  Clock,
  RotateCcw,
  Award,
  Play,
  Layers,
  BarChart2,
} from "lucide-react";
import { AITutorDrawer } from "../../components/common/AITutorDrawer";

export const StudentUnitDetailPage: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();
  const [unitData, setUnitData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLockedUnit, setIsLockedUnit] = useState(false);

  const uId = unitId ? parseInt(unitId) : 1;

  useEffect(() => {
    setLoading(true);
    setError("");
    setIsLockedUnit(false);

    api.getStudentUnitDetail(uId)
      .then((res) => {
        setUnitData(res);
        setLoading(false);
      })
      .catch((err) => {
        if (err.message && err.message.includes("Prototype Unit")) {
          setIsLockedUnit(true);
        } else {
          setError(err.message || "Failed to load unit overview");
        }
        setLoading(false);
      });
  }, [uId]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
          <span className="text-xs font-semibold text-slate-500">Loading laboratory curriculum...</span>
        </div>
      </div>
    );
  }

  // Guard for locked prototype units accessed via direct URL
  if (isLockedUnit) {
    return (
      <div className="p-8 max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Prototype Unit Locked</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              Curriculum content is locked during this evaluation. The complete interactive laboratory demonstration is hosted in <strong>Software Engineering (RCS 305)</strong>.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/student/dashboard"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Back to Dashboard
            </Link>
            <Link
              to="/student/units/1"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Open Software Engineering (RCS 305)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !unitData) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-sm font-medium">{error || "Unit details could not be retrieved."}</span>
        </div>
      </div>
    );
  }

  const { unit, semester, labs = [] } = unitData;

  // Calculate completion count
  const completedCount = labs.filter((l: any) => l.is_completed).length;
  const totalCount = labs.length || 15;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-slate-500">
        <Link to="/student/dashboard" className="hover:text-brand-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">{unit.code} — {unit.name}</span>
      </div>

      {/* Unit Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-brand-100 text-brand-900 border border-brand-200">
              {unit.code}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">
              {semester?.university_name || "Riara University"} • {semester?.name} ({semester?.academic_year})
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
              Lecturer: James Mwangi
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-brand-600 text-white font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Active Laboratory Track
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{unit.name}</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {unit.description || "Core software engineering curriculum covering SDLC phases, architecture, testing tiers, and agile scrum."}
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <Link
            to="/student/revision"
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition flex items-center gap-1.5"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Revision Hub</span>
          </Link>
          <Link
            to="/student/units/1/final-test"
            className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Exam Readiness</span>
          </Link>
        </div>
      </div>

      {/* Laboratory Progress Summary Banner */}
      <section className="bg-brand-800 rounded-2xl p-6 text-white shadow-md border-b-4 border-gold-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-gold-200 border border-white/20">
                Course Laboratory Curriculum
              </span>
              <span className="text-xs text-brand-200">• 15 Practical Software Engineering Labs</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              {completedCount}/{totalCount} Labs Completed ({progressPct}%)
            </h2>
            <p className="text-xs text-brand-100 mt-1 max-w-2xl">
              14 synthetic demonstration labs completed with recorded scores. The <strong>SDLC lab</strong> is the outstanding required prerequisite to unlock the Final Exam Readiness test.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-xs text-brand-200 font-semibold">Readiness Status</div>
              <div className="text-sm font-bold text-amber-300 flex items-center gap-1 justify-end">
                <Lock className="w-3.5 h-3.5" />
                <span>Locked (SDLC Pending)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-black/20 h-2.5 rounded-full overflow-hidden border border-white/10">
          <div
            className="bg-gradient-to-r from-gold-400 to-amber-300 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </section>

      {/* Main Laboratory Curriculum Grid (No weeks, actual labs only) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Syllabus Practical Labs</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual lab assessments featuring lecture notes, system diagrams, and timed knowledge verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {labs.map((lab: any, idx: number) => {
            const isGate = lab.readiness_gate;
            const isCompleted = lab.is_completed;
            const score = lab.score;
            const isSynthetic = lab.is_synthetic;

            return (
              <div
                key={lab.id}
                className={`p-6 rounded-2xl bg-white shadow-sm flex flex-col justify-between space-y-4 relative transition-all ${
                  isGate
                    ? "border-2 border-brand-500 ring-2 ring-brand-500/10 shadow-md"
                    : isCompleted
                    ? "border border-slate-200 hover:border-brand-300"
                    : "border border-amber-200 bg-amber-50/20"
                }`}
              >
                <div className="space-y-3">
                  {/* Top Status Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        Lab {idx + 1}
                      </span>
                      {isGate && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gold-500 text-brand-950 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <Lock className="w-3 h-3" />
                          <span>Required Prerequisite</span>
                        </span>
                      )}
                    </div>

                    {isCompleted ? (
                      <div className="flex items-center gap-2">
                        {isSynthetic && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                            Demo Data
                          </span>
                        )}
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Score: {score !== null ? `${score}%` : "Passed"}</span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/60 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-700" />
                        <span>Outstanding (Pass Required)</span>
                      </span>
                    )}
                  </div>

                  {/* Title and Description */}
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-snug">
                      {lab.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                      {lab.description}
                    </p>
                  </div>

                  {/* Available Learning Resources */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                      <FileText className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span className="truncate">Syllabus Study Notes</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                      <Award className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span className="truncate">Pass Threshold: {lab.passing_threshold || 75}%</span>
                    </div>
                    {isGate && (
                      <>
                        <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                          <ImageIcon className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          <span className="truncate">SDLC Architecture Diagram</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                          <Video className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span className="truncate">Tutorial Video Resource</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 font-medium">
                    {isCompleted ? (
                      <span>{lab.attempts_count || 1} attempt(s) recorded</span>
                    ) : (
                      <span className="text-amber-700 font-semibold">Not yet attempted</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isGate && !isCompleted ? (
                      <Link
                        to={`/student/units/${uId}/weeks/${lab.week_number || 1}`}
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-xl shadow-md transition"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Start SDLC Lab</span>
                      </Link>
                    ) : (
                      <Link
                        to={lab.week_number ? `/student/units/${uId}/weeks/${lab.week_number}` : `/student/lab/${lab.id}`}
                        className={`inline-flex items-center space-x-1 text-xs font-bold px-3.5 py-1.5 rounded-xl transition ${
                          isCompleted
                            ? "bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200"
                            : "bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
                        }`}
                      >
                        <span>{isCompleted ? "Review & Retake Lab" : "Open Lab"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AITutorDrawer />
    </div>
  );
};
