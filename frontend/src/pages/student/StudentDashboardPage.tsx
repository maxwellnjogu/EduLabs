import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import {
  GraduationCap,
  CheckCircle2,
  Lock,
  Unlock,
  ArrowRight,
  AlertCircle,
  FlaskConical,
  FileCheck,
} from "lucide-react";
import { AITutorDrawer } from "../../components/common/AITutorDrawer";

export const StudentDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getStudentDashboard()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load student dashboard");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-700"></div>
          <span className="text-xs font-semibold text-slate-500">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-sm font-medium">{error || "Could not retrieve student dashboard data."}</span>
        </div>
      </div>
    );
  }

  const { student, active_semester, active_unit, enrolled_units, readiness } = data;
  const labsPassed: number = readiness?.labs_completed ?? 0;
  const totalLabs: number = readiness?.total_labs ?? 0;
  const progressPercentage = totalLabs > 0 ? Math.round((labsPassed / totalLabs) * 100) : 0;
  const nextLab = readiness?.next_required_lab;
  const unlocked: boolean = !!readiness?.unlocked;
  const activeUnitId = active_unit?.id;
  const semesterLabel = active_semester?.name || "Semester";
  const yearLabel = student.year_of_study ? `Year ${student.year_of_study}` : null;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* 1. Welcome banner: university, year/semester, programme */}
      <section
        aria-label="Student welcome"
        className="bg-brand-800 rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-gold-500"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 text-gold-300 shrink-0">
            <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Welcome, {student.full_name}
              </h1>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-gold-100 border border-white/25 font-semibold">
                {student.admission_number}
              </span>
            </div>
            <p className="text-sm text-brand-100 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-white">{student.university}</span>
              <span aria-hidden="true">•</span>
              <span>{[yearLabel, semesterLabel].filter(Boolean).join(", ")}</span>
              <span aria-hidden="true">•</span>
              <span>{student.programme}</span>
            </p>
            <p className="text-[11px] text-brand-200 mt-1">
              Demonstration identity — synthetic prototype record, not an actual Riara University student record.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Lab progress + readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-brand-100 shadow-sm space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Laboratory Progress</span>
              <div className="text-2xl font-extrabold text-brand-900 mt-0.5" data-testid="lab-progress">
                {labsPassed}/{totalLabs}{" "}
                <span className="text-slate-500 text-sm font-medium">labs completed</span>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-50 text-brand-800 border border-brand-200 self-start sm:self-auto">
              {progressPercentage}% complete
            </span>
          </div>

          <div
            className="w-full bg-brand-50 rounded-full h-3 overflow-hidden border border-brand-100"
            role="progressbar"
            aria-valuenow={labsPassed}
            aria-valuemin={0}
            aria-valuemax={totalLabs}
          >
            <div
              className="bg-brand-700 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {nextLab ? (
            <div className="mt-2 p-4 rounded-xl border-2 border-gold-300 bg-gold-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <FlaskConical className="w-5 h-5 text-gold-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gold-600">
                    {nextLab.is_readiness_gate ? "Next required lab" : "Outstanding lab"}
                  </div>
                  <div className="text-sm font-bold text-brand-900">{nextLab.title}</div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {nextLab.is_readiness_gate
                      ? "Pass this lab (75% or above) to unlock the Final Readiness Test."
                      : "Complete this lab to finish your required work."}
                  </p>
                </div>
              </div>
              <Link
                to={nextLab.week_id ? `/student/weeks/${nextLab.week_id}` : `/student/lab/${nextLab.id}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs transition-colors shrink-0"
              >
                <span>Start SDLC Lab</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <p className="text-xs text-brand-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> All required labs complete.
            </p>
          )}
        </section>

        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-brand-100 shadow-sm flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-brand-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Final Readiness Test</span>
            </div>
            <div
              className={`mt-2 inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full border ${
                unlocked
                  ? "bg-brand-50 text-brand-800 border-brand-300"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              {unlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {unlocked ? "Unlocked" : "Locked"}
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{readiness?.reason}</p>
          </div>
          <Link
            to={activeUnitId ? `/student/units/${activeUnitId}/final-test` : "/student/dashboard"}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-brand-300 text-brand-800 hover:bg-brand-50 font-bold text-xs transition-colors"
          >
            <span>{unlocked ? "Open readiness test" : "View requirements"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>

      {/* 3. Registered units */}
      <section className="space-y-4" aria-label="Registered units">
        <div>
          <h2 className="text-xl font-bold text-brand-900 tracking-tight">
            Registered Units ({enrolled_units?.length || 0})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {student.programme} — {[yearLabel, semesterLabel].filter(Boolean).join(", ")}. Software Engineering is the
            active demonstration unit; the other units are locked prototype samples.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrolled_units?.map((u: any) => {
            const isActive = !u.is_sample;
            return (
              <div
                key={u.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between bg-white ${
                  isActive ? "border-brand-400 ring-2 ring-brand-200 shadow-md" : "border-slate-200 opacity-90"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                        isActive ? "bg-brand-100 text-brand-900" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {u.code}
                    </span>
                    {isActive ? (
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-700 text-white">
                        Active unit
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" /> Prototype
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-base text-slate-900 leading-snug">{u.name}</h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {u.description || "University curriculum unit."}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  {isActive ? (
                    <Link
                      to={`/student/units/${u.id}`}
                      className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs transition-colors"
                    >
                      <span>Open {u.code}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <div className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5 cursor-not-allowed">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked prototype unit</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <AITutorDrawer />
    </div>
  );
};
