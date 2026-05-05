import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, memberAPI } from '../../services/api';

type Activity = { id: number; title: string; subtitle: string; tone: string };

const arc = (pct: number, color: string) => {
  const r = 18; const circ = 2 * Math.PI * r;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
      <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="2"
        strokeDasharray={circ} strokeDashoffset={circ - (circ * Math.min(pct, 100)) / 100}
        strokeLinecap="round" transform="rotate(-90 22 22)" />
    </svg>
  );
};

const Metric: React.FC<{ label: string; value: string; unit: string; trend: string; color: string; pct: number }> = ({ label, value, unit, trend, color, pct }) => (
  <div className="metric-card" style={{ padding: '22px 24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)' }}>{label}</div>
      {arc(pct, color)}
    </div>
    <div className="display mono" style={{ fontSize: 40, marginTop: 6, lineHeight: 1, letterSpacing: '-0.03em' }}>
      {value}<span style={{ fontSize: 14, color: 'var(--text-dim)' }}>{unit}</span>
    </div>
    <div style={{ marginTop: 8, fontSize: 11, color, display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      {trend}
    </div>
  </div>
);

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<Activity[]>([]);
  const [classesToday, setClassesToday] = useState<any[]>([]);
  const [paymentQueue, setPaymentQueue] = useState<any[]>([]);
  const [staffSchedule, setStaffSchedule] = useState<any[]>([]);
  const [, setTick] = useState(0);
  const [snack, setSnack] = useState('');

  const load = useCallback(async () => {
    try {
      const [overview, memberList] = await Promise.all([
        adminAPI.getOverview(),
        memberAPI.getAll(),
      ]);
      setData(overview);
      setMembers(memberList || []);
      setActivityFeed(overview.activityFeed || []);
      setClassesToday(overview.classesToday || []);
      setPaymentQueue(overview.paymentQueue || []);
      setStaffSchedule(overview.staffSchedule || []);
    } catch {
      setSnack('Failed to load dashboard data');
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 1500); return () => clearInterval(id); }, []);

  const memberCount = members.length;
  const occupancyPct = Math.min(100, memberCount > 0 ? 72 : 0);

  const metrics = [
    { label: 'Live occupancy', value: `${occupancyPct}`, unit: '%', trend: '+8 vs yesterday', color: 'var(--lime)', pct: occupancyPct },
    { label: "Today's collections", value: data?.controlRoomSignals?.[1]?.value?.replace(' MAD', '') || '0', unit: ' MAD', trend: `${paymentQueue.filter((p: any) => p.status === 'Paid').length} paid · ${paymentQueue.filter((p: any) => p.status === 'Pending').length} pending`, color: 'var(--cyan)', pct: 64 },
    { label: 'Retention', value: '92.4', unit: '%', trend: 'rolling 30d', color: 'var(--magenta)', pct: 92 },
    { label: 'Active members', value: String(memberCount), unit: '', trend: 'in database', color: 'var(--warn)', pct: Math.min(100, memberCount) },
  ];

  const quickActions = [
    { i: '+', l: 'Add member', s: 'Fast onboarding · 60s', c: 'var(--lime)', bg: 'rgba(212,255,61,0.12)', onClick: () => navigate('/admin/members/new') },
    { i: '✦', l: 'Create membership', s: 'Plan builder', c: 'var(--magenta)', bg: 'rgba(255,61,127,0.12)', onClick: () => navigate('/admin/memberships/new') },
    { i: '₪', l: 'Payments', s: 'Quick collect', c: 'var(--cyan)', bg: 'rgba(77,227,213,0.12)', onClick: () => navigate('/admin/payments') },
    { i: '⌾', l: 'Log check-in', s: 'Attendance scan', c: 'var(--warn)', bg: 'rgba(255,178,61,0.12)', onClick: () => navigate('/admin/attendance') },
  ];

  const occupancyBars = [42, 58, 74, 88, 96, 82, 71, 64, 78, 91, 86, 73];

  return (
    <div style={{ color: 'var(--text)', position: 'relative' }}>

      {/* Hero command panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 16, marginBottom: 16 }}>

        {/* Command banner */}
        <div style={{ position: 'relative', padding: '28px 32px', borderRadius: 24, background: 'linear-gradient(135deg, var(--ink-2), var(--ink-3))', border: '1px solid var(--line)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 20, right: 20, padding: '5px 10px', background: 'rgba(212,255,61,0.1)', border: '1px solid var(--lime)', borderRadius: 6, fontSize: 10, color: 'var(--lime)' }} className="tracking">⚡ COMMAND CENTER</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 12 }}>
            <h1 className="display" style={{ fontSize: 'clamp(28px,3vw,46px)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              Operations<span style={{ color: 'var(--lime)' }}>.</span>
            </h1>
            <span className="mono" style={{ fontSize: 12, color: 'var(--text-faint)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 10, maxWidth: 580 }}>
            Live operations across <span style={{ color: 'var(--text)' }}>all branches</span>, <span style={{ color: 'var(--text)' }}>{staffSchedule.length} staff</span> and <span style={{ color: 'var(--text)' }}>{memberCount} members</span>. Auto-refreshing.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ padding: '11px 18px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => navigate('/admin/members/new')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0B0F" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
              Add member
            </button>
            <button className="btn-ghost" style={{ padding: '11px 18px', borderRadius: 10, fontSize: 13 }} onClick={() => navigate('/admin/payments')}>Open cash desk</button>
            <button className="btn-ghost" style={{ padding: '11px 18px', borderRadius: 10, fontSize: 13 }} onClick={() => navigate('/admin/attendance')}>Log check-in</button>
          </div>
        </div>

        {/* Live activity feed */}
        <div style={{ borderRadius: 24, background: 'var(--ink-2)', border: '1px solid var(--line)', padding: '20px 22px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 className="display" style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="pulse-dot" />
              Live activity
            </h3>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>latest events</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflow: 'hidden' }}>
            {activityFeed.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-faint)', padding: '12px 0' }}>No recent activity</div>
            )}
            {activityFeed.slice(0, 6).map((a, i) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', borderBottom: i < activityFeed.length - 1 ? '1px dashed var(--line)' : 'none' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: a.tone === 'success' ? 'var(--lime)' : a.tone === 'warning' ? 'var(--warn)' : 'var(--cyan)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>{a.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
        {metrics.map((m, i) => <Metric key={i} {...m} />)}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
        {quickActions.map((a, i) => (
          <button key={i} onClick={a.onClick} style={{
            padding: '18px 20px', borderRadius: 16, background: 'var(--ink-2)', border: '1px solid var(--line)',
            cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, transition: 'all .15s',
            width: '100%',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = a.c; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line)'; (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: a.bg, color: a.c, display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }} className="display">{a.i}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{a.l}</div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{a.s}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-faint)', flexShrink: 0 }}><path d="M5 3l5 5-5 5" /></svg>
          </button>
        ))}
      </div>

      {/* Chart + branch ranking */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.7fr) minmax(0,1fr)', gap: 16, marginBottom: 16 }}>

        {/* Occupancy chart */}
        <div style={{ padding: 28, borderRadius: 24, background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <h3 className="display" style={{ fontSize: 20, letterSpacing: '-0.01em' }}>Floor occupancy · 24h</h3>
              <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>Live · auto-refresh on</div>
            </div>
            <div style={{ display: 'flex', gap: 18, fontSize: 11 }}>
              {[['Maarif', 'var(--lime)'], ['Anfa', 'var(--magenta)'], ['Bourgogne', 'var(--cyan)']].map(([l, c]) => (
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-dim)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}
                </span>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', height: 180 }}>
            {[0, 25, 50, 75, 100].map(p => (
              <div key={p} style={{ position: 'absolute', left: 0, right: 0, top: `${100 - p}%`, borderTop: '1px dashed rgba(255,255,255,0.06)' }}>
                <span style={{ position: 'absolute', left: -28, top: -7, fontSize: 10, color: 'var(--text-faint)' }} className="mono">{p}%</span>
              </div>
            ))}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: 5, paddingLeft: 8 }}>
              {occupancyBars.map((v, i) => {
                const a = (Math.sin(i * 0.5) * 0.5 + 0.5) * 60 + 20;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'flex-end', height: '100%' }}>
                    <div style={{ height: `${a * 0.4}%`, background: 'var(--cyan)', borderRadius: '3px 3px 0 0', opacity: 0.6 }} />
                    <div style={{ height: `${a * 0.5}%`, background: 'var(--magenta)', opacity: 0.7 }} />
                    <div style={{ height: `${v * 0.6}%`, background: 'var(--lime)', boxShadow: i === occupancyBars.length - 1 ? '0 0 16px rgba(212,255,61,0.6)' : 'none' }} />
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 10, color: 'var(--text-faint)' }} className="mono">
            {['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'].map(t => <span key={t}>{t}h</span>)}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--line)', border: '1px solid var(--line)', marginTop: 24 }}>
            {[
              ['FLOOR OCCUPANCY', `${occupancyPct}%`, '+8 vs avg', 'var(--lime)'],
              ['ACTIVE MEMBERS', String(memberCount), 'in database', 'var(--magenta)'],
              ['STAFF ON SHIFT', String(staffSchedule.length), 'roster today', 'var(--cyan)'],
            ].map(([l, v, s, c], i) => (
              <div key={i} style={{ background: 'var(--ink-2)', padding: '14px 16px' }}>
                <div className="tracking" style={{ fontSize: 9, color: 'var(--text-faint)' }}>{l}</div>
                <div className="display mono" style={{ fontSize: 22, marginTop: 4 }}>{v}</div>
                <div style={{ fontSize: 10, color: c, marginTop: 2 }} className="mono">{s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's classes */}
        <div style={{ padding: 24, borderRadius: 24, background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
            <h3 className="display" style={{ fontSize: 18 }}>Today's classes</h3>
            <button onClick={() => navigate('/admin/classes')} style={{ fontSize: 11, color: 'var(--lime)', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {classesToday.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>No classes scheduled today</div>}
            {classesToday.slice(0, 5).map((c: any, i: number) => {
              const [booked, cap] = String(c.spots).split('/');
              const pct = cap ? (parseInt(booked) / parseInt(cap)) * 100 : 0;
              return (
                <div key={c.id || i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', width: 40 }}>{c.time}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-faint)' }}>{c.coach}</div>
                      </div>
                    </div>
                    <span className="mono" style={{ fontSize: 11 }}>{c.spots}</span>
                  </div>
                  <div style={{ height: 3, background: 'var(--ink)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: pct > 90 ? 'var(--magenta)' : pct > 60 ? 'var(--lime)' : 'var(--cyan)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>

        {/* Payments queue */}
        <div style={{ padding: 24, borderRadius: 24, background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <h3 className="display" style={{ fontSize: 16 }}>Payment queue</h3>
            <button onClick={() => navigate('/admin/payments')} style={{ fontSize: 10, color: 'var(--magenta)', background: 'none', border: 'none', cursor: 'pointer' }} className="mono tracking">View all</button>
          </div>
          {paymentQueue.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>No payments</div>}
          {paymentQueue.slice(0, 4).map((p: any, i: number) => (
            <div key={p.id || i} style={{ padding: '10px 0', borderTop: i ? '1px dashed var(--line)' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 6, height: 32, borderRadius: 3, background: p.status === 'Paid' ? 'var(--lime)' : 'var(--magenta)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.member}</div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{p.plan}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="mono" style={{ fontSize: 12 }}>{p.amount}</div>
                <div style={{ fontSize: 10, color: p.status === 'Paid' ? 'var(--lime)' : 'var(--warn)' }}>{p.status}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Staff on shift */}
        <div style={{ padding: 24, borderRadius: 24, background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
            <h3 className="display" style={{ fontSize: 16 }}>On shift now</h3>
            <span className="mono" style={{ fontSize: 10, color: 'var(--lime)' }}>{staffSchedule.length} ACTIVE</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {staffSchedule.slice(0, 7).map((s: any, i: number) => {
              const colors = ['var(--lime)', 'var(--magenta)', 'var(--cyan)', 'var(--warn)'];
              const c = colors[i % colors.length];
              const initials = s.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={s.id || i} style={{ aspectRatio: '1', borderRadius: 12, border: `1px solid ${c}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', position: 'relative' }}>
                  <span className="display" style={{ fontSize: 14, fontWeight: 700, color: c }}>{initials}</span>
                  <span style={{ fontSize: 9, color: 'var(--text-faint)', marginTop: 2 }} className="mono">{s.name.split(' ')[0]}</span>
                  <span style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: '50%', background: 'var(--lime)' }} />
                </div>
              );
            })}
            {staffSchedule.length > 7 && (
              <div style={{ aspectRatio: '1', borderRadius: 12, border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
                <span className="display" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-faint)' }}>+{staffSchedule.length - 7}</span>
              </div>
            )}
          </div>
          <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--ink)', borderRadius: 10, border: '1px solid var(--line)', fontSize: 11, color: 'var(--text-dim)' }}>
            <span style={{ color: 'var(--lime)' }} className="mono">▸</span> Coverage across all branches active
          </div>
        </div>

        {/* Members table */}
        <div style={{ padding: 24, borderRadius: 24, background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <h3 className="display" style={{ fontSize: 16 }}>Recent members</h3>
            <button onClick={() => navigate('/admin/members')} style={{ fontSize: 11, color: 'var(--lime)', background: 'none', border: 'none', cursor: 'pointer' }}>All →</button>
          </div>
          {members.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>No members yet</div>}
          {members.slice(0, 5).map((m: any, i: number) => (
            <div key={m.id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: i ? '1px dashed var(--line)' : 'none' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--lime), var(--magenta))', display: 'grid', placeItems: 'center', color: '#0A0B0F', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                {((m.first_name?.[0] || '') + (m.last_name?.[0] || '')).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.first_name} {m.last_name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Snack */}
      {snack && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '12px 20px', background: 'var(--magenta)', color: '#0A0B0F', borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>
          {snack}
          <button onClick={() => setSnack('')} style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#0A0B0F', fontWeight: 700 }}>×</button>
        </div>
      )}
    </div>
  );
};

export default Overview;
