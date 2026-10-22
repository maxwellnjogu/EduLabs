import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { lecturerApi } from '../../api/client';
import { BookOpen, Users, Calendar, ArrowRight, BarChart3, FileText, CheckCircle2 } from 'lucide-react';

export const LecturerUnitsPage: React.FC = () => {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lecturerApi.getAssignedUnits()
      .then(res => setUnits(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Faculty Assigned Units</h1>
        <p className="text-sm text-slate-500 mt-1">
          Select a unit to manage weekly content, build interactive lab assessments, or review student progress.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {units.map((unit) => (
          <div key={unit.id} className="bg-white rounded-xl border border-brand-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-brand-600 text-white">
                    {unit.code}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-100 text-brand-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Working Demo Unit
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-2">{unit.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Programme: {unit.programme_name || 'BSc. Computer Science / Software Engineering'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <Calendar className="w-4 h-4 text-slate-400" /> 14 Academic Weeks
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-600 mt-4 leading-relaxed">
              {unit.description || 'Core engineering syllabus covering Software Development Life Cycle (SDLC) models, waterfall, agile, scrum, system architecture, testing, and evolution.'}
            </p>

            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                to={`/lecturer/units/${unit.id}/weeks`}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" /> Curriculum (14 Wks)
              </Link>
              <Link
                to={`/lecturer/units/${unit.id}/builder`}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg text-xs font-semibold hover:bg-brand-100 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> Assessment Builder
              </Link>
              <Link
                to={`/lecturer/units/${unit.id}/analytics`}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                <BarChart3 className="w-3.5 h-3.5" /> Cohort Analytics
              </Link>
              <Link
                to={`/lecturer/units/${unit.id}/approvals`}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold hover:bg-purple-100 transition-colors"
              >
                Exam Approvals <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
