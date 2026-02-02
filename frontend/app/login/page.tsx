'use client';

import { useState } from 'react';
import { AuthService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await AuthService.login(email, password);
        login(res.token, res.user);
      } else {
        const res = await AuthService.signup(email, password);
        login(res.token, res.user);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0551BA]/5 rounded-bl-full -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#0551BA]/5 rounded-tr-full -ml-20 -mb-20 pointer-events-none" />

      <div className="max-w-md w-full z-10 p-8">
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl p-8 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#0551BA] rounded-xl mx-auto flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-900/20">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-serif text-[#1e293b]">
              {isLogin ? 'Welcome Back' : 'Begin Your Journey'}
            </h2>
            <p className="text-sm text-gray-500 font-light">
              {isLogin
                ? 'Resume your strategic path.'
                : 'Calibrate your compass for the future.'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0551BA]/20 focus:border-[#0551BA] transition-all placeholder:text-gray-300"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0551BA]/20 focus:border-[#0551BA] transition-all placeholder:text-gray-300"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg text-center font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#0551BA] text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-700 hover:shadow-blue-900/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading
                ? 'Processing...'
                : isLogin
                  ? 'Sign In'
                  : 'Create Account'}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-gray-100">
            <button
              className="text-[#0551BA] hover:text-blue-700 text-sm font-medium transition-colors"
              onClick={() => setIsLogin(!isLogin)}>
              {isLogin
                ? 'First time? Create a new account'
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
