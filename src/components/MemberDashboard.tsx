import React, { useEffect, useState, useCallback } from 'react';
import { memberAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AtlasLogo from './AtlasLogo';

const spark = (seed: number, n = 24) => {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const v = 30 + Math.sin(i * 0.5 + seed) * 18 + Math.cos(i * 0.3 + seed * 2) * 10 + (i / n) * 12;
    pts.push(`${i === 0 ? 'M' : 'L'} ${(i / (n - 1)) * 100} ${50 - v * 0.8}`);
  }
  return pts.join(' ');
};

const heatDays = Array.from({ length: 49 }, (_, i) => {
  const v = Math.sin(i * 0.7) * Math.cos(i * 0.4) + (i % 7 === 0 ? -0.5 : 0);
  return Math.max(0, Math.min(1, (v + 1) / 2));
});

const MemberDashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('today');
  const [snack, setSnack] = useState('');
  const [bookingId, setBookingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await memberAPI.getDashboard();
      setDashboard(data);
    } catch {
      setSnack('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleBook = async (classId: number) => {
    setBookingId(classId);
    try {
      await memberAPI.bookClass(classId);
      setSnack('Class booked successfully!');
      load();
    } catch (e: any) {
      setSnack(e.message || 'Booking failed');
    } finally {
      setBookingId(null);
    }
  };

  const handleCopyReferral = () => {
    const code = dashboard?.referral?.code || '';
    navigator.clipboard.writeText(`atlas.gym/r/${code}`).then(() => setSnack('Referral link copied!'));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--ink)', color: 'var(--text)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--line)', borderTop: '3px solid var(--lime)', borderRadius: '50%', animation: 'spin-slow 1s linear infinite', margin: '0 auto 16px' }} />
          <div className="tracking" style={{ fontSize: 11, color: 'var(--text-faint)' }}>Loading your dashboard…</div>
        </div>
      </div>
    );
  }

  const member = dashboard?.member;
  const subscription = dashboard?.subscription;
  const kpis = dashboard?.kpis || {};
  const classes = dashboard?.upcoming_classes || [];
  const referral = dashboard?.referral || {};
  const offers = dashboard?.offers || [];
  const streak = kpis.checkin_streak || 0;
  const daysLeft = subscription?.days_remaining ?? 0;
  const totalDays = subscription ? Math.round((new Date(subscription.end_date).getTime() - new Date(subscription.start_date).getTime()) / 86400000) : 30;
  const usedPct = totalDays > 0 ? Math.round(((totalDays - daysLeft) / totalDays) * 100) : 0;
  const subCirc = 2 * Math.PI * 48;

  const metrics = [
    { l: 'Loyalty points', v: String(kpis.loyalty_points || 0), sub: `+ earned this week`, c: 'var(--lime)', seed: 1 },
    { l: 'Progress score', v: String(kpis.progress_score || 0), sub: '/ 100 · top performer', c: 'var(--cyan)', seed: 2 },
    { l: 'Sessions logged', v: String(classes.filter((c: any) => c.is_booked).length), sub: 'booked upcoming', c: 'var(--magenta)', seed: 3 },
    { l: 'Referral wallet', v: String(kpis.referral_wallet || 0), sub: 'MAD earned', c: 'var(--warn)', seed: 4 },
  ];

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100vh', color: 'var(--text)', position: 'relative' }}>
      <div className="login-orb" style={{ width: 520, height: 520, right: -200, top: -100, background: 'radial-gradient(circle, rgba(212,255,61,0.10), transparent 60%)' }} />

      {/* TOP BAR */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid var(--line)', background: 'rgba(10,11,15,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <AtlasLogo size={26} accent wordmark wordmarkSize={14} color="var(--lime)" />
          <nav style={{ display: 'flex', gap: 4 }}>
            {['Today', 'Sessions', 'Progress', 'Refer'].map((n, i) => (
              <button key={n} onClick={() => setTab(n.toLowerCase())} style={{ padding: '8px 14px', borderRadius: 8, background: tab === n.toLowerCase() ? 'var(--ink-3)' : 'transparent', color: tab === n.toLowerCase() ? 'var(--text)' : 'var(--text-dim)', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                {n}
              </button>
            ))}
            <button onClick={() => navigate('/member/profile')} style={{ padding: '8px 14px', borderRadius: 8, background: 'transparent', color: 'var(--text-dim)', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Profile</button>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {subscription?.status === 'active' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', border: '1px solid var(--line)', borderRadius: 999, fontSize: 12 }}>
              <span className="pulse-dot" />
              <span className="tracking mono">active member</span>
              <span style={{ color: 'var(--text-faint)' }} className="mono">{daysLeft}d left</span>
            </div>
          )}
          <div onClick={() => navigate('/member/profile')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 5px 5px 14px', border: '1px solid var(--line)', borderRadius: 999, cursor: 'pointer' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{member?.first_name} {member?.last_name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-faint)' }} className="mono">#{member?.id} · {subscription?.status || 'no plan'}</div>
            </div>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--lime), var(--magenta))', display: 'grid', placeItems: 'center', color: '#0A0B0F', fontWeight: 700, fontSize: 12 }}>
              {((member?.first_name?.[0] || '') + (member?.last_name?.[0] || '')).toUpperCase()}
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ padding: '8px 14px', borderRadius: 8, background: 'none', border: '1px solid var(--line)', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer' }}>Log out</button>
        </div>
      </header>

      <div style={{ padding: '32px 40px 64px', position: 'relative', zIndex: 1 }}>

        {/* GREETING + STREAK */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: 24, marginBottom: 24 }}>

          {/* Greeting */}
          <div style={{ position: 'relative', padding: '36px 40px', borderRadius: 28, background: 'linear-gradient(135deg, var(--ink-2) 0%, var(--ink-3) 100%)', border: '1px solid var(--line)', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 280, height: 280, background: 'radial-gradient(circle, rgba(212,255,61,0.16), transparent 65%)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-faint)' }} />
                <span className="tracking" style={{ fontSize: 10, color: 'var(--lime)' }}>Day {streak + 1} of plan</span>
              </div>
              <h1 className="display" style={{ fontSize: 'clamp(32px,4vw,56px)', lineHeight: 0.98, letterSpacing: '-0.03em' }}>
                Hey {member?.first_name || 'there'},<br />
                <span style={{ color: 'var(--lime)' }}>keep it going!</span>
              </h1>
              <p style={{ marginTop: 16, fontSize: 15, color: 'var(--text-dim)', maxWidth: 520, lineHeight: 1.5 }}>
                {streak > 0
                  ? <>You're on a <span style={{ color: 'var(--text)', fontWeight: 600 }}>{streak}-day streak</span> — keep the momentum going.</>
                  : 'Start your first check-in today and build your streak.'}
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
                <button className="btn-primary" style={{ padding: '13px 22px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  Book a session
                  <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><path d="M1 5h13m-4-4 4 4-4 4" stroke="#0A0B0F" strokeWidth="2" strokeLinecap="round" /></svg>
                </button>
                <button className="btn-ghost" style={{ padding: '13px 22px', borderRadius: 12, fontSize: 14 }} onClick={handleCopyReferral}>Refer a friend →</button>
              </div>
            </div>
          </div>

          {/* Streak card */}
          <div style={{ position: 'relative', padding: 28, borderRadius: 28, background: 'var(--lime)', color: '#0A0B0F', overflow: 'hidden' }}>
            <div className="checker" />
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="tracking" style={{ fontSize: 10, fontWeight: 700 }}>CHECK-IN STREAK</div>
                <div className="display" style={{ fontSize: 'clamp(48px,7vw,88px)', lineHeight: 1, marginTop: 8, letterSpacing: '-0.05em' }}>{streak}<span style={{ fontSize: 22, opacity: 0.6 }}>days</span></div>
              </div>
              <svg width="70" height="70" viewBox="0 0 80 80" style={{ animation: 'spin-slow 30s linear infinite' }}>
                <defs><path id="circle-md" d="M 40,40 m -32,0 a 32,32 0 1,1 64,0 a 32,32 0 1,1 -64,0" /></defs>
                <text fontSize="9" letterSpacing="2" fontWeight="700" fill="#0A0B0F">
                  <textPath href="#circle-md">CONSISTENCY · DISCIPLINE · ATLAS · </textPath>
                </text>
                <circle cx="40" cy="40" r="6" fill="#0A0B0F" />
              </svg>
            </div>
            <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {Array.from({ length: Math.min(streak, 14) }, (_, i) => (
                <div key={i} style={{ height: 24, background: '#0A0B0F', borderRadius: 4, opacity: 0.85 }} />
              ))}
              {Array.from({ length: Math.max(14 - streak, 0) }, (_, i) => (
                <div key={`empty-${i}`} style={{ height: 24, background: 'rgba(10,11,15,0.2)', borderRadius: 4 }} />
              ))}
            </div>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: 11 }} className="mono">
              <span>Streak start →</span>
              <span style={{ fontWeight: 700 }}>NEXT MILESTONE: {Math.ceil((streak + 1) / 7) * 7} ★</span>
            </div>
          </div>
        </div>

        {/* METRICS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {metrics.map((m, i) => (
            <div key={i} className="metric-card" style={{ minHeight: 150 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)' }}>{m.l}</div>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.c }} />
              </div>
              <div className="display mono" style={{ fontSize: 44, marginTop: 10, lineHeight: 1, letterSpacing: '-0.03em' }}>{m.v}</div>
              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{m.sub}</div>
                <svg width="80" height="28" viewBox="0 0 100 50" preserveAspectRatio="none">
                  <path d={spark(m.seed)} fill="none" stroke={m.c} strokeWidth="2" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 16 }}>

          {/* Upcoming classes */}
          <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 24, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 className="display" style={{ fontSize: 22, letterSpacing: '-0.01em' }}>Upcoming sessions</h3>
                <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>{classes.length} available classes</div>
              </div>
              <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--ink)', borderRadius: 999, border: '1px solid var(--line)' }}>
                {['Today', 'Week'].map((x) => (
                  <button key={x} onClick={() => setTab(x.toLowerCase())} style={{ padding: '6px 12px', borderRadius: 999, background: tab === x.toLowerCase() ? 'var(--lime)' : 'transparent', color: tab === x.toLowerCase() ? '#0A0B0F' : 'var(--text-dim)', border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer' }} className="tracking">{x}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {classes.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-faint)', padding: '16px 0' }}>No upcoming classes available</div>}
              {classes.map((cls: any) => (
                <div key={cls.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--ink)', borderRadius: 14, border: '1px solid var(--line)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{cls.title}</span>
                      {cls.is_booked && <span style={{ fontSize: 9, padding: '2px 7px', background: 'var(--lime)', color: '#0A0B0F', borderRadius: 4, fontWeight: 700 }} className="tracking">BOOKED</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{cls.coach} · {cls.start}</div>
                    <div style={{ fontSize: 11, color: cls.spots_left > 3 ? 'var(--text-faint)' : 'var(--warn)', marginTop: 4 }}>{cls.spots_left} spots left</div>
                  </div>
                  {!cls.is_booked && cls.spots_left > 0 && (
                    <button
                      className="btn-primary"
                      style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, opacity: bookingId === cls.id ? 0.7 : 1 }}
                      onClick={() => handleBook(cls.id)}
                      disabled={bookingId === cls.id}
                    >
                      {bookingId === cls.id ? '…' : 'Book'}
                    </button>
                  )}
                  {cls.spots_left === 0 && !cls.is_booked && (
                    <span style={{ fontSize: 11, color: 'var(--magenta)', padding: '6px 12px', border: '1px solid rgba(255,61,127,0.3)', borderRadius: 8 }}>Full</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Membership status */}
            <div style={{ position: 'relative', padding: 28, borderRadius: 24, background: 'linear-gradient(135deg, var(--ink-2), var(--ink-3))', border: '1px solid var(--line)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)' }}>MEMBERSHIP · {(subscription?.status || 'no plan').toUpperCase()}</div>
                  <div className="display" style={{ fontSize: 20, marginTop: 6, letterSpacing: '-0.01em' }}>
                    {subscription?.status === 'active' ? 'Active · renews soon' : subscription ? 'Expired' : 'No active plan'}
                  </div>
                </div>
                {daysLeft > 0 && (
                  <div style={{ padding: '5px 10px', border: '1px solid var(--lime)', borderRadius: 6, fontSize: 10, color: 'var(--lime)' }} className="tracking mono">{daysLeft}D LEFT</div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginTop: 20 }}>
                <svg width="110" height="110" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="48" fill="none" stroke="var(--line)" strokeWidth="3" />
                  <circle cx="60" cy="60" r="48" fill="none" stroke="var(--lime)" strokeWidth="3"
                    strokeDasharray={subCirc} strokeDashoffset={subCirc * (1 - usedPct / 100)}
                    strokeLinecap="round" transform="rotate(-90 60 60)" />
                  <text x="60" y="58" textAnchor="middle" fill="var(--text)" fontSize="26" fontWeight="700" className="display">{usedPct}%</text>
                  <text x="60" y="76" textAnchor="middle" fill="var(--text-faint)" fontSize="9" letterSpacing="2">USED</text>
                </svg>
                <div style={{ flex: 1, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--line)' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Started</span>
                    <span className="mono">{subscription?.start_date ? new Date(subscription.start_date).toLocaleDateString() : '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--line)' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Expires</span>
                    <span className="mono">{subscription?.end_date ? new Date(subscription.end_date).toLocaleDateString() : '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Status</span>
                    <span style={{ color: subscription?.status === 'active' ? 'var(--lime)' : 'var(--magenta)' }} className="mono">{subscription?.status || 'none'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance heatmap */}
            <div style={{ padding: 24, borderRadius: 24, background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <h3 className="display" style={{ fontSize: 18 }}>Showing-up index</h3>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>last 7 weeks</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
                {heatDays.map((v, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 4, background: `rgba(212,255,61,${0.08 + v * 0.85})`, border: v < 0.1 ? '1px solid var(--line)' : 'none' }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, color: 'var(--text-faint)' }} className="mono">
                <span>Less</span>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[0.1, 0.3, 0.5, 0.75, 1].map((v, i) => (
                    <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: `rgba(212,255,61,${0.08 + v * 0.85})` }} />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 16 }}>

          {/* Referral */}
          <div style={{ padding: 28, borderRadius: 24, background: 'var(--magenta)', color: '#0A0B0F', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.2), transparent 50%)' }} />
            <div style={{ position: 'relative' }}>
              <div className="tracking" style={{ fontSize: 10, fontWeight: 700 }}>REFERRAL ENGINE</div>
              <h3 className="display" style={{ fontSize: 28, marginTop: 8, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Bring a friend.<br />Earn 100 MAD.</h3>
              <button
                onClick={handleCopyReferral}
                style={{ marginTop: 18, padding: '10px 14px', background: 'rgba(10,11,15,0.15)', border: 'none', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, width: '100%', cursor: 'pointer', color: '#0A0B0F' }}
                className="mono"
              >
                <span>{referral.code || 'ATLAS-YOUR-CODE'}</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>COPY ↗</span>
              </button>
              <div style={{ display: 'flex', gap: 24, marginTop: 16, fontSize: 12 }}>
                <div><div style={{ fontSize: 22, fontWeight: 700 }} className="display">{dashboard?.referral?.wallet > 0 ? Math.floor(dashboard.referral.wallet / 100) : 0}</div><div style={{ opacity: 0.7 }}>converted</div></div>
                <div><div style={{ fontSize: 22, fontWeight: 700 }} className="display">{Math.max(0, 3 - (dashboard?.referral?.wallet > 0 ? Math.floor(dashboard.referral.wallet / 100) : 0))}</div><div style={{ opacity: 0.7 }}>pending</div></div>
                <div><div style={{ fontSize: 22, fontWeight: 700 }} className="display">{kpis.referral_wallet || 0}</div><div style={{ opacity: 0.7 }}>MAD earned</div></div>
              </div>
            </div>
          </div>

          {/* Offers / notifications */}
          <div style={{ padding: 28, borderRadius: 24, background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
            <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)', fontWeight: 700, marginBottom: 16 }}>PERSONALIZED OFFERS</div>
            {offers.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>Everything looks great — no action needed!</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {offers.map((offer: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--lime)', fontSize: 14, marginTop: 1, flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>{offer}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade CTA */}
          <div style={{ padding: 28, borderRadius: 24, background: 'var(--ink-2)', border: '1px solid var(--lime)', position: 'relative', overflow: 'hidden' }}>
            <div className="ticks tl" /><div className="ticks tr" /><div className="ticks bl" /><div className="ticks br" />
            <div className="tracking" style={{ fontSize: 10, color: 'var(--lime)', fontWeight: 700 }}>★ UNLOCK PLATINUM</div>
            <h3 className="display" style={{ fontSize: 24, marginTop: 8, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Unlimited PT.<br />Recovery suite. <span className="shimmer-text">Saunas.</span></h3>
            <ul style={{ listStyle: 'none', marginTop: 16, fontSize: 13, color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>→ 8 personal trainings / mo</li>
              <li>→ Cryotherapy + ice bath</li>
              <li>→ Priority class booking</li>
              <li>→ Performance coaching</li>
            </ul>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 22 }}>
              <div>
                <div className="display mono" style={{ fontSize: 26, color: 'var(--lime)' }}>1,490 <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>MAD/mo</span></div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)', textDecoration: 'line-through' }} className="mono">1,890 MAD</div>
              </div>
              <button className="btn-primary" style={{ padding: '10px 16px', borderRadius: 10, fontSize: 13 }}>Upgrade →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Snack */}
      {snack && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '12px 20px', background: snack.includes('success') || snack.includes('copied') ? 'var(--lime)' : 'var(--magenta)', color: '#0A0B0F', borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 9999, animation: 'slide-up 0.3s ease' }}>
          {snack}
          <button onClick={() => setSnack('')} style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#0A0B0F', fontWeight: 700 }}>×</button>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;
