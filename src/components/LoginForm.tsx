import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { memberAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AtlasLogo from './AtlasLogo';

type Tab = 'member' | 'admin';

const LoginForm: React.FC = () => {
  const [tab, setTab] = useState<Tab>('member');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  const [pulse, setPulse] = useState(0);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => (p + 1) % 100), 80);
    return () => clearInterval(t);
  }, []);

  const wavePath = (offset: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const x = (i / 60) * 600;
      const y = 50 + Math.sin((i / 60) * Math.PI * 4 + offset) * 18 * Math.sin((i / 60) * Math.PI);
      pts.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    return pts.join(' ');
  };

  const stats = [
    { l: 'Active members', v: '2,847', d: '+12.4%' },
    { l: 'Live now', v: '184', d: 'on floor' },
    { l: 'Sessions today', v: '612', d: 'of 720' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await memberAPI.login({
        email: email.trim(),
        password,
        isAdminLogin: tab === 'admin',
      });

      if (tab === 'member' && response.user_type === 'admin') {
        setError('Please use the Admin tab to sign in as admin.');
        setLoading(false);
        return;
      }
      if (tab === 'admin' && response.user_type !== 'admin') {
        setError('No admin account found with these credentials.');
        setLoading(false);
        return;
      }

      setAuth(response.token, response.user_type);
      if (response.id) localStorage.setItem('userId', response.id.toString());
      if (response.first_name) localStorage.setItem('userName', `${response.first_name} ${response.last_name || ''}`);
      window.location.href = response.user_type === 'admin' ? '/admin/dashboard' : '/member/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw', minHeight: '100vh', background: 'var(--ink)',
      position: 'relative', overflow: 'hidden', color: 'var(--text)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Background effects */}
      <div className="login-grid-bg" />
      <div className="login-orb" style={{ width: 600, height: 600, left: -200, top: -250, background: 'radial-gradient(circle, rgba(212,255,61,0.18), transparent 60%)' }} />
      <div className="login-orb" style={{ width: 500, height: 500, right: -150, bottom: -200, background: 'radial-gradient(circle, rgba(255,61,127,0.16), transparent 60%)', animationDelay: '-5s' }} />
      <div className="grain" />

      {/* Top bar */}
      <div style={{ position: 'relative', zIndex: 5, padding: '28px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <AtlasLogo size={30} accent wordmark wordmarkSize={16} color="var(--lime)" />
        <div style={{ display: 'flex', gap: 32, alignItems: 'center', fontSize: 12 }} className="tracking">
          <span style={{ color: 'var(--text-dim)' }}>Casablanca · Maarif</span>
          <span className="mono" style={{ color: 'var(--text)' }}>{time.toTimeString().slice(0, 8)}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-dim)' }}>
            <span className="pulse-dot" />
            ALL SYSTEMS LIVE
          </span>
        </div>
      </div>

      {/* Main two-col layout */}
      <div style={{ position: 'relative', zIndex: 5, flex: 1, display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 56, padding: '20px 48px 64px', maxWidth: 1280, margin: '0 auto', width: '100%' }}>

        {/* LEFT — visual hero */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 14px', border: '1px solid var(--line-strong)', borderRadius: 999, marginBottom: 36 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--magenta)' }} />
              <span className="tracking mono" style={{ fontSize: 11 }}>v4.2 · Premium Studio OS</span>
            </div>
            <h1 className="display" style={{ fontSize: 'clamp(48px, 6vw, 88px)', lineHeight: 0.92, letterSpacing: '-0.04em' }}>
              Train<br />
              <span style={{ color: 'var(--lime)', fontStyle: 'italic', fontWeight: 500 }}>relentless</span>.<br />
              Track <span style={{ display: 'inline-block', position: 'relative' }}>everything
                <svg style={{ position: 'absolute', left: 0, bottom: -8, width: '100%' }} height="14" viewBox="0 0 320 14" preserveAspectRatio="none">
                  <path d="M2 8 Q 80 2, 160 8 T 318 8" stroke="var(--magenta)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>
              </span>.
            </h1>
            <p style={{ marginTop: 28, fontSize: 16, color: 'var(--text-dim)', maxWidth: 460, lineHeight: 1.55 }}>
              The operating system for premium gyms. Bookings, biometrics, billing — and members who actually show up.
            </p>
          </div>

          {/* Live activity panel */}
          <div style={{ marginTop: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <span className="tracking" style={{ fontSize: 11, color: 'var(--text-faint)' }}>Live floor activity</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>{String(40 + (pulse % 8)).padStart(2, '0')} active</span>
            </div>
            <svg viewBox="0 0 600 100" style={{ width: '100%', height: 80 }}>
              <defs>
                <linearGradient id="wg" x1="0" x2="1">
                  <stop offset="0%" stopColor="var(--lime)" stopOpacity="0" />
                  <stop offset="50%" stopColor="var(--lime)" stopOpacity="1" />
                  <stop offset="100%" stopColor="var(--magenta)" stopOpacity="1" />
                </linearGradient>
              </defs>
              {[0, 0.5, 1, 1.5].map((o, i) => (
                <path key={i} d={wavePath(pulse * 0.06 + o)} stroke="url(#wg)" strokeWidth={1.5} fill="none" opacity={0.25 + i * 0.2} />
              ))}
            </svg>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, marginTop: 18, background: 'var(--line)', border: '1px solid var(--line)' }}>
              {stats.map((s, i) => (
                <div key={i} style={{ background: 'var(--ink)', padding: '16px 18px' }}>
                  <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)' }}>{s.l}</div>
                  <div className="display mono" style={{ fontSize: 28, marginTop: 4 }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: 'var(--lime)', marginTop: 2 }}>{s.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — sign in card */}
        <div style={{ position: 'relative' }}>
          <div style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
            border: '1px solid var(--line-strong)', borderRadius: 28, padding: 40,
            position: 'relative', overflow: 'hidden', backdropFilter: 'blur(20px)',
          }}>
            <div className="ticks tl" /><div className="ticks tr" /><div className="ticks bl" /><div className="ticks br" />

            {/* Tab toggle */}
            <div style={{ display: 'flex', gap: 6, padding: 4, background: 'var(--ink-2)', borderRadius: 999, width: 'fit-content', border: '1px solid var(--line)' }}>
              {(['member', 'admin'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); }}
                  style={{
                    padding: '8px 18px', borderRadius: 999, border: 'none',
                    background: tab === t ? 'var(--lime)' : 'transparent',
                    color: tab === t ? '#0A0B0F' : 'var(--text-dim)',
                    fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all .15s',
                  }}
                  className="tracking"
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <h2 className="display" style={{ fontSize: 36, marginTop: 28, letterSpacing: '-0.02em' }}>Welcome back.</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: 14, marginTop: 8 }}>
              {tab === 'member' ? 'Sign in to your training command.' : 'Admin access — restricted area.'}
            </p>

            {error && (
              <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(255,61,127,0.1)', border: '1px solid rgba(255,61,127,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--magenta)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="login-field">
                <input
                  className="login-input"
                  type="email"
                  placeholder=" "
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
                <label>Email address</label>
              </div>
              <div className="login-field" style={{ marginTop: 12 }}>
                <input
                  type="password"
                  className="login-input"
                  placeholder=" "
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <label>Password</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
                <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>
                  {tab === 'member' ? (
                    <>New here? <Link to="/register" style={{ color: 'var(--lime)', textDecoration: 'none' }}>Start free →</Link></>
                  ) : (
                    <span className="mono tracking" style={{ fontSize: 10 }}>Admin access only</span>
                  )}
                </span>
                <a href="#" style={{ fontSize: 13, color: 'var(--lime)', textDecoration: 'none', borderBottom: '1px solid var(--lime)' }}>Forgot?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  marginTop: 26, padding: '18px 24px', borderRadius: 14, fontSize: 15,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', opacity: loading ? 0.7 : 1,
                }}
              >
                <span>{loading ? 'Signing in…' : 'Enter the floor'}</span>
                <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
                  <path d="M1 7h19M14 1l6 6-6 6" stroke="#0A0B0F" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </form>

            <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px dashed var(--line-strong)', fontSize: 12, color: 'var(--text-faint)', display: 'flex', justifyContent: 'space-between' }}>
              <span className="mono">256-bit · TLS encrypted</span>
              <span className="mono tracking" style={{ fontSize: 10, color: 'var(--text-faint)' }}>Atlas Studio v4.2</span>
            </div>
          </div>

          {/* Floating NPS card */}
          <div style={{
            position: 'absolute', bottom: -30, right: -24,
            background: 'var(--magenta)', color: '#0A0B0F',
            padding: '12px 16px', borderRadius: 14, transform: 'rotate(3deg)',
            fontSize: 12, maxWidth: 200, boxShadow: '0 0 60px rgba(255,61,127,0.25)',
          }} className="display">
            <div className="tracking" style={{ fontSize: 9, opacity: 0.7 }}>Member NPS</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>71<span style={{ fontSize: 14, opacity: 0.6 }}>/100</span></div>
          </div>
        </div>
      </div>

      {/* Bottom ticker */}
      <div style={{ position: 'relative', zIndex: 5, padding: '16px 0', borderTop: '1px solid var(--line)', background: 'var(--ink)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', animation: 'marquee 40s linear infinite', gap: 48 }}>
          {[...Array(2)].map((_, k) => (
            <div key={k} style={{ display: 'flex', gap: 48, paddingLeft: 48, whiteSpace: 'nowrap' }}>
              {[
                '★ Voted #1 boutique studio in Casablanca 2026',
                '● 2,847 active members',
                '→ 184 trainers across 7 branches',
                '✦ Open daily · 06:00 — 23:30',
                '● Powered by Atlas OS v4.2',
                '→ ISO 27001 certified',
                '★ 612 sessions logged today',
              ].map((t, i) => (
                <span key={i} style={{ color: i % 2 ? 'var(--text-faint)' : 'var(--lime)', fontSize: 12 }} className="mono tracking">{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
