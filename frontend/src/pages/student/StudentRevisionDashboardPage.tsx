import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import {
  BookOpen,
  Search,
  Download,
  ArrowRight,
  ExternalLink,
  Sparkles,
  FileText,
  BarChart3,
  Video,
  Layers,
  FlaskConical,
  GraduationCap,
  CheckCircle2,
  GitBranch,
} from "lucide-react";
import { AITutorDrawer } from "../../components/common/AITutorDrawer";

interface TopicGuide {
  number: number;
  title: string;
  category: "Foundations" | "Design" | "Quality" | "Management";
  filename: string;
  filesize: string;
  assessmentId: number;
  summary: string;
  coreConcepts: string[];
  externalResources: { label: string; url: string; type: "video" | "doc" | "diagram" }[];
}

const SYLLABUS_15_TOPICS: TopicGuide[] = [
  {
    number: 1,
    title: "Software Development Life Cycle (SDLC)",
    category: "Foundations",
    filename: "01_sdlc_fundamentals.pdf",
    filesize: "3.8 KB",
    assessmentId: 1,
    summary: "Comprehensive study of software lifecycle phases from requirements elicitation through retirement. Analyzes Boehm's defect amplification cost curve and multi-tier environment isolation (Dev, QA Staging, Production).",
    coreConcepts: [
      "5 Core Phases: Requirements Analysis, Architecture & Design, Implementation, Verification & Validation, Maintenance.",
      "Boehm's Cost Curve: Defects cost 10x-100x more to remediate in Production than during Requirements.",
      "Environment Segregation: Separation of development sandbox, automated QA integration, and locked production tiers.",
    ],
    externalResources: [
      { label: "Interactive SDLC Mind Map & Lifecycle Diagram", url: "/student/units/1/weeks/1?tab=mindmap", type: "diagram" },
      { label: "Boehm Defect Amplification Model", url: "#", type: "diagram" },
      { label: "Multi-Tier Deployment Architecture", url: "#", type: "doc" },
    ],
  },
  {
    number: 2,
    title: "Software Development Models — Waterfall, Agile, Spiral & V-Model",
    category: "Foundations",
    filename: "02_software_process_models.pdf",
    filesize: "2.9 KB",
    assessmentId: 3,
    summary: "Comparative analysis of plan-driven sequential models versus iterative and adaptive paradigms. Covers V-Model verification-validation pairs and Scrum sprint lifecycles.",
    coreConcepts: [
      "Waterfall Model: Strict phase gates suited for well-defined, safety-critical systems with immutable specs.",
      "Agile & Scrum: Timeboxed sprints (1-4 weeks), cross-functional teams, daily standups, and working software over docs.",
      "V-Model Duality: Links each development stage directly with its corresponding verification test stage.",
      "Boehm Spiral Model: Risk-driven iterative cycles combining prototyping with systematic milestones.",
    ],
    externalResources: [
      { label: "V-Model Verification Pairs Diagram", url: "#", type: "diagram" },
      { label: "Scrum Framework Guide", url: "#", type: "doc" },
    ],
  },
  {
    number: 3,
    title: "Requirements Engineering",
    category: "Foundations",
    filename: "03_requirements_engineering.pdf",
    filesize: "2.6 KB",
    assessmentId: 4,
    summary: "Techniques for stakeholder identification, elicitation interviews, workshops, requirement negotiation, prioritization, and validation against business feasibility.",
    coreConcepts: [
      "Elicitation Strategies: Stakeholder interviews, JAD workshops, observation, and document analysis.",
      "Functional vs Non-Functional: Differentiating functional behavior from performance, security, and availability constraints.",
      "Negotiation & Feasibility: Resolving stakeholder conflicts through MoSCoW prioritization (Must, Should, Could, Won't).",
    ],
    externalResources: [
      { label: "Requirements Elicitation Matrix", url: "#", type: "doc" },
    ],
  },
  {
    number: 4,
    title: "Software Requirements Specification (SRS)",
    category: "Foundations",
    filename: "04_srs_documentation.pdf",
    filesize: "2.6 KB",
    assessmentId: 5,
    summary: "Formulating formal IEEE 830 compliant SRS documents. Focuses on writing unambiguous, complete, consistent, verifiable, and traceable requirement statements.",
    coreConcepts: [
      "IEEE 830 Standard: Introduction, Overall Description, and Specific System Requirements.",
      "Quality Attributes: Ensuring requirements are unambiguous, testable, modifiable, and traceable.",
      "Traceability Matrix: Mapping user requirements forward to design components, code modules, and test suites.",
    ],
    externalResources: [
      { label: "IEEE 830 SRS Template Reference", url: "#", type: "doc" },
    ],
  },
  {
    number: 5,
    title: "System Analysis and Design",
    category: "Design",
    filename: "05_system_analysis_and_design.pdf",
    filesize: "2.3 KB",
    assessmentId: 6,
    summary: "Transitioning from the problem space to the solution space. Data Flow Diagrams (DFD Levels 0/1/2), Entity Relationship Diagrams (ERD), and architectural modularity.",
    coreConcepts: [
      "Problem Space to Solution Space: Deconstructing business requirements into technical system components.",
      "Cohesion and Coupling: Achieving high functional cohesion within modules and loose coupling between subsystems.",
      "Data Modeling: Logical ER diagrams, normalization (1NF through BCNF), and DFD data stores.",
    ],
    externalResources: [
      { label: "DFD Level 0/1 Architecture Guide", url: "#", type: "diagram" },
    ],
  },
  {
    number: 6,
    title: "Unified Modeling Language (UML)",
    category: "Design",
    filename: "06_uml_modeling.pdf",
    filesize: "2.3 KB",
    assessmentId: 7,
    summary: "Visual modeling standards across structural and behavioral perspectives. Class diagrams, Use Case diagrams with <<include>> and <<extend>>, Sequence diagrams, and Activity diagrams.",
    coreConcepts: [
      "Structural Diagrams: Class hierarchies, association multiplicities, aggregation, and composition lifecycles.",
      "Behavioral Diagrams: Sequence lifelines and messages, Activity decision nodes, and State machine transitions.",
      "Use Case Relationships: Clear demarcation between mandatory <<include>> and optional conditional <<extend>>.",
    ],
    externalResources: [
      { label: "UML Class Multiplicity Quick Reference", url: "#", type: "diagram" },
    ],
  },
  {
    number: 7,
    title: "Software Architecture and Design Patterns",
    category: "Design",
    filename: "07_software_architecture_patterns.pdf",
    filesize: "2.3 KB",
    assessmentId: 8,
    summary: "Architectural styles (Layered, Client-Server, Microservices, Event-Driven) and classic Gang of Four (GoF) creational, structural, and behavioral design patterns.",
    coreConcepts: [
      "Architectural Styles: 3-Tier Layered (Presentation, Logic, Data), Microservices boundaries, and Event brokers.",
      "Creational Patterns: Singleton, Factory Method, and Abstract Factory implementations.",
      "Structural & Behavioral: Adapter, Decorator, Observer (Publish-Subscribe), and Strategy algorithms.",
    ],
    externalResources: [
      { label: "GoF Design Patterns Catalog", url: "#", type: "doc" },
    ],
  },
  {
    number: 8,
    title: "Object-Oriented Software Engineering",
    category: "Design",
    filename: "08_oose_solid_principles.pdf",
    filesize: "2.4 KB",
    assessmentId: 9,
    summary: "Core OOP pillars (Encapsulation, Abstraction, Inheritance, Polymorphism) and comprehensive mastery of the five SOLID design principles.",
    coreConcepts: [
      "Single Responsibility (SRP): A module should have one, and only one, reason to change.",
      "Open/Closed (OCP): Software entities should be open for extension, but closed for modification.",
      "Liskov Substitution (LSP): Subtypes must be substitutable for their base types without altering correctness.",
      "Interface Segregation (ISP) & Dependency Inversion (DIP): Depend upon abstractions, not concrete implementations.",
    ],
    externalResources: [
      { label: "SOLID Principles Architecture Cheatsheet", url: "#", type: "doc" },
    ],
  },
  {
    number: 9,
    title: "Software Testing and Quality Assurance",
    category: "Quality",
    filename: "09_testing_quality_assurance.pdf",
    filesize: "2.3 KB",
    assessmentId: 10,
    summary: "The testing hierarchy: Unit, Integration, System, and User Acceptance Testing (UAT). Black-box (boundary value, equivalence partitioning) and White-box (cyclomatic complexity) techniques.",
    coreConcepts: [
      "Testing Pyramid: Broad automated unit test base, integration middle layer, and focused end-to-end UAT.",
      "Black-Box Testing: Equivalence class partitioning and Boundary Value Analysis (BVA).",
      "White-Box Testing: Statement coverage, branch coverage, and McCabe's Cyclomatic Complexity metric.",
    ],
    externalResources: [
      { label: "Test Pyramid Strategy Document", url: "#", type: "doc" },
    ],
  },
  {
    number: 10,
    title: "Software Verification and Validation",
    category: "Quality",
    filename: "10_verification_and_validation.pdf",
    filesize: "2.1 KB",
    assessmentId: 11,
    summary: "Boehm's V&V duality: 'Are we building the product right?' (Verification) vs 'Are we building the right product?' (Validation). Static reviews, formal inspections, and walkthroughs.",
    coreConcepts: [
      "Verification: Static analysis, peer reviews, code inspections, and formal mathematical proofs.",
      "Validation: Dynamic execution against actual customer operational requirements and acceptance criteria.",
      "Fagan Inspections: Formal entry criteria, roles (Moderator, Author, Reader, Inspector), and defect logging.",
    ],
    externalResources: [
      { label: "Formal Code Inspection Checklist", url: "#", type: "doc" },
    ],
  },
  {
    number: 11,
    title: "Software Maintenance and Evolution",
    category: "Quality",
    filename: "11_maintenance_and_evolution.pdf",
    filesize: "2.6 KB",
    assessmentId: 12,
    summary: "Categories of software maintenance: Corrective, Adaptive, Perfective, and Preventive. Lehman's Laws of Software Evolution, technical debt management, and refactoring.",
    coreConcepts: [
      "4 Maintenance Categories: Corrective (bugs), Adaptive (new environment), Perfective (performance), Preventive.",
      "Lehman's Laws: Continuing Change (must evolve or become obsolete) and Increasing Complexity.",
      "Technical Debt: Measuring code smells, cyclomatic decay, and systematic refactoring strategies.",
    ],
    externalResources: [
      { label: "Lehman's Laws of Evolution Guide", url: "#", type: "doc" },
    ],
  },
  {
    number: 12,
    title: "Software Project Management",
    category: "Management",
    filename: "12_project_management.pdf",
    filesize: "2.2 KB",
    assessmentId: 13,
    summary: "Project governance using the Triple Constraint triangle (Scope, Time, Cost). Work Breakdown Structures (WBS), Gantt chart scheduling, and the Critical Path Method (CPM).",
    coreConcepts: [
      "Triple Constraint: Managing the dynamic trade-offs between project scope, schedule, and allocated budget.",
      "Work Breakdown Structure (WBS): Hierarchical decomposition of total project deliverable deliverables.",
      "Critical Path Method (CPM): Identifying task sequences with zero slack time that determine project duration.",
    ],
    externalResources: [
      { label: "Critical Path Method Calculation Matrix", url: "#", type: "diagram" },
    ],
  },
  {
    number: 13,
    title: "Software Cost Estimation",
    category: "Management",
    filename: "13_cost_estimation.pdf",
    filesize: "2.2 KB",
    assessmentId: 14,
    summary: "Algorithmic estimation models including COCOMO II (Basic, Intermediate, Detailed), Function Point Analysis (FPA), and navigating the Cone of Uncertainty across project stages.",
    coreConcepts: [
      "COCOMO II: Effort equations: Effort = a * (KLOC)^b * EAF, accounting for team capability and tooling.",
      "Function Point Analysis (FPA): Unadjusted Function Points based on inputs, outputs, inquiries, and files.",
      "Cone of Uncertainty: 4x variance at project inception narrowing down to 1.0x at implementation completion.",
    ],
    externalResources: [
      { label: "COCOMO II Cost Multipliers Reference", url: "#", type: "doc" },
    ],
  },
  {
    number: 14,
    title: "Risk Management in Software Projects",
    category: "Management",
    filename: "14_risk_management.pdf",
    filesize: "2.2 KB",
    assessmentId: 15,
    summary: "Systematic risk governance: Identification, Assessment, Prioritization using Risk Exposure (Probability x Impact), and formulating Risk Mitigation, Monitoring, and Management (RMMM) plans.",
    coreConcepts: [
      "Risk Exposure (RE): Calculated as RE = P x I (Probability of occurrence multiplied by Impact severity).",
      "Risk Categories: Project risks (budget/schedule), Technical risks (feasibility), and Business risks.",
      "RMMM Plans: Proactive mitigation strategies, threshold triggers for monitoring, and contingency failovers.",
    ],
    externalResources: [
      { label: "RMMM Governance Template", url: "#", type: "doc" },
    ],
  },
  {
    number: 15,
    title: "Version Control Systems — Git and GitHub",
    category: "Management",
    filename: "15_version_control_git.pdf",
    filesize: "2.6 KB",
    assessmentId: 16,
    summary: "Distributed version control architecture using Directed Acyclic Graphs (DAG). Three Trees (Working Dir, Staging Index, Commit History), GitFlow branching, merge conflict resolution, and Pull Requests.",
    coreConcepts: [
      "Three Trees Architecture: Working Directory, Staging Area (Index), and Repository object database (HEAD).",
      "Git Internals: Immutable commits, SHA-1 tree hashes, and directed acyclic graph lineage.",
      "GitFlow Branching: Long-lived main and develop branches, feature branches, release tags, and hotfixes.",
      "Pull Requests & Code Review: Enforcing peer reviews, branch protection rules, and CI/CD validation checks.",
    ],
    externalResources: [
      { label: "Git Three Trees Interactive Guide", url: "#", type: "diagram" },
      { label: "GitFlow Branching Specification", url: "#", type: "doc" },
    ],
  },
];

export const StudentRevisionDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    api.getStudentRevision(1)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const filteredTopics = useMemo(() => {
    return SYLLABUS_15_TOPICS.filter((t) => {
      const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.coreConcepts.some((c) => c.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const lecturerTopics = data?.lecturer_recommended_topics || [];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* 1. Header Banner */}
      <section className="bg-brand-800 rounded-2xl p-6 text-white shadow-md border-b-4 border-gold-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-gold-200 border border-white/20">
              RCS 305
            </span>
            <span className="text-xs text-brand-200">• Revision Hub & Study Resources</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Revision Hub</h1>
          <p className="text-xs text-brand-100 mt-1 max-w-2xl leading-relaxed">
            Curated study notes, official PDF downloads, learning diagrams, and lecturer focus guidance across all 15 syllabus topics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Link
            to="/student/units/1/weeks/1?tab=mindmap"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition flex items-center gap-1.5"
            title="Open Interactive SDLC Mind Map & Lifecycle Diagram"
          >
            <GitBranch className="w-4 h-4 text-gold-300" />
            <span>Mind Map & Lifecycle</span>
          </Link>
          <Link
            to="/student/analytics"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition flex items-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4 text-gold-300" />
            <span>Lab Analytics</span>
          </Link>
          <Link
            to="/student/final-test"
            className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-brand-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <span>Exam Readiness</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 2. Lecturer-Recommended Focus Guidance (James Mwangi - Faculty) */}
      {lecturerTopics.length > 0 && (
        <section className="bg-white rounded-2xl border border-brand-100 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-700" />
              <h2 className="font-bold text-sm text-slate-900">Lecturer-Recommended Focus Areas</h2>
            </div>
            <span className="text-xs text-brand-800 font-semibold">James Mwangi (Faculty)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lecturerTopics.map((topic: any) => (
              <div
                key={topic.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-brand-300 transition space-y-1 bg-brand-50/20 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-xs text-slate-900">{topic.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{topic.description}</p>
                </div>
                {topic.rationale && (
                  <p className="text-[11px] text-brand-800 italic bg-white p-2 rounded-lg mt-2 border border-brand-100">
                    Faculty note: {topic.rationale}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Search & Category Filters */}
      <section className="bg-white rounded-2xl border border-brand-100 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search labs, keywords, SOLID, COCOMO, Agile..."
              className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
            {["All", "Foundations", "Design", "Quality", "Management"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-brand-700 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat === "All" ? "All 15 Labs" : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 15-Lab Roadmap Learning Pathway Header & Phase Milestones */}
      <section className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-2xl p-6 text-white shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-400/30">
                Syllabus Mastery Curriculum
              </span>
              <span className="text-xs text-slate-400 font-medium">15 Progressive Milestones</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">15-Lab Roadmap Learning Pathway</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Step through the four progressive engineering phases from foundational requirements through enterprise architecture, rigorous automated QA, and software project management.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <span className="px-3 py-1 rounded-xl bg-white/10 text-gold-300 font-bold text-xs border border-white/10">
              Showing {filteredTopics.length} of 15 Labs
            </span>
          </div>
        </div>

        {/* Visual 4-Phase Pathway Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-brand-300">
              <span>Phase 1</span>
              <span>Labs 1–4</span>
            </div>
            <p className="text-xs font-semibold text-white truncate">Foundations & SRS</p>
            <span className="text-[10px] text-slate-400 block">SDLC, Agile, SRS Specs</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-blue-300">
              <span>Phase 2</span>
              <span>Labs 5–8</span>
            </div>
            <p className="text-xs font-semibold text-white truncate">Architecture & Design</p>
            <span className="text-[10px] text-slate-400 block">DFD, UML, GoF & SOLID</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300">
              <span>Phase 3</span>
              <span>Labs 9–11</span>
            </div>
            <p className="text-xs font-semibold text-white truncate">Testing & Quality</p>
            <span className="text-[10px] text-slate-400 block">Pyramid, V&V, Evolution</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-purple-300">
              <span>Phase 4</span>
              <span>Labs 12–15</span>
            </div>
            <p className="text-xs font-semibold text-white truncate">Project Governance</p>
            <span className="text-[10px] text-slate-400 block">CPM, COCOMO, Git DAG</span>
          </div>
        </div>
      </section>

      {/* 5. The 15 Lab Pathway Cards */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTopics.map((topic) => (
            <div
              key={topic.number}
              className="bg-white rounded-2xl border border-slate-200 hover:border-brand-400 hover:shadow-md transition flex flex-col justify-between p-5 space-y-4"
            >
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-brand-100 text-brand-900 font-bold text-xs flex items-center justify-center">
                      Lab {topic.number}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {topic.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">{topic.filesize}</span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-slate-900 leading-snug">
                  {topic.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {topic.summary}
                </p>

                {/* Core Takeaways */}
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                    Core Lab Learning Competencies
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-700">
                    {topic.coreConcepts.map((concept, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                        <span className="leading-tight">{concept}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Special Direct Link to Interactive Mind Map & Lifecycle Diagram for Lab 1 (SDLC) */}
                {topic.number === 1 && (
                  <Link
                    to="/student/units/1/weeks/1?tab=mindmap"
                    className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:border-brand-400 text-brand-900 font-bold text-xs flex items-center justify-between transition group shadow-xs"
                    title="Explore Interactive SDLC Mind Map & Lifecycle Diagram"
                  >
                    <span className="flex items-center gap-1.5">
                      <GitBranch className="w-4 h-4 text-brand-600" />
                      <span>Interactive SDLC Mind Map & Lifecycle</span>
                    </span>
                    <span className="text-[11px] text-brand-700 flex items-center gap-0.5 group-hover:translate-x-0.5 transition font-semibold">
                      Explore Visuals →
                    </span>
                  </Link>
                )}
              </div>

              {/* Action Buttons: PDF Download & Go to Lab */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`/revision_pdfs/${topic.filename}`}
                  download={topic.filename}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs transition shadow-xs"
                  title={`Download Official PDF Guide for Lab ${topic.number}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Guide PDF</span>
                </a>

                <Link
                  to={`/student/lab/${topic.assessmentId}`}
                  className="py-2 px-3 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50 text-slate-700 hover:text-brand-900 font-bold text-xs transition flex items-center gap-1.5"
                  title="Launch Interactive Lab Assessment"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-brand-700" />
                  <span>Attempt Lab</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <AITutorDrawer />
    </div>
  );
};
