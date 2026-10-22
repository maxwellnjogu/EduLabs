import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { MaxLabsLogo } from "../../components/common/MaxLabsLogo";
import {
  GraduationCap,
  Building,
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export const StudentRegisterPage: React.FC = () => {
  const [institutions, setInstitutions] = useState<Array<{ name: string; code: string }>>([]);
  const [universityCode, setUniversityCode] = useState("RU");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [email, setEmail] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState(2);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { setSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.getInstitutions()
      .then((data) => {
        setInstitutions(data);
        if (data.length > 0 && !data.some((i: any) => i.code === "RU")) {
          setUniversityCode(data[0].code);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch institutions:", err);
      });
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.studentRegister({
        first_name: firstName,
        last_name: lastName,
        admission_number: admissionNumber,
        email,
        university_code: universityCode,
        year_of_study: Number(yearOfStudy),
        password,
        confirm_password: confirmPassword,
      });

      // Save tokens and login
      setSession({ access: res.access, refresh: res.refresh, user: res.user });
      setSuccess(true);
      setTimeout(() => {
        navigate("/student/dashboard");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check your information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center">
        <MaxLabsLogo size={110} />
        <h2 className="mt-2 text-3xl font-extrabold text-brand-900 tracking-tight">
          Create Student Account
        </h2>
        <p className="mt-1 text-sm font-semibold text-brand-700 uppercase tracking-wide">
          MaxLabs • Student Registration
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Join your cohort for personalized learning, lab simulations and exam readiness
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Registration successful! Redirecting to your dashboard...</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>
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
            </div>

            {/* Names row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>First Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Sarah"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Wanjiru"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>
            </div>

            {/* Admission Number & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  <span>Admission Number</span>
                </label>
                <input
                  type="text"
                  required
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value)}
                  placeholder="e.g. RU-2026-088"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Year of Study</span>
                </label>
                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                >
                  <option value={1}>Year 1</option>
                  <option value={2}>Year 2 (Current Cohort)</option>
                  <option value={3}>Year 3</option>
                  <option value={4}>Year 4</option>
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Student Email</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@riara.ac.ke"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              />
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-md shadow-brand-600/20 disabled:opacity-50 transition flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Create Account & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Links back to login */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-center text-xs text-slate-600 space-y-2">
            <div>
              Already have an account?{" "}
              <Link to="/student/login" className="font-bold text-brand-700 hover:text-brand-900 underline">
                Sign in here
              </Link>
            </div>
            <div className="pt-2 flex justify-between text-slate-400">
              <Link to="/lecturer/register" className="hover:text-purple-600">
                Lecturer Registration →
              </Link>
              <Link to="/student/login" className="hover:text-slate-600">
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
