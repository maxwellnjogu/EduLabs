import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  CheckCircle2,
  Trophy,
  History,
  FileCheck,
  BrainCircuit,
  BarChart3,
  ShieldAlert,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  Compass,
  FlaskConical,
} from "lucide-react";

interface SidebarProps {
  portal?: "student" | "lecturer" | "admin";
}

interface SidebarLink {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ portal: propPortal }) => {
  const { user } = useAuth();
  const portal = propPortal || user?.role || "student";

  const studentLinks: SidebarLink[] = [
    { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/student/labs", label: "Learning Labs", icon: FlaskConical },
    { to: "/student/revision", label: "Revision Hub", icon: BrainCircuit },
    { to: "/student/analytics", label: "Lab Analytics", icon: BarChart3 },
    { to: "/student/final-test", label: "Exam Readiness", icon: FileCheck },
    { to: "/student/leaderboard", label: "Leaderboard", icon: Trophy },
    { to: "/student/public-labs", label: "Public Unit Labs", icon: Compass },
    { to: "/student/history", label: "Past Semesters", icon: History },
  ];

  const lecturerLinks: SidebarLink[] = [
    { to: "/lecturer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/lecturer/units", label: "Assigned Units", icon: BookOpen },
    { to: "/lecturer/units/1/weeks", label: "14-Wk Curriculum", icon: Layers },
    { to: "/lecturer/units/1/builder", label: "Assessment Builder", icon: Sparkles, badge: "Generator" },
    { to: "/lecturer/units/1/exam-readiness-builder", label: "Readiness Builder", icon: FileCheck, badge: "60 Qs" },
    { to: "/lecturer/units/1/analytics", label: "Student Analytics", icon: BarChart3 },
    { to: "/lecturer/units/1/revision", label: "Revision Pack", icon: BrainCircuit },
    { to: "/lecturer/units/1/approvals", label: "Exam Approvals", icon: CheckCircle2 },
  ];

  const adminLinks: SidebarLink[] = [
    { to: "/admin/soc", label: "SOC Overview", icon: Activity },
    { to: "/admin/soc/events", label: "Threat Alerts Feed", icon: ShieldAlert },
    { to: "/admin/soc/audit", label: "Audit Trail", icon: Terminal },
  ];

  const links: SidebarLink[] = {
    student: studentLinks,
    lecturer: lecturerLinks,
    admin: adminLinks,
  }[portal] || studentLinks;

  const sidebarClass = portal === "admin"
    ? "bg-slate-900 border-slate-800 text-slate-300"
    : "bg-white border-slate-200 text-slate-700 shadow-sm";

  return (
    <aside className={`w-64 rounded-2xl border min-h-[calc(100vh-6rem)] flex flex-col justify-between p-4 ${sidebarClass}`}>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-3">
          {portal === "admin" ? "Mini SOC Defense" : portal === "lecturer" ? "Faculty Controls" : "Student Learning"}
        </div>
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => {
                  if (portal === "admin") {
                    return `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition ${
                      isActive
                        ? "bg-rose-950/80 text-rose-300 border border-rose-800"
                        : "hover:bg-slate-800 text-slate-300"
                    }`;
                  }
                  return `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? "bg-brand-50 text-brand-700 font-bold border border-brand-200"
                      : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                  }`;
                }}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    portal === "admin"
                      ? "bg-rose-900/60 text-rose-300 border border-rose-700"
                      : "bg-brand-100 text-brand-800"
                  }`}>
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className={`pt-4 border-t ${portal === "admin" ? "border-slate-800" : "border-slate-100"}`}>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
          Active Environment
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-600 text-[11px] leading-tight flex items-center justify-between">
          <span>Riara University</span>
          <span className="w-2 h-2 rounded-full bg-brand-500" />
        </div>
      </div>
    </aside>
  );
};
