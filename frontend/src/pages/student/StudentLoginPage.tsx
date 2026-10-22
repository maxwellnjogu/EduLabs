import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api, type Institution } from "../../api/client";
import { GraduationCap, Lock, Building, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { MaxLabsLogo } from "../../components/common/MaxLabsLogo";

export const StudentLoginPage: React.FC = () => {
  const { loginAsStudent } = useAuth();
  const navigate = useNavigate();

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [universityCode, setUniversityCode] = useState<string>("RU");
  const [admissionNumber, setAdmissionNumber] = useState<string>("RU-2026-041");
  const [password, setPassword] = useState<string>("EduLabs@2026Secure!");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Clear any stale session tokens on login page mount
    localStorage.removeItem("EduLabs_access_token");
    localStorage.removeItem("EduLabs_refresh_token");
    localStorage.removeItem("EduLabs_user");

    api.getInstitutions()
      .then((data) => {
        if (data.length > 0) {
          setInstitutions(data);
          setUniversityCode(data[0].code);
        }
      })
      .catch(() => {
        // Fallback default prototype institutions
        setInstitutions([
          { id: 1, name: "Riara University", code: "RU", is_active: true },
          { id: 2, name: "USIU-Africa", code: "USIU", is_active: true },
          { id: 3, name: "Daystar University", code: "DU", is_active: true },
        ]);
      });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginAsStudent({
        university_code: universityCode,
        admission_number: admissionNumber,
        password,
      });
      navigate("/student/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (admNo: string, uni: string) => {
    setAdmissionNumber(admNo);
    setUniversityCode(uni);
    setPassword("EduLabs@2026Secure!");
    setError("");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center">
        <MaxLabsLogo size={130} />
        <h2 className="mt-2 text-3xl font-extrabold text-brand-900 tracking-tight">
          MaxLabs
        </h2>
        <p className="mt-1 text-sm font-semibold text-brand-700 uppercase tracking-wide">Student Portal</p>
        <p className="mt-2 text-sm text-slate-600">
          Personalised learning, interactive labs and exam readiness
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Institution Selector */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Select Institution</span>
              </label>
              <select
                value={universityCode}
                onChange={(e) => setUniversityCode(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
              >
                {institutions.map((inst) => (
                  <option key={inst.code} value={inst.code}>
                    {inst.name} ({inst.code})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-400">
                Prototype institution records for demonstration
              </p>
            </div>

            {/* Admission Number */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span>Student Admission Number</span>
              </label>
              <input
                type="text"
                required
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                placeholder="e.g. RU-2026-041"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition font-mono"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Password</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-brand-700 hover:text-brand-900"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-md shadow-brand-600/20 disabled:opacity-50 transition flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In as Student</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-600">New to MaxLabs? </span>
              <Link to="/student/register" className="text-xs font-bold text-brand-700 hover:text-brand-900 underline">
                Create Student Account
              </Link>
            </div>
          </form>

          {/* Quick Demo Fill Box */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Demo Quick-Fill Account</span>
            </div>
            <button
              type="button"
              onClick={() => handleQuickFill("RU-2026-041", "RU")}
              className="w-full text-left p-2.5 rounded-xl border border-brand-200 bg-brand-50 hover:bg-brand-100 transition text-xs flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-brand-900">Alex Kamau (Demo Student)</span>
                <div className="text-brand-700 font-mono text-[11px]">RU-2026-041 • Riara University</div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-200 text-brand-800 uppercase">
                Autofill
              </span>
            </button>
          </div>

          {/* Portal Switcher Links */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-500">
            <Link to="/lecturer/login" className="hover:text-purple-600 font-medium">
              Lecturer Portal →
            </Link>
            <Link to="/admin/login" className="hover:text-cyan-600 font-medium">
              Mini SOC Admin →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
