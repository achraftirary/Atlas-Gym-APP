import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { memberAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AtlasLogo from './AtlasLogo';

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) { setError('Please enter your full name'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      const response = await memberAPI.register({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      if (response.token) {
        setAuth(response.token, response.user_type);
        localStorage.setItem('userId', String(response.id));
        navigate('/member/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 10,
    padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 6,
    letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* Grain overlay */}
      <div className="grain" style={{ position: 'fixed', inset: 0, zIndex: 0 }} />

      {/* Left hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 64px', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,255,61,0.12) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,61,127,0.1) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <AtlasLogo size={36} accent wordmark wordmarkSize={18} color="var(--lime)" style={{ marginBottom: 28 }} />

        <h1 className="display" style={{ fontSize: 52, lineHeight: 1.08, letterSpacing: '-0.03em', maxWidth: 440, marginBottom: 24 }}>
          Start your<br />
          <span style={{ color: 'var(--lime)' }}>fitness</span><br />
          journey today
        </h1>

        <p style={{ fontSize: 15, color: 'var(--text-dim)', maxWidth: 380, lineHeight: 1.65, marginBottom: 40 }}>
          Join thousands of members tracking their progress, booking classes, and crushing their goals.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 380 }}>
          {[
            { v: '2,400+', l: 'Active members' },
            { v: '48', l: 'Weekly classes' },
            { v: '3', l: 'Locations' },
            { v: '98%', l: 'Satisfaction rate' },
          ].map(s => (
            <div key={s.l} style={{ padding: '16px 20px', borderRadius: 14, background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
              <div className="display mono" style={{ fontSize: 22, color: 'var(--lime)', marginBottom: 4 }}>{s.v}</div>
              <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div style={{ width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 420, background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 24, padding: '40px 36px', position: 'relative' }}>
          <div className="ticks tl" /><div className="ticks tr" /><div className="ticks bl" /><div className="ticks br" />

          <div style={{ marginBottom: 28 }}>
            <h2 className="display" style={{ fontSize: 26, marginBottom: 6 }}>Create account</h2>
            <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Fill in your details to get started</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(255,61,127,0.1)', border: '1px solid rgba(255,61,127,0.25)', borderRadius: 10, padding: '11px 14px', marginBottom: 18, color: 'var(--magenta)', fontSize: 13 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>First name</label>
                <input type="text" value={form.first_name} onChange={set('first_name')} required style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--lime)')} onBlur={e => (e.target.style.borderColor = 'var(--line)')} />
              </div>
              <div>
                <label style={labelStyle}>Last name</label>
                <input type="text" value={form.last_name} onChange={set('last_name')} required style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--lime)')} onBlur={e => (e.target.style.borderColor = 'var(--line)')} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Email address</label>
              <input type="email" value={form.email} onChange={set('email')} required style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--lime)')} onBlur={e => (e.target.style.borderColor = 'var(--line)')} />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={form.password} onChange={set('password')} required minLength={6} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--lime)')} onBlur={e => (e.target.style.borderColor = 'var(--line)')} />
            </div>

            <div>
              <label style={labelStyle}>Confirm password</label>
              <input type="password" value={form.confirm} onChange={set('confirm')} required minLength={6} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--lime)')} onBlur={e => (e.target.style.borderColor = 'var(--line)')} />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ padding: '14px', borderRadius: 12, fontSize: 14, fontWeight: 700, marginTop: 4, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px dashed var(--line)', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--lime)', textDecoration: 'none', fontWeight: 600 }}>Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
