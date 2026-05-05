import React, { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../../services/api';

const Reports: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState('');

  const load = useCallback(async () => {
    try {
      const [logs, data] = await Promise.all([adminAPI.getAuditLogs(), adminAPI.getOverview()]);
      setAuditLogs(logs || []);
      setOverview(data);
    } catch { setSnack('Failed to load reports'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const kpis = overview?.overviewKpis || [];

  const actionColor = (action: string) => {
    if (action.includes('create') || action.includes('invite')) return 'var(--lime)';
    if (action.includes('delete') || action.includes('cancel')) return 'var(--magenta)';
    if (action.includes('paid') || action.includes('mark')) return 'var(--cyan)';
    return 'var(--warn)';
  };

  return (
    <div style={{ color: 'var(--text)' }}>
      <div style={{ marginBottom: 24 }}>
        <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 8 }}>ADMIN / REPORTS</div>
        <h2 className="display" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>Analytics & audit</h2>
        <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 6 }}>KPI snapshots, trends and full admin action trail.</p>
      </div>

      {/* KPI cards from live data */}
      {kpis.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16, marginBottom: 24 }}>
          {kpis.map((kpi: any, i: number) => {
            const cs = ['var(--lime)', 'var(--cyan)', 'var(--magenta)', 'var(--warn)', 'var(--lime)', 'var(--cyan)'];
            const c = cs[i % cs.length];
            return (
              <div key={kpi.id} className="metric-card" style={{ padding: '18px 20px' }}>
                <div className="tracking" style={{ fontSize: 9, color: 'var(--text-faint)', marginBottom: 8 }}>{kpi.id.replace(/([A-Z])/g, ' $1').toUpperCase()}</div>
                <div className="display mono" style={{ fontSize: 28, color: c }}>{kpi.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6 }}>{kpi.delta}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trend bars */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ padding: 28, borderRadius: 20, background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
          <h3 className="display" style={{ fontSize: 18, marginBottom: 20 }}>Activity distribution</h3>
          {[
            { l: 'Member check-ins', v: 82, c: 'var(--lime)' },
            { l: 'Class bookings', v: 67, c: 'var(--cyan)' },
            { l: 'Payment collection rate', v: 91, c: 'var(--magenta)' },
            { l: 'Equipment uptime', v: 76, c: 'var(--warn)' },
          ].map((m, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{m.l}</span>
                <span className="mono" style={{ fontSize: 12, color: m.c }}>{m.v}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--ink)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${m.v}%`, height: '100%', background: m.c, borderRadius: 3, transition: 'width 1s ease' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: 28, borderRadius: 20, background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
          <h3 className="display" style={{ fontSize: 18, marginBottom: 20 }}>Quick stats</h3>
          {[
            { l: 'Audit entries', v: String(auditLogs.length), c: 'var(--lime)' },
            { l: 'Actions today', v: String(auditLogs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length), c: 'var(--cyan)' },
            { l: 'Unique admin ops', v: String(new Set(auditLogs.map(l => l.action)).size), c: 'var(--magenta)' },
          ].map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < 2 ? '1px dashed var(--line)' : 'none' }}>
              <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{m.l}</span>
              <span className="display mono" style={{ fontSize: 24, color: m.c }}>{m.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit trail */}
      <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="display" style={{ fontSize: 18 }}>Audit trail</h3>
          <button onClick={load} className="btn-ghost" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12 }}>Refresh</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Action', 'Entity', 'Details', 'When'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, color: 'var(--text-faint)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', textTransform: 'uppercase', borderBottom: '1px solid var(--line)', background: 'var(--ink)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)' }}>Loading…</td></tr>}
              {!loading && auditLogs.length === 0 && <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)' }}>No audit entries yet</td></tr>}
              {auditLogs.map((log: any, i: number) => (
                <tr key={log.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: `${actionColor(log.action)}18`, color: actionColor(log.action) }} className="tracking">{log.action}</span>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-dim)', fontSize: 13 }}>{log.entityType}{log.entityId ? ` #${log.entityId}` : ''}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-faint)', fontSize: 12, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {typeof log.details === 'object' ? Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(' · ') : String(log.details)}
                  </td>
                  <td style={{ padding: '14px 20px' }}><span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>{new Date(log.createdAt).toLocaleString()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {snack && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '12px 20px', background: 'var(--lime)', color: '#0A0B0F', borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>
          {snack} <button onClick={() => setSnack('')} style={{ marginLeft: 10, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>×</button>
        </div>
      )}
    </div>
  );
};

export default Reports;
