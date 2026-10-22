import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ShieldCheck, LogOut, User, GraduationCap, BookOpen, Terminal } from "lucide-react";
import { MaxLabsLogo } from "../common/MaxLabsLogo";

interface NavbarProps {
  portal?: "student" | "lecturer" | "admin";
}

export const Navbar: React.FC<NavbarProps> = ({ portal: propPortal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const portal = propPortal || user?.role || "student";

  const handleLogout = () => {
    logout();
    navigate(`/${portal}/login`);
  };

  const portalDetails = {
    student: {
      title: "Student Portal",
      icon: GraduationCap,
      badgeColor: "bg-brand-50 text-brand-800 border-brand-200",
      theme: "border-slate-200 bg-white",
    },
    lecturer: {
      title: "Lecturer Academic Portal",
      icon: BookOpen,
      badgeColor: "bg-brand-50 text-brand-800 border-brand-200",
      theme: "border-slate-200 bg-white",
    },
    admin: {
      title: "Mini SOC Security Center",
      icon: Terminal,
      badgeColor: "bg-cyan-900/60 text-cyan-300 border-cyan-700/50",
      theme: "border-slate-800 bg-slate-950 text-white",
    },
  }[portal];

  const IconComp = portalDetails.icon;

  return (
    <header className={`sticky top-0 z-30 h-16 border-b px-4 lg:px-8 flex items-center justify-between shadow-sm transition-colors ${portalDetails.theme}`}>
      {/* Brand & Portal Name */}
      <div className="flex items-center space-x-3">
        {portal === "admin" ? (
          <Link to={`/${portal}/dashboard`} className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">EduLabs SOC</span>
          </Link>
        ) : (
          <Link to={`/${portal}/dashboard`} className="flex items-center" aria-label="MaxLabs home">
            <MaxLabsLogo size={44} showWordmark />
          </Link>
        )}

        <span className="hidden md:inline-block text-slate-300 text-lg">/</span>

        <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${portalDetails.badgeColor}`}>
          <IconComp className="w-3.5 h-3.5" />
          <span>{portalDetails.title}</span>
        </div>
      </div>

      {/* User Status & Controls */}
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-end gap-1.5">
                <span>{user.display_name || user.first_name || user.username}</span>
                {user.admission_number && (
                  <span className="text-xs font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                    {user.admission_number}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {user.university_detail?.name || "Riara University"}
              </div>
            </div>

            {/* Quick Switch Portals / Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <Link
            to={`/${portal}/login`}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};
