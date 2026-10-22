import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Building,
  BookOpen,
  Filter,
  Lock,
  ArrowRight,
  Sparkles,
  Layers,
  GraduationCap,
  Info,
} from "lucide-react";

interface PublicLabItem {
  id: string;
  title: string;
  unitCode: string;
  unitName: string;
  faculty: string;
  university: string;
  description: string;
  topics: string[];
  isDemonstrated: boolean; // Software Engineering is actively demonstrated
  enrolmentRequired: boolean;
}

const SAMPLE_PUBLIC_LABS: PublicLabItem[] = [
  {
    id: "pub-1",
    title: "SDLC Phases & Agile Methodologies",
    unitCode: "RCS 305",
    unitName: "Software Engineering",
    faculty: "Computing Sciences",
    university: "Riara University",
    description: "Iterative development, sprint planning, three-tier deployment isolation, and test pyramid architecture.",
    topics: ["SDLC", "Agile", "Scrum", "Testing Tiers"],
    isDemonstrated: true,
    enrolmentRequired: true,
  },
  {
    id: "pub-2",
    title: "Contract Formation & Digital Offer-Acceptance",
    unitCode: "LAW 201",
    unitName: "Law of Contract",
    faculty: "Riara Law School",
    university: "Riara University",
    description: "Mock trial lab evaluating consideration, intention to create legal relations, and e-commerce transactions.",
    topics: ["Offer & Acceptance", "Consideration", "Breach Remedies"],
    isDemonstrated: false,
    enrolmentRequired: true,
  },
  {
    id: "pub-3",
    title: "Diplomatic Protocol & Crisis Simulation",
    unitCode: "IR 302",
    unitName: "International Relations & Diplomacy",
    faculty: "International Relations",
    university: "Riara University",
    description: "Simulated multilateral security negotiations, bilateral treaties, and humanitarian intervention scenarios.",
    topics: ["Diplomatic Immunity", "UN Resolutions", "Crisis Management"],
    isDemonstrated: false,
    enrolmentRequired: true,
  },
  {
    id: "pub-4",
    title: "Financial Statement Analysis & Capital Budgeting",
    unitCode: "BCM 204",
    unitName: "Bachelor of Commerce (BCOM)",
    faculty: "School of Business",
    university: "Riara University",
    description: "Interactive ratio analysis, Net Present Value (NPV) modeling, and working capital optimization.",
    topics: ["NPV & IRR", "DuPont Analysis", "Cash Flow Forecasting"],
    isDemonstrated: false,
    enrolmentRequired: true,
  },
  {
    id: "pub-5",
    title: "Enterprise System Integration & ERP Architectures",
    unitCode: "BIT 301",
    unitName: "Bachelor of Business Information Technology (BBIT)",
    faculty: "School of Business & Tech",
    university: "Riara University",
    description: "Business process re-engineering, SAP/Odoo modular workflows, and supply chain data schemas.",
    topics: ["ERP Workflows", "Business Process Mapping", "CRM Integration"],
    isDemonstrated: false,
    enrolmentRequired: true,
  },
  {
    id: "pub-6",
    title: "Crisis Communications & Brand Reputation Lab",
    unitCode: "COM 210",
    unitName: "Strategic Communications",
    faculty: "Communication & Media",
    university: "Riara University",
    description: "Interactive media response drafting, stakeholder management under press scrutiny, and press release analytics.",
    topics: ["Press Briefings", "PR Ethics", "Digital Media Response"],
    isDemonstrated: false,
    enrolmentRequired: true,
  },
  {
    id: "pub-7",
    title: "Interactive UX Prototyping & Motion Design",
    unitCode: "MMD 305",
    unitName: "Multimedia & Design Thinking",
    faculty: "Media & Design",
    university: "Riara University",
    description: "High-fidelity wireframing, micro-interactions, responsive accessibility audits, and design heuristics.",
    topics: ["Figma Wireframes", "WCAG 2.1", "Micro-interactions"],
    isDemonstrated: false,
    enrolmentRequired: true,
  },
  {
    id: "pub-8",
    title: "Subnetting, Packet Routing & VLAN Isolation",
    unitCode: "RCS 302",
    unitName: "Computer Networks & Distributed Systems",
    faculty: "Computing Sciences",
    university: "Riara University",
    description: "Packet capture analysis, CIDR subnet allocation, router ACL rules, and distributed RPC topologies.",
    topics: ["TCP/IP", "VLAN Segmentation", "Wireshark Pcap"],
    isDemonstrated: false,
    enrolmentRequired: true,
  },
  {
    id: "pub-9",
    title: "Query Optimization & ACID Transaction Concurrency",
    unitCode: "RCS 301",
    unitName: "Database Systems Architecture",
    faculty: "Computing Sciences",
    university: "Riara University",
    description: "B-Tree index tuning, SQL execution plans, two-phase locking protocols, and WAL replication.",
    topics: ["B-Tree Indexes", "ACID Compliance", "Deadlock Prevention"],
    isDemonstrated: false,
    enrolmentRequired: true,
  },
];

export const StudentPublicLabsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("all");
  const [selectedFaculty, setSelectedFaculty] = useState("all");

  const universities = ["all", "Riara University", "USIU-Africa", "Daystar University"];
  const faculties = [
    "all",
    "Computing Sciences",
    "Riara Law School",
    "International Relations",
    "School of Business",
    "School of Business & Tech",
    "Communication & Media",
    "Media & Design",
  ];

  const filteredLabs = SAMPLE_PUBLIC_LABS.filter((lab) => {
    const matchesSearch =
      lab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.topics.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesUni = selectedUniversity === "all" || lab.university === selectedUniversity;
    const matchesFaculty = selectedFaculty === "all" || lab.faculty === selectedFaculty;

    return matchesSearch && matchesUni && matchesFaculty;
  });

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <section className="bg-brand-800 rounded-2xl p-6 text-white shadow-md border-b-4 border-gold-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-gold-200 border border-white/20">
                Institutional Catalogue
              </span>
              <span className="text-xs text-brand-200">• Open Curriculum Browse</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Public Unit Labs</h1>
            <p className="text-xs text-brand-100 mt-1 max-w-2xl leading-relaxed">
              Explore hands-on curriculum modules and practical laboratory blueprints across Riara University faculties and partner programmes.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-brand-900/60 p-3 rounded-xl border border-brand-700/60 text-xs text-brand-100 self-start md:self-auto">
            <Building className="w-4 h-4 text-gold-300 shrink-0" />
            <span>Riara University & Cross-Faculty Labs</span>
          </div>
        </div>
      </section>

      {/* Notice Banner: Permissions & Prototype disclaimer */}
      <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-950 flex items-start gap-3">
        <Info className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Catalogue Access Notice: </span>
          Public browsing allows syllabus and learning objective review. In accordance with university academic policies, taking assessments, submitting labs, and viewing instructor notes requires active semester enrolment in the respective unit. Sample institutions and curriculum entries are prototype demonstration records.
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-brand-100 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by lab, code, or topic..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          {/* University selector */}
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-brand-700 shrink-0" />
            <select
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Universities</option>
              {universities.filter((u) => u !== "all").map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Faculty / Subject selector */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-brand-700 shrink-0" />
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Faculties & Disciplines</option>
              {faculties.filter((f) => f !== "all").map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span>Showing {filteredLabs.length} matching laboratory blueprints</span>
          {(searchTerm || selectedUniversity !== "all" || selectedFaculty !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedUniversity("all");
                setSelectedFaculty("all");
              }}
              className="text-brand-700 hover:text-brand-900 font-bold"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Public Labs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLabs.map((lab) => (
          <div
            key={lab.id}
            className={`p-5 rounded-2xl border flex flex-col justify-between bg-white transition shadow-sm ${
              lab.isDemonstrated
                ? "border-brand-400 ring-2 ring-brand-200 shadow-md"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${
                    lab.isDemonstrated
                      ? "bg-brand-100 text-brand-900"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {lab.unitCode}
                </span>
                {lab.isDemonstrated ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-700 text-white flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-gold-300" /> Active Demo
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-500">
                    {lab.faculty}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">{lab.title}</h3>
              <p className="text-[11px] font-medium text-brand-800 mt-0.5">{lab.unitName}</p>
              <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                {lab.description}
              </p>

              {/* Topic chips */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {lab.topics.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-between">
                <span>{lab.university}</span>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Enrolment required
                </span>
              </div>

              {lab.isDemonstrated ? (
                <Link
                  to="/student/units/1"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs transition-colors"
                >
                  <span>Launch Demonstrator Unit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <div className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5 cursor-not-allowed">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Curriculum Locked (Sample)</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
