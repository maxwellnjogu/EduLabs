import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lecturerApi } from '../../api/client';
import {
  FileCheck,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowLeft,
  AlertTriangle,
  RotateCw,
  BookOpen,
  Send,
  HelpCircle,
  ShieldCheck,
  Check,
  Award,
  Layers,
  BarChart2,
  Info,
} from 'lucide-react';

export const LecturerExamReadinessBuilderPage: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const [assessment, setAssessment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Individual-Performance checkbox
  const [individualPerformance, setIndividualPerformance] = useState(false);

  // Configuration summary state (shown after generation, NO full question preview)
  const [configSummary, setConfigSummary] = useState<any | null>(null);
  const [examStatus, setExamStatus] = useState<'draft' | 'published'>('draft');

  // Configured challenging topics
  const challengingTopics = [
    {
      topic: 'Software Development Life Cycle (SDLC)',
      subtopics:
        'Predictive Waterfall sequential gates vs. adaptive Agile sprint cycles, staged environment segregation (Dev, QA/Staging, Production), and maintenance classifications (Adaptive, Corrective, Perfective, Preventive).',
    },
    {
      topic: 'Software Project Management',
      subtopics:
        "Critical Path Method (CPM) zero-slack tasks, PERT three-point beta estimation, formal Change Control Boards (CCB) for scope creep, and Brooks's Law on project staffing.",
    },
    {
      topic: 'System Analysis and Design',
      subtopics:
        'UML class diagrams (composition vs aggregation), sequence lifelines, architectural patterns (N-tier layering, MVC), and Gang of Four patterns (Singleton, Strategy).',
    },
    {
      topic: 'Verification and Validation',
      subtopics:
        'Verification vs Validation criteria, Boundary Value Analysis (BVA), Equivalence Partitioning, McCabe Cyclomatic Complexity, and automated regression testing.',
    },
  ];

  const fetchReadinessConfig = async () => {
    if (!unitId) return;
    setLoading(true);
    try {
      const res = await lecturerApi.getExamReadinessConfig(Number(unitId));
      if (res.data) {
        setAssessment(res.data.assessment);
        setExamStatus(res.data.status === 'published' ? 'published' : 'draft');
        if (res.data.status === 'published') {
          setConfigSummary({
            question_count: 30,
            time_per_question_seconds: 30,
            total_time_seconds: 900,
            passing_threshold_score: 17,
            passing_threshold_percentage: 56.7,
            selected_topics: challengingTopics.map((t) => t.topic),
            individual_performance_mode: false,
            status: 'published',
          });
        }
      }
    } catch (err) {
      console.error('Failed to load readiness assessment configuration', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadinessConfig();
  }, [unitId]);

  // Step 5: "Generate Practice Exam" with ~5 second loading state
  const handleGeneratePracticeExam = async () => {
    if (!unitId) return;
    setGenerating(true);
    setActionMsg(null);

    // Wait ~5 seconds for demonstration
    setTimeout(async () => {
      try {
        const res = await lecturerApi.generateExamReadiness(Number(unitId), {
          action: 'generate',
          individual_performance: individualPerformance,
        });

        setConfigSummary(res.data.summary);
        setExamStatus('draft');
        setActionMsg({
          type: 'success',
          text: 'Practice Exam generated successfully: 30 Questions prepared with 30s timer and 17/30 pass mark.',
        });
      } catch (err: any) {
        setActionMsg({
          type: 'error',
          text: err?.response?.data?.error || err?.message || 'Failed to generate practice exam configuration.',
        });
      } finally {
        setGenerating(false);
      }
    }, 5000);
  };

  // Step 5: "Publish" button
  const handlePublishExam = async () => {
    if (!unitId) return;
    setPublishing(true);
    setActionMsg(null);

    try {
      const res = await lecturerApi.generateExamReadiness(Number(unitId), {
        action: 'publish',
        individual_performance: individualPerformance,
      });

      setExamStatus('published');
      if (res.data.summary) {
        setConfigSummary(res.data.summary);
      }
      setActionMsg({
        type: 'success',
        text: 'Exam Readiness successfully published! Eligible students with 15 completed labs can now take the assessment.',
      });
    } catch (err: any) {
      setActionMsg({
        type: 'error',
        text: err?.response?.data?.error || 'Failed to publish exam readiness assessment.',
      });
    } finally {
      setPublishing(false);
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            to="/lecturer/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <FileCheck className="w-7 h-7 text-indigo-600" />
            Capstone Final Exam Readiness Assessment Builder
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure the 30 timed questions (30 seconds each) that determine student university exam clearance. Pass threshold: 17/30 (56.7%).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
              examStatus === 'published'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}
          >
            Status: {examStatus.toUpperCase()}
          </span>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionMsg.text}</span>
          </div>
          <button onClick={() => setActionMsg(null)} className="font-bold underline ml-4 text-slate-700">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards: Authoritative 30-Question Configuration */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Question Pool</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">30 Questions</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Multiple Choice pool</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-indigo-700 uppercase">Time Allocation</span>
          <div className="mt-2 text-2xl font-extrabold text-indigo-600">30s / Question</div>
          <p className="text-[11px] text-indigo-700 mt-0.5">15 minutes total duration</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-brand-700 uppercase">Pass Threshold</span>
          <div className="mt-2 text-2xl font-extrabold text-brand-600">≥ 17 / 30 Marks</div>
          <p className="text-[11px] text-brand-700 mt-0.5">56.7% clearance threshold</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Eligibility Prerequisite</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">15 Labs</div>
          <p className="text-[11px] text-slate-400 mt-0.5">All 15 labs completed</p>
        </div>
      </div>

      {/* SECTION A: Topics Students Find Most Challenging */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Topics Students Find Most Challenging</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configured high-yield focus areas emphasizing core syllabus challenges. Stored as authoritative assessment benchmarks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challengingTopics.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  {item.topic}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  Focus Area
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-7">{item.subtopics}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION B: Individual-Performance Option */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
        <div className="flex items-start gap-3">
          <input
            id="individualPerformance"
            type="checkbox"
            checked={individualPerformance}
            onChange={(e) => setIndividualPerformance(e.target.checked)}
            className="mt-1 w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
          />
          <div>
            <label
              htmlFor="individualPerformance"
              className="text-sm font-bold text-slate-900 cursor-pointer"
            >
              Test students by individual performance across the labs
            </label>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              When selected, the exam-generation process prioritizes questions addressing each student&apos;s authentic recorded weakness areas across the 14 completed syllabus labs. If a student has insufficient attempt data, the system safely falls back to the shared lecturer topic distribution without fabricating unrecorded errors.
            </p>
          </div>
        </div>
      </div>

      {/* Generated Configuration Summary (NO 30-Question Body Preview) */}
      {configSummary && (
        <div className="bg-indigo-50/40 rounded-2xl border border-indigo-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-200/60">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-indigo-950">
                Generated Practice Exam Configuration Summary
              </h3>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                configSummary.status === 'published'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {configSummary.status === 'published' ? 'Status: Published' : 'Status: Generated (Draft)'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Total Questions</span>
              <span className="text-base font-bold text-slate-900">{configSummary.question_count} Questions</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Per-Question Timer</span>
              <span className="text-base font-bold text-slate-900">{configSummary.time_per_question_seconds} Seconds</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Pass Benchmark</span>
              <span className="text-base font-bold text-indigo-600">
                {configSummary.passing_threshold_score}/{configSummary.question_count} ({configSummary.passing_threshold_percentage}%)
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
              <span className="text-slate-500 block uppercase font-bold text-[10px]">Mode Selected</span>
              <span className="text-base font-bold text-slate-900">
                {configSummary.individual_performance_mode ? 'Individual Analytics' : 'Shared Distribution'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-indigo-100 text-xs text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">Examination Integrity Protocol: </strong>
              <span>
                In accordance with academic testing standards, question text, options, and answer keys are protected on the builder dashboard and are withheld from preview. Questions are served directly to students in the official timed exam interface.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Bar: Generate Practice Exam & Publish */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Readiness Exam Actions</h4>
          <p className="text-xs text-slate-500">
            Generate the authoritative 30-question pool or publish the configuration to eligible students.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleGeneratePracticeExam}
            disabled={generating}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 disabled:opacity-50"
          >
            {generating ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin text-amber-300" />
                <span>Preparing Configuration (~5s)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Practice Exam</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePublishExam}
            disabled={publishing || examStatus === 'published'}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-2 ${
              examStatus === 'published'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>
              {examStatus === 'published'
                ? 'Status: Published'
                : publishing
                ? 'Publishing...'
                : 'Publish'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
