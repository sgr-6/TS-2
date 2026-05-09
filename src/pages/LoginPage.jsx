import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  GraduationCap, Mail, Lock, Eye, EyeOff,
  User, BookOpen, Hash, Building2, ShieldCheck,
} from 'lucide-react';

const SEMESTERS = ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'];

function FloatingOrb({ style }) {
  return (
    <div
      className="pointer-events-none fixed rounded-full"
      style={{ filter: 'blur(80px)', opacity: 0.12, ...style }}
    />
  );
}

function GlassInput({ icon: Icon, label, id, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 tracking-wide uppercase" style={{ color: '#94a3b8' }}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6366f1' }} />
        )}
        <input
          id={id}
          className="input"
          style={{ paddingLeft: Icon ? '2.25rem' : '1rem', background: 'rgba(15,23,42,0.6)', borderColor: 'rgba(99,102,241,0.2)' }}
          {...props}
        />
      </div>
    </div>
  );
}

function GlassSelect({ icon: Icon, label, id, children, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 tracking-wide uppercase" style={{ color: '#94a3b8' }}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: '#6366f1' }} />
        )}
        <select
          id={id}
          className="input appearance-none cursor-pointer"
          style={{ paddingLeft: Icon ? '2.25rem' : '1rem', background: 'rgba(15,23,42,0.6)', borderColor: 'rgba(99,102,241,0.2)', color: '#e2e8f0' }}
          {...props}
        >
          {children}
        </select>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { login, register, ADMIN_EMAIL } = useAuth();
  // mode: 'login' | 'register' | 'admin'
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration extra fields
  const [teacherName, setTeacherName] = useState('');
  const [department, setDepartment] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [semester, setSemester] = useState('4th Sem');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        if (!teacherName || !department || !subjectName || !subjectCode) {
          setError('Please fill in all fields.');
          setLoading(false);
          return;
        }
        await register(email, password, {
          teacherName,
          department,
          subjectName,
          subjectCode,
          semester,
        });
      } else {
        // login or admin login — same Firebase login
        await login(email, password);
      }
    } catch (err) {
      const msg =
        err.code === 'auth/invalid-credential' ? 'Invalid email or password.' :
        err.code === 'auth/email-already-in-use' ? 'Email already registered.' :
        err.code === 'auth/weak-password' ? 'Password should be at least 6 characters.' :
        err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = mode === 'admin';
  const isRegister = mode === 'register';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at 70% 0%, rgba(99,102,241,0.18) 0%, transparent 55%), radial-gradient(ellipse at 0% 100%, rgba(139,92,246,0.12) 0%, transparent 50%), #020617',
      }}
    >
      {/* Ambient orbs */}
      <FloatingOrb style={{ top: '-5rem', right: '-5rem', width: '28rem', height: '28rem', background: 'radial-gradient(circle, #6366f1, transparent)' }} />
      <FloatingOrb style={{ bottom: '-5rem', left: '-5rem', width: '24rem', height: '24rem', background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
      <FloatingOrb style={{ top: '40%', left: '30%', width: '16rem', height: '16rem', background: 'radial-gradient(circle, #4f46e5, transparent)' }} />

      <div className="w-full max-w-md animate-scale-in relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 relative"
            style={{
              background: 'linear-gradient(135deg, rgba(79,70,229,0.3), rgba(99,102,241,0.15))',
              border: '1px solid rgba(99,102,241,0.3)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <GraduationCap size={36} color="white" style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.8))' }} />
          </div>
          <h1 className="text-4xl font-bold gradient-text tracking-tight">TS:2</h1>
          <p className="text-sm mt-1.5 font-medium" style={{ color: '#64748b' }}>Smart Presence Simplified</p>
        </div>

        {/* Mode tabs */}
        <div
          className="flex rounded-2xl p-1 mb-6"
          style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(99,102,241,0.12)', backdropFilter: 'blur(12px)' }}
        >
          {[
            { key: 'login', label: 'Teacher Login' },
            { key: 'register', label: 'Register' },
            { key: 'admin', label: '🔐 Admin' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setMode(tab.key); setError(''); }}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{
                background: mode === tab.key ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'transparent',
                color: mode === tab.key ? 'white' : '#64748b',
                boxShadow: mode === tab.key ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Glass card */}
        <div
          className="rounded-3xl p-7"
          style={{
            background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(99,102,241,0.15)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Admin badge */}
          {isAdmin && (
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl mb-5"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              <ShieldCheck size={16} style={{ color: '#818cf8' }} />
              <span className="text-xs font-semibold" style={{ color: '#a5b4fc' }}>Admin Access — Principals &amp; HODs</span>
            </div>
          )}

          <h2 className="text-xl font-bold mb-1" style={{ color: '#f1f5f9' }}>
            {isAdmin ? 'Admin Portal' : isRegister ? 'Create Teacher Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs mb-6" style={{ color: '#475569' }}>
            {isAdmin ? 'Sign in with admin credentials to view all data' :
             isRegister ? 'Register your subject &amp; teaching details' :
             'Sign in to manage your class attendance'}
          </p>

          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-2xl text-xs font-medium flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Teacher name — register only */}
            {isRegister && (
              <GlassInput
                icon={User}
                label="Teacher Name"
                id="reg-teacher-name"
                type="text"
                placeholder="e.g. Supriya"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                required
              />
            )}

            {/* Email */}
            <GlassInput
              icon={Mail}
              label="Email Address"
              id="login-email"
              type="email"
              placeholder={isAdmin ? 'admin@ts2.edu' : 'teacher@school.edu'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 tracking-wide uppercase" style={{ color: '#94a3b8' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6366f1' }} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-9 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  style={{ background: 'rgba(15,23,42,0.6)', borderColor: 'rgba(99,102,241,0.2)' }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Register-only fields */}
            {isRegister && (
              <>
                <GlassInput
                  icon={Building2}
                  label="Department"
                  id="reg-department"
                  type="text"
                  placeholder="e.g. Mathematics, CSE, ECE"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <GlassInput
                    icon={BookOpen}
                    label="Subject Name"
                    id="reg-subject"
                    type="text"
                    placeholder="e.g. Maths"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    required
                  />
                  <GlassInput
                    icon={Hash}
                    label="Subject Code"
                    id="reg-subjectcode"
                    type="text"
                    placeholder="e.g. 23IST420"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    required
                  />
                </div>

                <GlassSelect
                  icon={BookOpen}
                  label="Semester"
                  id="reg-semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                >
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s} style={{ background: '#0f172a' }}>{s}</option>
                  ))}
                </GlassSelect>
              </>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary w-full mt-2"
              disabled={loading}
              style={{
                minHeight: '48px',
                borderRadius: '14px',
                fontSize: '0.9rem',
                fontWeight: 600,
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin 0.6s linear infinite' }} />
                  {isRegister ? 'Creating Account…' : 'Signing In…'}
                </span>
              ) : (
                isAdmin ? '🔐 Admin Sign In' : isRegister ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {!isAdmin && (
            <div className="mt-5 text-center text-xs" style={{ color: '#475569' }}>
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                id="toggle-auth-mode"
                type="button"
                onClick={() => { setMode(isRegister ? 'login' : 'register'); setError(''); }}
                style={{ color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
              >
                {isRegister ? 'Sign In' : 'Register'}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs mt-5" style={{ color: '#1e293b' }}>
          © 2025 TS:2 · Powered by Firebase
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
