import React, { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../../services/api';

const STAGES = ['Trial booked', 'Follow-up', 'Tour scheduled', 'Converted', 'Lost'];
const stageColor = (s: string) => {
  if (s === 'Converted') return { bg: 'rgba(212,255,61,0.12)', c: 'var(--lime)' };
  if (s === 'Lost') return { bg: 'rgba(255,61,127,0.12)', c: 'var(--magenta)' };
  if (s === 'Trial booked') return { bg: 'rgba(77,227,213,0.12)', c: 'var(--cyan)' };
  return { bg: 'rgba(255,178,61,0.12)', c: 'var(--warn)' };
};

const CRM: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', stage: 'Trial booked', owner: '' });
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');

  const load = useCallback(async () => {
    try { setLeads((await adminAPI.getLeads()) || []); }
    catch { setSnack('Failed to load leads'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.createLead(form);
      setSnack('Lead added!');
      setShowModal(false);
      setForm({ name: '', stage: 'Trial booked', owner: '' });
      load();
    } catch (err: any) { setSnack(err.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const byStage = STAGES.map(s => ({ stage: s, leads: leads.filter(l => l.stage === s) }));

  return (
    <div style={{ color: 'var(--text)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 8 }}>ADMIN / CRM</div>
          <h2 className="display" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>Lead pipeline</h2>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 6 }}>Trial prospects and conversion tracking.</p>
        </div>
        <button className="btn-primary" style={{ padding: '11px 20px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setShowModal(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0B0F" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          Add lead
        </button>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { l: 'Total leads', v: String(leads.length), c: 'var(--lime)' },
          { l: 'Active trials', v: String(leads.filter(l => l.stage === 'Trial booked').length), c: 'var(--cyan)' },
          { l: 'Converted', v: String(leads.filter(l => l.stage === 'Converted').length), c: 'var(--lime)' },
          { l: 'Follow-up', v: String(leads.filter(l => l.stage === 'Follow-up').length), c: 'var(--warn)' },
        ].map((m, i) => (
          <div key={i} className="metric-card" style={{ padding: '18px 20px' }}>
            <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)' }}>{m.l}</div>
            <div className="display" style={{ fontSize: 28, marginTop: 6, color: m.c }}>{m.v}</div>
          </div>
        ))}
      </div>

      {/* Pipeline board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
        {byStage.filter(col => col.leads.length > 0 || col.stage === 'Trial booked').map(col => {
          const { bg, c } = stageColor(col.stage);
          return (
            <div key={col.stage} style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{col.stage}</span>
                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, background: bg, color: c, fontWeight: 700 }} className="mono">{col.leads.length}</span>
              </div>
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.leads.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-faint)', padding: '8px 4px' }}>Empty</div>}
                {col.leads.map((l: any) => (
                  <div key={l.id} style={{ padding: '12px 14px', background: 'var(--ink)', borderRadius: 12, border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{l.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>Owner: {l.owner}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* All leads table */}
      <div style={{ marginTop: 24, background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)' }}>
          <h3 className="display" style={{ fontSize: 18 }}>All leads</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Lead', 'Stage', 'Owner'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, color: 'var(--text-faint)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', textTransform: 'uppercase', borderBottom: '1px solid var(--line)', background: 'var(--ink)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={3} style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)' }}>Loading…</td></tr>}
              {!loading && leads.length === 0 && <tr><td colSpan={3} style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)' }}>No leads yet</td></tr>}
              {leads.map((l: any) => {
                const { bg, c } = stageColor(l.stage);
                return (
                  <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '14px 20px', fontWeight: 600 }}>{l.name}</td>
                    <td style={{ padding: '14px 20px' }}><span style={{ padding: '3px 10px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: bg, color: c }} className="tracking">{l.stage}</span></td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-dim)' }}>{l.owner}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,11,15,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 24, padding: 36, width: '100%', maxWidth: 420, position: 'relative' }}>
            <div className="ticks tl" /><div className="ticks tr" /><div className="ticks bl" /><div className="ticks br" />
            <h3 className="display" style={{ fontSize: 24, marginBottom: 24 }}>New lead</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[{ label: 'Lead name', key: 'name', type: 'text', placeholder: 'Omar Tahir' }, { label: 'Owner', key: 'owner', type: 'text', placeholder: 'Amal / Hajar / Salim' }].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 6 }} className="tracking">{f.label}</label>
                  <input type="text" placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required
                    style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 6 }} className="tracking">Stage</label>
                <select value={form.stage} onChange={e => setForm(p => ({ ...p, stage: e.target.value }))}
                  style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none' }}>
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13, opacity: saving ? 0.7 : 1 }}>{saving ? 'Adding…' : 'Add lead'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {snack && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '12px 20px', background: 'var(--lime)', color: '#0A0B0F', borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>
          {snack} <button onClick={() => setSnack('')} style={{ marginLeft: 10, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>×</button>
        </div>
      )}
    </div>
  );
};

export default CRM;
