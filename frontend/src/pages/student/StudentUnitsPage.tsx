import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentApi } from '../../api/client';
import { BookOpen, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export const StudentUnitsPage: React.FC = () => {
  const [semesterData, setSemesterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.getSemesterUnits()
      .then(res => setSemesterData(res.data))
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Enrolled Semester Units</h1>
        <p className="text-sm text-slate-500 mt-1">
          {semesterData?.semester?.name} ({semesterData?.semester?.academic_year}) — {semesterData?.enrolled_units?.length || 0} Registered Units
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {semesterData?.enrolled_units?.map((unit: any) => (
          <div
            key={unit.id}
            className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md flex flex-col justify-between p-6 ${
              unit.is_sample ? 'border-slate-200' : 'border-brand-300 ring-1 ring-brand-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                  {unit.code}
                </span>
                {!unit.is_sample ? (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-100 text-brand-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Full Working Demo
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Sample Syllabus
                  </span>
                )}
              </div>

              <h2 className="text-lg font-bold text-slate-900 leading-snug">{unit.name}</h2>
              <p className="text-xs text-slate-500 mt-1">
                Lecturer: {unit.lecturer_name || 'Department Faculty'}
              </p>

              <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                {unit.description || 'Core university curriculum unit with modular lab assessments.'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 14 Weeks
              </span>
              <Link
                to={`/student/units/${unit.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                Access Course <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
