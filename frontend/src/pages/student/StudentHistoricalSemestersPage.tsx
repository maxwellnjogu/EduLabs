import React, { useEffect, useState } from 'react';
import { studentApi } from '../../api/client';
import { Archive, History, BookOpen, CheckCircle2, Clock, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentHistoricalSemestersPage: React.FC = () => {
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.getPastSemesters()
      .then(res => setHistoryData(res.data))
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
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <History className="w-7 h-7 text-brand-600" /> Past Academic Semesters & Archive
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review previous semesters, preserved course notes, archived submissions, and authorized historical lab records.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 flex items-start gap-3">
        <Archive className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-900">Academic Archival Policy</p>
          <p className="mt-0.5 text-slate-600 leading-relaxed">
            In compliance with MaxLabs institutional data retention standards, closing a semester removes coursework from the active registration view but permanently preserves notes, attempt results, and historical grade cards for student auditing.
          </p>
        </div>
      </div>

      {historyData.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Closed or Archived Semesters</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            You are currently enrolled in active term: <strong>Semester 2 (2025/2026) • Year 2 Computer Science</strong>. When this term concludes, historical transcripts and lab attempts will be archived here.
          </p>
          <div className="mt-6">
            <Link
              to="/student/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 shadow-sm"
            >
              Return to Active Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {historyData.map((term: any) => (
            <div key={term.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{term.name}</h2>
                  <p className="text-xs text-slate-500">Academic Year: {term.academic_year}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 capitalize">
                  Status: {term.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {term.enrolled_units?.map((unit: any) => (
                  <div key={unit.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-500">{unit.code}</div>
                      <div className="text-sm font-semibold text-slate-900">{unit.name}</div>
                      <div className="text-xs text-slate-500 mt-1">Completed: {unit.labs_passed || 0} labs passed</div>
                    </div>
                    <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded border border-brand-200">
                      Archived Notes
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
