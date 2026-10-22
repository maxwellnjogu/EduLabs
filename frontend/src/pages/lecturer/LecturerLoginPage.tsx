import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { MaxLabsLogo } from '../../components/common/MaxLabsLogo';

export const LecturerLoginPage: React.FC = () => {
  const [username, setUsername] = useState('jmwangi');
  const [password, setPassword] = useState('EduLabs@2026Secure!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password, 'lecturer');
      navigate('/lecturer/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid credentials or unauthorized role.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-brand-900/10 border border-brand-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <MaxLabsLogo size={120} />
            <h1 className="mt-2 text-2xl font-extrabold text-brand-900 tracking-tight">MaxLabs</h1>
            <p className="text-xs text-brand-700 font-semibold tracking-wide uppercase mt-1">Lecturer Portal</p>
          </div>

          <div className="mb-6 p-3 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-900 leading-relaxed">
            <p className="font-semibold text-brand-950">Demonstration Lecturer Account</p>
            <p className="text-brand-800 mt-0.5">Faculty: <strong>James Mwangi</strong> (Software Engineering Unit Lead)</p>
            <p className="text-brand-700 font-mono text-[11px] mt-0.5">Username: jmwangi • Demo credentials pre-filled</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Faculty Username / Staff ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. jmwangi"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-brand-700 hover:text-brand-900"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate as Faculty <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-600">New educator? </span>
              <Link to="/lecturer/register" className="text-xs font-bold text-brand-700 hover:text-brand-900 underline">
                Create Faculty Account
              </Link>
            </div>
          </form>
        </div>

        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>MaxLabs Academic SaaS v2.0</span>
          <span className="font-medium text-slate-700">Strict Role Enforced</span>
        </div>
      </div>
    </div>
  );
};
