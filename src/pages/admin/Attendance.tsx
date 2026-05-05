import React, { useEffect, useState, useCallback } from 'react';
import { adminAPI, memberAPI } from '../../services/api';

const Attendance: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState('');
  const [snackOk, setSnackOk] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [memberId, setMemberId] = useState('');
  const [logging, setLogging] = useState(false);

  const load = useCallback(async () => {
    try {
      const [att, mem] = await Promise.all([adminAPI.getAttendance(), memberAPI.getAll()]);
      setRecords(att || []);
      setMembers(mem || []);
    } catch { showSnack('Failed to load attendance', false); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const showSnack = (msg: string, ok = true) => {
    setSnack(msg); setSnackOk(ok);
    setTimeout(() => setSnack(''), 4000);
  };

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return;
    setLogging(true);
    try {
      const res = await adminAPI.logCheckin(Number(memberId));
      showSnack(res.message || 'Check-in logged');
      setShowModal(false);
      setMemberId('');
      load();
    } catch (err: any) {
      showSnack(err.message || 'Failed to log check-in', false);
    } finally {
      setLogging(false);
    }
  };

  const filtered = records.filter(r =>
    !search || r.member?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ color: 'var(--text)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 8 }}>ADMIN / ATTENDANCE</div>
          <h2 className="display" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>Check-ins today</h2>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 6 }}>Live floor traffic and member access log.</p>
        </div>
        <button className="btn-primary" style={{ padding: '11px 20px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setShowModal(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0B0F" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          Log check-in
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { l: 'Total check-ins', v: String(records.length), c: 'var(--lime)' },
          { l: 'Peak hour', v: records.length > 0 ? records[0]?.time?.slice(0, 5) || '—' : '—', c: 'var(--cyan)' },
          { l: 'Unique members', v: String(new Set(records.map(r => r.member)).size), c: 'var(--magenta)' },
        ].map((m, i) => (
          <div key={i} className="metric-card" style={{ padding: '20px 24px' }}>
            <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)' }}>{m.l}</div>
            <div className="display" style={{ fontSize: 32, marginTop: 8, color: m.c }}>{m.v}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 14, alignItems: 'center' }}>
          <h3 className="display" style={{ fontSize: 18 }}>Access log</h3>
          <div style={{ flex: 1 }} />
          <div style={{ position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" /></svg>
            <input type="text" placeholder="Search member…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 10, padding: '8px 14px 8px 36px', color: 'var(--text)', fontSize: 13, outline: 'none', width: 200 }} />
          </div>
          <button onClick={load} className="btn-ghost" style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12 }}>Refresh</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['#', 'Member', 'Time', 'Method'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, color: 'var(--text-faint)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', textTransform: 'uppercase', borderBottom: '1px solid var(--line)', background: 'var(--ink)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)' }}>Loading…</td></tr>}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)' }}>
                  {records.length === 0 ? 'No check-ins today — log the first one!' : 'No results'}
                </td></tr>
              )}
              {filtered.map((r: any, i: number) => (
                <tr key={r.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '14px 20px' }}><span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>#{i + 1}</span></td>
                  <td style={{ padding: '14px 20px', fontWeight: 600 }}>{r.member}</td>
                  <td style={{ padding: '14px 20px' }}><span className="mono" style={{ fontSize: 13, color: 'var(--lime)' }}>{r.time}</span></td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: 'rgba(77,227,213,0.12)', color: 'var(--cyan)', border: '1px solid rgba(77,227,213,0.3)' }} className="tracking">
                      {r.method || 'QR'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log check-in modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,11,15,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 24, padding: 36, width: '100%', maxWidth: 420, position: 'relative' }}>
            <div className="ticks tl" /><div className="ticks tr" /><div className="ticks bl" /><div className="ticks br" />
            <h3 className="display" style={{ fontSize: 24, marginBottom: 8 }}>Log check-in</h3>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 24 }}>Select a member to record a manual check-in.</p>
            <form onSubmit={handleCheckin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 6, letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontFamily: 'JetBrains Mono, monospace' }}>Member</label>
                <select value={memberId} onChange={e => setMemberId(e.target.value)} required
                  style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none' }}>
                  <option value="">Select a member…</option>
                  {members.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13 }} onClick={() => { setShowModal(false); setMemberId(''); }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={logging || !memberId} style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13, opacity: logging ? 0.7 : 1 }}>
                  {logging ? 'Logging…' : 'Log check-in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {snack && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '12px 20px', background: snackOk ? 'var(--lime)' : 'var(--magenta)', color: '#0A0B0F', borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>
          {snack} <button onClick={() => setSnack('')} style={{ marginLeft: 10, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>×</button>
        </div>
      )}
    </div>
  );
};

export default Attendance;
