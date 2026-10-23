import React, { useState, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  GitBranch,
  Layers,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Download,
  Info,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Code,
  Wrench,
  Search,
  CheckSquare,
  Rocket,
  Compass,
  RefreshCw,
  Eye,
  X,
} from "lucide-react";

export interface PhaseInfo {
  id: string;
  name: string;
  type: "phase" | "methodology";
  category: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
  shortDesc: string;
  objective: string;
  keyDeliverables: string[];
  coreActivities: string[];
  examReadinessTip: string;
  realWorldInsight: string;
}

export const SDLC_PHASES_DATA: Record<string, PhaseInfo> = {
  planning: {
    id: "planning",
    name: "1. Planning & Feasibility",
    type: "phase",
    category: "SDLC Core Phase",
    color: "#2563eb",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-800",
    icon: "Compass",
    shortDesc: "Initial stage defining project objectives, feasibility studies, budget, and scope boundaries.",
    objective:
      "Establish business justification, assess technical, operational, and financial feasibility, and formulate baseline schedules and resource plans.",
    keyDeliverables: [
      "Project Charter & High-Level Scope Baseline",
      "Feasibility Study Report (Technical, Economic, Legal, Operational, Schedule - TELOS)",
      "Initial Risk Assessment Matrix",
      "Cost-Benefit Analysis & Budget Allocation",
    ],
    coreActivities: [
      "Stakeholder identification and kickoff workshops",
      "Resource allocation, talent capacity planning, and timeline milestones",
      "Identifying regulatory, compliance, and institutional constraints",
    ],
    examReadinessTip:
      "Remember Boehm's Law: Errors detected during the planning phase are 50x to 100x cheaper to remediate than errors discovered in production.",
    realWorldInsight:
      "A failed feasibility study is not a wasted effort; terminating an unviable project in Planning saves millions before engineering work begins.",
  },
  analysis: {
    id: "analysis",
    name: "2. Requirement Analysis",
    type: "phase",
    category: "SDLC Core Phase",
    color: "#16a34a",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
    icon: "Search",
    shortDesc: "Elicitation, negotiation, and formal specification of functional and non-functional requirements.",
    objective:
      "Deeply understand stakeholder needs, define system behavior, and produce an unambiguous, verifiable Software Requirements Specification (SRS).",
    keyDeliverables: [
      "Software Requirements Specification (SRS) compliant with IEEE 830",
      "Use Case Narratives & Activity Diagrams",
      "Data Flow Diagrams (Level 0 Context and Level 1 DFDs)",
      "Requirements Traceability Matrix (RTM)",
    ],
    coreActivities: [
      "Conducting user interviews, surveys, and Joint Application Design (JAD) sessions",
      "Distinguishing functional requirements (what the system does) from non-functional quality attributes (performance, security, SLA)",
      "MoSCoW prioritization (Must-have, Should-have, Could-have, Won't-have)",
    ],
    examReadinessTip:
      "The SRS is a legal and technical contract. An ambiguous requirement directly produces flawed architecture and invalid test cases.",
    realWorldInsight:
      "Traceability matrices built during Analysis ensure no customer requirement gets lost across subsequent design and testing phases.",
  },
  design: {
    id: "design",
    name: "3. Design & Architecture",
    type: "phase",
    category: "SDLC Core Phase",
    color: "#0891b2",
    badgeBg: "bg-cyan-100",
    badgeText: "text-cyan-800",
    icon: "Layers",
    shortDesc: "Translating requirements into architectural blueprints, data schemas, and UI layouts.",
    objective:
      "Create high-level architectural topologies and low-level component specifications that guide software developers without ambiguity.",
    keyDeliverables: [
      "High-Level Design (HLD): System architecture, microservice topology, API contracts",
      "Low-Level Design (LLD): Class diagrams, ERDs, sequence diagrams, state machines",
      "Database Schema & Entity Relationship Diagrams (ERDs)",
      "UI/UX Wireframes, Design Tokens, and Component Design System",
    ],
    coreActivities: [
      "Selecting architectural styles (Monolithic, Microservices, Event-Driven)",
      "Applying SOLID object-oriented design principles and Gang of Four design patterns",
      "Defining data dictionaries, relational normalization (3NF/BCNF), and cache topologies",
    ],
    examReadinessTip:
      "HLD specifies *what* technologies and system components exist; LLD defines *how* specific modules, interfaces, and algorithms execute.",
    realWorldInsight:
      "Good design balances coupling and cohesion: high cohesion within modules and loose coupling between separate subsystems.",
  },
  coding: {
    id: "coding",
    name: "4. Implementation & Coding",
    type: "phase",
    category: "SDLC Core Phase",
    color: "#ea580c",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-800",
    icon: "Code",
    shortDesc: "Translating detailed software designs into executable, maintainable source code.",
    objective:
      "Construct bug-free, high-performance, well-commented source code conforming to architectural standards and design specifications.",
    keyDeliverables: [
      "Clean source code repository with semantic versioning",
      "Automated Unit Test Suites (e.g. pytest, JUnit, Vitest)",
      "Peer Code Review sign-offs and Pull Request artifacts",
      "API documentation (OpenAPI / Swagger specifications)",
    ],
    coreActivities: [
      "Writing modular, defensive code adhering to language-specific style guides",
      "Conducting peer code reviews and static security scanning (SAST)",
      "Integrating continuous integration (CI) workflows for automated builds",
    ],
    examReadinessTip:
      "Unit testing happens during implementation, performed by developers themselves to verify individual methods and functions in isolation.",
    realWorldInsight:
      "Writing clean, readable code with automated test coverage drastically lowers maintenance overhead for future development teams.",
  },
  testing: {
    id: "testing",
    name: "5. Testing & Verification",
    type: "phase",
    category: "SDLC Core Phase",
    color: "#9333ea",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-800",
    icon: "CheckSquare",
    shortDesc: "Validating that the software satisfies functional requirements and quality standards.",
    objective:
      "Detect defects, evaluate reliability under load, verify security posture, and confirm stakeholder acceptance before production deployment.",
    keyDeliverables: [
      "Test Plan & Test Strategy Matrix",
      "Automated Integration, Regression, and End-to-End (E2E) Test Suites",
      "Defect Severity and Bug Tracking Reports",
      "User Acceptance Testing (UAT) Sign-off Certificate",
    ],
    coreActivities: [
      "Executing integration testing (Big Bang vs Incremental Top-down/Bottom-up)",
      "Performance, stress, and security vulnerability penetration testing",
      "Boundary value analysis, equivalence partitioning, and black-box/white-box test case design",
    ],
    examReadinessTip:
      "Verification asks: 'Are we building the product right?' (conformance to spec). Validation asks: 'Are we building the right product?' (satisfies user needs).",
    realWorldInsight:
      "Automated regression testing prevents new feature commits from silently breaking previously working application modules.",
  },
  deployment: {
    id: "deployment",
    name: "6. Deployment & Release",
    type: "phase",
    category: "SDLC Core Phase",
    color: "#e11d48",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-800",
    icon: "Rocket",
    shortDesc: "Packaging, staging, releasing, and configuring the verified build in production.",
    objective:
      "Transition verified software into live production with zero downtime, data integrity preservation, and verified rollback safeguards.",
    keyDeliverables: [
      "Production Deployment Checklist & Runbook",
      "Automated CI/CD Delivery Pipeline Configuration",
      "Infrastructure-as-Code (Terraform, Docker, Kubernetes manifests)",
      "Release Notes & System User Manuals",
    ],
    coreActivities: [
      "Staging environment rehearsal and database migration dry-runs",
      "Executing release strategies: Blue-Green deployments, Canary rollouts, or Rolling upgrades",
      "Configuring DNS routing, SSL certificates, load balancers, and production monitoring",
    ],
    examReadinessTip:
      "Canary deployments release the update to a small 5-10% cohort of users first to verify stability before updating the entire fleet.",
    realWorldInsight:
      "A deployment is only complete once telemetry confirms healthy HTTP status codes, error rates remain below baseline, and backups are confirmed.",
  },
  maintenance: {
    id: "maintenance",
    name: "7. Evolution & Maintenance",
    type: "phase",
    category: "SDLC Core Phase",
    color: "#d97706",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-800",
    icon: "Wrench",
    shortDesc: "Ongoing defect remediation, security patching, performance tuning, and adaptive enhancements.",
    objective:
      "Sustain software availability, patch newly disclosed vulnerabilities, adapt to environment changes, and enhance capabilities over the product lifecycle.",
    keyDeliverables: [
      "Incident Response Reports & Root Cause Analyses (RCA)",
      "Security Patches & Dependency Upgrade Releases",
      "Performance Optimization Benchmarks",
      "System Retirement / Decommissioning Plan",
    ],
    coreActivities: [
      "Corrective Maintenance: Diagnosing and resolving user-reported defects",
      "Adaptive Maintenance: Modifying system to accommodate OS, cloud, or regulatory updates",
      "Perfective Maintenance: Enhancing usability, throughput, and adding non-disruptive features",
      "Preventive Maintenance: Code refactoring, documentation synchronization, and technical debt reduction",
    ],
    examReadinessTip:
      "Maintenance accounts for 60% to 70% of total software lifecycle costs! It represents the longest and most resource-intensive phase.",
    realWorldInsight:
      "Paying down technical debt during preventive maintenance prevents brittle architectures that become impossible to upgrade.",
  },
  waterfall: {
    id: "waterfall",
    name: "Waterfall Methodology",
    type: "methodology",
    category: "Process Paradigm",
    color: "#ca8a04",
    badgeBg: "bg-yellow-100",
    badgeText: "text-yellow-800",
    icon: "GitBranch",
    shortDesc: "Linear, sequential plan-driven methodology where each phase gates the next.",
    objective:
      "Provide strict predictability, detailed documentation, and rigid phase milestones for safety-critical or fixed-specification projects.",
    keyDeliverables: [
      "Rigid phase gate sign-offs at each step",
      "Comprehensive, immutable upfront SRS documentation",
      "Formal audit and compliance logs",
    ],
    coreActivities: [
      "Completing 100% of requirements before beginning architecture",
      "Completing all coding before independent testing begins",
      "Formal change control board reviews for any scope alterations",
    ],
    examReadinessTip:
      "Waterfall's main weakness is inflexibility to change: working software is delivered only at the very end of the lifecycle.",
    realWorldInsight:
      "Waterfall is ideal for aerospace flight software, biomedical implants, and banking ledgers where post-release bugs carry catastrophic liability.",
  },
  adaptive: {
    id: "adaptive",
    name: "Adaptive / Iterative Model",
    type: "methodology",
    category: "Process Paradigm",
    color: "#0284c7",
    badgeBg: "bg-sky-100",
    badgeText: "text-sky-800",
    icon: "Layers",
    shortDesc: "Cyclical development producing successive releases with incremental refinements.",
    objective:
      "Mitigate architectural risk early by building an initial simplified core, then iteratively refining it through successive feedback cycles.",
    keyDeliverables: [
      "Working prototype increments at the conclusion of each iteration",
      "Iterative risk evaluation and architectural adjustment logs",
      "Progressive feature roadmap",
    ],
    coreActivities: [
      "Breaking large systems into smaller functional increments",
      "Validating architecture with working software early in the lifecycle",
      "Adjusting subsequent iteration backlogs based on stakeholder reviews",
    ],
    examReadinessTip:
      "Boehm's Spiral Model is a classic risk-driven iterative framework that incorporates formal risk analysis at every circular loop.",
    realWorldInsight:
      "Iterative development prevents the 'big bang' integration disasters common in long linear waterfall projects.",
  },
  agile: {
    id: "agile",
    name: "Agile Framework",
    type: "methodology",
    category: "Process Paradigm",
    color: "#15803d",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
    icon: "Sparkles",
    shortDesc: "Value-driven philosophy emphasizing collaboration, flexibility, and rapid delivery.",
    objective:
      "Deliver continuous business value through customer collaboration, responsive feedback loops, and cross-functional self-organizing teams.",
    keyDeliverables: [
      "Potentially shippable working software increments",
      "Dynamic Product Backlog prioritized by business value",
      "Customer feedback retrospectives",
    ],
    coreActivities: [
      "Valuing individuals and interactions over processes and tools",
      "Prioritizing working software over comprehensive documentation",
      "Collaborating continuously with customers over contract negotiation",
      "Welcoming changing requirements, even late in development",
    ],
    examReadinessTip:
      "Agile is not a specific prescriptive recipe, but an umbrella philosophy defined by the 4 values and 12 principles of the Agile Manifesto (2001).",
    realWorldInsight:
      "Agile thrives in environments with volatile requirements, fast time-to-market pressure, and highly collaborative customer champions.",
  },
  scrum: {
    id: "scrum",
    name: "Scrum Methodology",
    type: "methodology",
    category: "Process Paradigm",
    color: "#7c3aed",
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-800",
    icon: "ShieldCheck",
    shortDesc: "Empirical Agile framework structured around fixed 1-4 week cadence sprints.",
    objective:
      "Organize cross-functional engineering teams around strict timeboxed sprints to predictably inspect, adapt, and ship increments.",
    keyDeliverables: [
      "Product Backlog & Sprint Backlog",
      "Potentially Shippable Product Increment at Sprint end",
      "Sprint Burndown Charts & Velocity Metrics",
    ],
    coreActivities: [
      "3 Roles: Product Owner (backlog prioritization), Scrum Master (coach & obstacle remover), Developers",
      "5 Events: Sprint Planning, Daily Standup (15 min sync), Sprint Execution, Sprint Review, Sprint Retrospective",
      "3 Artifacts: Product Backlog, Sprint Backlog, Product Increment with strict Definition of Done (DoD)",
    ],
    examReadinessTip:
      "Daily Standups ask 3 questions: What did I complete yesterday? What will I work on today? What impediments are blocking my progress?",
    realWorldInsight:
      "Scrum creates psychological safety through regular retrospectives where teams continuously refine their technical practices and communication.",
  },
};

export const SDLCMindMapViewer: React.FC = () => {
  // Zoom state for Card 1 (Interactive Mind Map)
  const [mindMapZoom, setMindMapZoom] = useState<number>(100);
  // Zoom state for Card 2 (SDLC Lifecycle Diagram)
  const [lifecycleZoom, setLifecycleZoom] = useState<number>(100);

  // Selected phase or methodology
  const [selectedItemKey, setSelectedItemKey] = useState<string>("analysis");

  // Lightbox / Modal state
  const [modalImage, setModalImage] = useState<{ src: string; title: string; alt: string; zoom: number } | null>(null);

  // Accessible Tree View expansion state
  const [isTreeExpanded, setIsTreeExpanded] = useState<boolean>(true);
  const [isPhasesOpen, setIsPhasesOpen] = useState<boolean>(true);
  const [isMethodologiesOpen, setIsMethodologiesOpen] = useState<boolean>(true);

  const selectedItem = SDLC_PHASES_DATA[selectedItemKey] || SDLC_PHASES_DATA["analysis"];

  // Phase & Methodology keys
  const phaseKeys = ["planning", "analysis", "design", "coding", "testing", "deployment", "maintenance"];
  const methodologyKeys = ["waterfall", "adaptive", "agile", "scrum"];

  // 5 circular lifecycle stages
  const lifecyclePhases = [
    { key: "analysis", label: "Requirement Analysis", color: "#16a34a" },
    { key: "design", label: "Design", color: "#0891b2" },
    { key: "coding", label: "Implementation", color: "#ea580c" },
    { key: "testing", label: "Testing", color: "#9333ea" },
    { key: "maintenance", label: "Evolution", color: "#d97706" },
  ];

  const handleMindMapZoomIn = () => setMindMapZoom((prev) => Math.min(prev + 25, 250));
  const handleMindMapZoomOut = () => setMindMapZoom((prev) => Math.max(prev - 25, 60));
  const handleMindMapReset = () => setMindMapZoom(100);

  const handleLifecycleZoomIn = () => setLifecycleZoom((prev) => Math.min(prev + 25, 250));
  const handleLifecycleZoomOut = () => setLifecycleZoom((prev) => Math.max(prev - 25, 60));
  const handleLifecycleReset = () => setLifecycleZoom(100);

  return (
    <div className="space-y-6">
      {/* 1. Explanatory Comparative Caption Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
                SDLC Visual Learning Models
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                Side-by-Side Reference
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              The <strong>Interactive SDLC Mind Map</strong> explores foundational engineering concepts, branching
              relationships, artifacts, and paradigms across the full lifecycle, while the circular{" "}
              <strong>SDLC Lifecycle Diagram</strong> illustrates the continuous, iterative development loop connecting
              Requirement Analysis, Design, Implementation, Testing, and Evolution.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Dual Side-by-Side Cards (Stacked on Mobile, Side-by-Side on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ======================================================== */}
        {/* CARD 1: Interactive SDLC Mind Map                        */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          {/* Card 1 Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                  Visual Model 1
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-brand-600" />
                <span>Interactive SDLC Mind Map</span>
              </h3>
            </div>

            {/* Zoom & View Controls Toolbar */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
              <button
                onClick={handleMindMapZoomOut}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold px-1 text-slate-800 min-w-[36px] text-center">
                {mindMapZoom}%
              </span>
              <button
                onClick={handleMindMapZoomIn}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition"
                title="Zoom In"
                aria-label="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleMindMapReset}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
                title="Reset Zoom (100%)"
                aria-label="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() =>
                  setModalImage({
                    src: "/a_clean_infographic_mind_map_style_diagram_on_a_wh.png",
                    title: "Interactive SDLC Mind Map",
                    alt: "Comprehensive Interactive SDLC Mind Map showing lifecycle phases, activities, and process paradigms",
                    zoom: 100,
                  })
                }
                className="p-1.5 hover:bg-slate-100 rounded-lg text-brand-700 transition"
                title="Open Larger / Fullscreen Lightbox"
                aria-label="Open Larger"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 1 Visual Canvas (Responsive fitting without cropping) */}
          <div className="relative p-4 sm:p-5 bg-slate-950 flex items-center justify-center min-h-[380px] max-h-[500px] overflow-auto select-none">
            <div
              className="transition-transform duration-200 origin-center flex items-center justify-center w-full"
              style={{ transform: `scale(${mindMapZoom / 100})` }}
            >
              <img
                src="/a_clean_infographic_mind_map_style_diagram_on_a_wh.png"
                alt="Comprehensive Interactive SDLC Mind Map showing lifecycle phases, activities, and process paradigms"
                className="max-h-[360px] sm:max-h-[420px] w-auto max-w-full object-contain rounded-xl shadow-lg border border-slate-800"
                loading="lazy"
              />
            </div>
          </div>

          {/* Card 1 Caption & Quick Jump Nodes */}
          <div className="p-4 sm:p-5 bg-white space-y-3 border-t border-slate-100 flex-1 flex flex-col justify-between">
            <div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Mind Map Overview:</strong> Explores broad architectural phases, branching artifacts, and
                process models (Waterfall, Adaptive, Agile, Scrum). Click any phase below to inspect details:
              </p>

              {/* Clickable Phase Shortcuts */}
              <div className="flex flex-wrap gap-1.5 pt-2.5">
                {phaseKeys.map((k) => {
                  const p = SDLC_PHASES_DATA[k];
                  const isSelected = selectedItemKey === k;
                  return (
                    <button
                      key={k}
                      onClick={() => setSelectedItemKey(k)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 border ${
                        isSelected
                          ? "bg-brand-700 text-white border-brand-800 shadow-2xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-brand-300"
                      }`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: isSelected ? "#ffffff" : p.color }}
                      />
                      <span>{p.name.split(". ")[1] || p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Interactive branches & syllabus nodes</span>
              <button
                onClick={() =>
                  setModalImage({
                    src: "/a_clean_infographic_mind_map_style_diagram_on_a_wh.png",
                    title: "Interactive SDLC Mind Map",
                    alt: "Comprehensive Interactive SDLC Mind Map showing lifecycle phases, activities, and process paradigms",
                    zoom: 100,
                  })
                }
                className="font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Open Larger View</span>
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 2: SDLC Lifecycle Diagram                           */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          {/* Card 2 Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Visual Model 2
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-600" />
                <span>SDLC Lifecycle Diagram</span>
              </h3>
            </div>

            {/* Zoom & View Controls Toolbar */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
              <button
                onClick={handleLifecycleZoomOut}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold px-1 text-slate-800 min-w-[36px] text-center">
                {lifecycleZoom}%
              </span>
              <button
                onClick={handleLifecycleZoomIn}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition"
                title="Zoom In"
                aria-label="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleLifecycleReset}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
                title="Reset Zoom (100%)"
                aria-label="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() =>
                  setModalImage({
                    src: "/image(20261023-143416).png",
                    title: "SDLC Lifecycle Diagram",
                    alt: "Circular Software Development Life Cycle (SDLC) diagram depicting the 5 iterative phases: Requirement Analysis, Design, Implementation, Testing, and Evolution",
                    zoom: 100,
                  })
                }
                className="p-1.5 hover:bg-slate-100 rounded-lg text-emerald-700 transition"
                title="Open Larger / Fullscreen Lightbox"
                aria-label="Open Larger"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2 Visual Canvas (Responsive fitting without cropping) */}
          <div className="relative p-4 sm:p-5 bg-slate-950 flex items-center justify-center min-h-[380px] max-h-[500px] overflow-auto select-none">
            <div
              className="transition-transform duration-200 origin-center flex items-center justify-center w-full"
              style={{ transform: `scale(${lifecycleZoom / 100})` }}
            >
              <img
                src="/image(20261023-143416).png"
                alt="Circular Software Development Life Cycle (SDLC) diagram depicting the 5 iterative phases: Requirement Analysis, Design, Implementation, Testing, and Evolution"
                className="max-h-[360px] sm:max-h-[420px] w-auto max-w-full object-contain rounded-xl shadow-lg border border-slate-800"
                loading="lazy"
              />
            </div>
          </div>

          {/* Card 2 Caption & Iterative Stage Navigation */}
          <div className="p-4 sm:p-5 bg-white space-y-3 border-t border-slate-100 flex-1 flex flex-col justify-between">
            <div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Circular Lifecycle Overview:</strong> Illustrates the cyclical, iterative progression through
                5 connected core stages. Click any stage to inspect syllabus expectations:
              </p>

              {/* 5 Circular Stages Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-2.5">
                {lifecyclePhases.map((phase) => {
                  const isSelected = selectedItemKey === phase.key;
                  return (
                    <button
                      key={phase.key}
                      onClick={() => setSelectedItemKey(phase.key)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 border ${
                        isSelected
                          ? "bg-emerald-700 text-white border-emerald-800 shadow-2xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-emerald-300"
                      }`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: isSelected ? "#ffffff" : phase.color }}
                      />
                      <span>{phase.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Iterative loop: Requirement → Evolution</span>
              <a
                href="/image(20261023-143416).png"
                download="SDLC_Lifecycle_Diagram.png"
                className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
                title="Download Lifecycle Diagram"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Asset</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Phase Detail Inspector & Accessible Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Selected Phase Detail Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          {/* Header Badge & Title */}
          <div className="border-b border-slate-100 pb-3 flex justify-between items-start gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${selectedItem.badgeBg} ${selectedItem.badgeText}`}
                >
                  {selectedItem.category}
                </span>
                <span className="text-[11px] text-slate-400">Interactive Syllabus Inspector</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {selectedItem.name}
              </h3>
            </div>

            <span
              className="w-4 h-4 rounded-full mt-1.5 shrink-0"
              style={{ backgroundColor: selectedItem.color }}
            />
          </div>

          {/* Summary / Objective */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Primary Objective
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {selectedItem.objective}
            </p>
          </div>

          {/* Key Deliverables */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Formal Deliverables & Artifacts</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {selectedItem.keyDeliverables.map((d, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0 mt-1.5" />
                  <span className="leading-snug">{d}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Activities */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-600" />
              <span>Engineering Activities</span>
            </h4>
            <ul className="space-y-1 text-xs text-slate-600">
              {selectedItem.coreActivities.map((act, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-slate-400 font-bold">•</span>
                  <span className="leading-relaxed">{act}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Exam Readiness Tip */}
          <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Lab 1 Assessment & Exam Tip</span>
            </span>
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              {selectedItem.examReadinessTip}
            </p>
          </div>

          {/* Real-World Industry Insight */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-700" />
              <span>Industry Engineering Practice</span>
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedItem.realWorldInsight}
            </p>
          </div>
        </div>

        {/* Accessible Hierarchical Tree Navigation */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
          <button
            onClick={() => setIsTreeExpanded(!isTreeExpanded)}
            className="w-full px-4 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:bg-slate-100 transition"
            aria-expanded={isTreeExpanded}
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-600" />
              <span>Accessible Curriculum Tree Navigation</span>
            </span>
            {isTreeExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {isTreeExpanded && (
            <div className="p-4 space-y-4 text-xs flex-1" role="tree" aria-label="SDLC Syllabus Tree">
              {/* SDLC 7 Phases Branch */}
              <div className="space-y-1.5">
                <button
                  onClick={() => setIsPhasesOpen(!isPhasesOpen)}
                  className="flex items-center space-x-1.5 font-bold text-slate-800 hover:text-brand-700 transition"
                >
                  {isPhasesOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                  <span>SDLC Core Phases (7 Lifecycle Gates)</span>
                </button>

                {isPhasesOpen && (
                  <div className="pl-5 space-y-1 border-l-2 border-slate-200 ml-1.5">
                    {phaseKeys.map((key) => {
                      const p = SDLC_PHASES_DATA[key];
                      const isSelected = selectedItemKey === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedItemKey(key)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg transition flex items-center justify-between ${
                            isSelected
                              ? "bg-brand-50 text-brand-800 font-bold border border-brand-200"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                          role="treeitem"
                          aria-selected={isSelected}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: p.color }}
                            />
                            <span className="truncate">{p.name}</span>
                          </span>
                          {isSelected && <ChevronRight className="w-3.5 h-3.5 text-brand-600" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Methodologies Branch */}
              <div className="space-y-1.5 pt-2">
                <button
                  onClick={() => setIsMethodologiesOpen(!isMethodologiesOpen)}
                  className="flex items-center space-x-1.5 font-bold text-slate-800 hover:text-brand-700 transition"
                >
                  {isMethodologiesOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                  <span>Process Methodologies (4 Key Paradigms)</span>
                </button>

                {isMethodologiesOpen && (
                  <div className="pl-5 space-y-1 border-l-2 border-purple-200 ml-1.5">
                    {methodologyKeys.map((key) => {
                      const m = SDLC_PHASES_DATA[key];
                      const isSelected = selectedItemKey === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedItemKey(key)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg transition flex items-center justify-between ${
                            isSelected
                              ? "bg-purple-50 text-purple-900 font-bold border border-purple-200"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                          role="treeitem"
                          aria-selected={isSelected}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: m.color }}
                            />
                            <span className="truncate">{m.name}</span>
                          </span>
                          {isSelected && <ChevronRight className="w-3.5 h-3.5 text-purple-600" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Fullscreen Zoom / Lightbox Modal */}
      {modalImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col p-4 sm:p-6"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-white">
            <div>
              <h3 className="text-sm sm:text-base font-bold">{modalImage.title}</h3>
              <p className="text-xs text-slate-400">High-Resolution Visual Inspection</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setModalImage((prev) => (prev ? { ...prev, zoom: Math.max(prev.zoom - 25, 50) } : null))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold px-2">{modalImage.zoom}%</span>
              <button
                onClick={() => setModalImage((prev) => (prev ? { ...prev, zoom: Math.min(prev.zoom + 25, 300) } : null))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setModalImage((prev) => (prev ? { ...prev, zoom: 100 } : null))}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
              >
                Reset
              </button>
              <a
                href={modalImage.src}
                download
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
                title="Download Image"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => setModalImage(null)}
                className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition ml-2"
                title="Close Lightbox (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <img
              src={modalImage.src}
              alt={modalImage.alt}
              style={{ transform: `scale(${modalImage.zoom / 100})` }}
              className="max-h-[85vh] w-auto max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};
