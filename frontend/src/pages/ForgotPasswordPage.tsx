import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { MaxLabsLogo } from "../components/common/MaxLabsLogo";
import {
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userRole, setUserRole] = useState("student");
  const [infoMessage, setInfoMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.requestPasswordReset(identifier);
      setResetToken(res.reset_token);
      setUserRole(res.role || "student");
      setInfoMessage(res.message);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "No account found matching this identifier.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.confirmPasswordReset({
        identifier,
        reset_token: resetToken,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setUserRole(res.role || userRole);
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please verify the code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center">
        <MaxLabsLogo size={110} />
        <h2 className="mt-2 text-3xl font-extrabold text-brand-900 tracking-tight">
          Password Recovery
        </h2>
        <p className="mt-1 text-sm font-semibold text-brand-700 uppercase tracking-wide">
          MaxLabs • Secure Access Verification
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Reset your portal access using your admission number, username, or registered email
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <form className="space-y-4" onSubmit={handleRequestReset}>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account Identifier</span>
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. RU-2026-041 or jmwangi or email"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Enter your Student Admission Number, Faculty Username, or Email address.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-md shadow-brand-600/20 disabled:opacity-50 transition flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Checking Account...</span>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-4" onSubmit={handleConfirmReset}>
              {infoMessage && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">{infoMessage}</span>
                    <div className="mt-1 text-[11px] text-blue-700">
                      Sandbox Code: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">{resetToken}</code>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  <span>Verification Code</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="e.g. MAX-123456"
                    className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setResetToken(resetToken || "123456")}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-brand-100 text-brand-800 hover:bg-brand-200"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>New Password</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  Confirm New Password
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

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-md shadow-brand-600/20 disabled:opacity-50 transition flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Updating Password...</span>
                ) : (
                  <>
                    <span>Confirm & Reset Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Password Successfully Reset!
              </h3>
              <p className="text-xs text-slate-600">
                Your new security credentials have been securely updated. You can now log into your MaxLabs portal.
              </p>
              <div className="pt-2">
                <Link
                  to={userRole === "lecturer" ? "/lecturer/login" : "/student/login"}
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 transition"
                >
                  <span>Go to {userRole === "lecturer" ? "Lecturer" : "Student"} Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Footer Back Links */}
          <div className="mt-6 pt-5 border-t border-slate-200 flex justify-between text-xs text-slate-500">
            <Link to="/student/login" className="hover:text-brand-700 font-medium">
              ← Student Login
            </Link>
            <Link to="/lecturer/login" className="hover:text-purple-600 font-medium">
              Lecturer Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
