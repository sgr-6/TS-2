import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Mail, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Invalid email or password.'
        : err.code === 'auth/email-already-in-use'
        ? 'Email already registered.'
        : err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at 60% 0%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 0% 100%, rgba(79,70,229,0.12) 0%, transparent 50%), #020617',
      }}
    >
      {/* Decorative blobs */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(64px)' }}
      />
      <div
        className="pointer-events-none fixed bottom-0 left-0 w-80 h-80 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #4338ca, transparent)', filter: 'blur(64px)' }}
      />

      <div className="w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
          >
            <GraduationCap size={32} color="white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">TS:2</h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Smart Presence Simplified
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold mb-1" style={{ color: '#f1f5f9' }}>
            {isRegister ? 'Create Account' : 'Welcome back'}
          </h2>
          <p className="text-sm mb-6" style={{ color: '#64748b' }}>
            {isRegister ? 'Set up your institution account' : 'Sign in to your dashboard'}
          </p>

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#475569' }}
                />
                <input
                  id="login-email"
                  type="email"
                  className="input pl-10"
                  placeholder="admin@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#475569' }}
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary w-full mt-2"
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    style={{ animation: 'spin 0.6s linear infinite' }}
                  />
                  {isRegister ? 'Creating...' : 'Signing in...'}
                </span>
              ) : (
                isRegister ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: '#475569' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              id="toggle-auth-mode"
              type="button"
              onClick={() => { setIsRegister((v) => !v); setError(''); }}
              style={{ color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#334155' }}>
          © 2025 TS:2 · Powered by Firebase
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
