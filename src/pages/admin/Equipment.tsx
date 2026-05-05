import React, { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../../services/api';

const Equipment: React.FC = () => {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [maintModal, setMaintModal] = useState<any>(null);
  const [nextCheck, setNextCheck] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');

  const load = useCallback(async () => {
    try { setEquipment((await adminAPI.getEquipment()) || []); }
    catch { setSnack('Failed to load equipment'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintModal) return;
    setSaving(true);
    try {
      await adminAPI.logEquipmentMaintenance(maintModal.id, { nextCheck, note });
      setSnack('Maintenance logged!');
      setMaintModal(null);
      setNextCheck(''); setNote('');
      load();
    } catch (err: any) { setSnack(err.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const statusColor = (s: string) => s === 'In service' ? 'var(--lime)' : s === 'Maintenance' ? 'var(--warn)' : 'var(--magenta)';
  const statusBg = (s: string) => s === 'In service' ? 'rgba(212,255,61,0.12)' : s === 'Maintenance' ? 'rgba(255,178,61,0.12)' : 'rgba(255,61,127,0.12)';

  return (
    <div style={{ color: 'var(--text)' }}>
      <div style={{ marginBottom: 24 }}>
        <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 8 }}>ADMIN / EQUIPMENT</div>
        <h2 className="display" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>Equipment tracker</h2>
        <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 6 }}>Maintenance schedules and asset status.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { l: 'Total assets', v: String(equipment.length), c: 'var(--lime)' },
          { l: 'In service', v: String(equipment.filter(e => e.status === 'In service').length), c: 'var(--cyan)' },
          { l: 'Needs attention', v: String(equipment.filter(e => e.status !== 'In service').length), c: 'var(--warn)' },
        ].map((m, i) => (
          <div key={i} className="metric-card" style={{ padding: '20px 24px' }}>
            <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)' }}>{m.l}</div>
            <div className="display" style={{ fontSize: 32, marginTop: 8, color: m.c }}>{m.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
        {loading && <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>Loading…</div>}
        {!loading && equipment.length === 0 && <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>No equipment records</div>}
        {equipment.map((e: any) => {
          const daysUntil = Math.ceil((new Date(e.nextCheck).getTime() - Date.now()) / 86400000);
          const urgent = daysUntil <= 3;
          return (
            <div key={e.id} style={{ padding: 24, borderRadius: 20, background: 'var(--ink-2)', border: `1px solid ${urgent ? 'rgba(255,178,61,0.4)' : 'var(--line)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <h4 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{e.name}</h4>
                <span style={{ padding: '3px 10px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: statusBg(e.status), color: statusColor(e.status), border: `1px solid ${statusColor(e.status)}40` }} className="tracking">
                  {e.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--ink)', borderRadius: 10, border: '1px solid var(--line)', marginBottom: 14 }}>
                <span style={{ fontSize: 11, color: 'var(--text-faint)' }} className="tracking">NEXT CHECK</span>
                <span className="mono" style={{ fontSize: 13, color: urgent ? 'var(--warn)' : 'var(--text)' }}>
                  {e.nextCheck} {urgent && `(${daysUntil}d)`}
                </span>
              </div>
              <button
                className="btn-ghost"
                style={{ width: '100%', padding: '9px', borderRadius: 10, fontSize: 12 }}
                onClick={() => { setMaintModal(e); setNextCheck(e.nextCheck || ''); }}
              >
                Log maintenance
              </button>
            </div>
          );
        })}
      </div>

      {/* Maintenance modal */}
      {maintModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,11,15,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 24, padding: 36, width: '100%', maxWidth: 420, position: 'relative' }}>
            <div className="ticks tl" /><div className="ticks tr" /><div className="ticks bl" /><div className="ticks br" />
            <h3 className="display" style={{ fontSize: 22, marginBottom: 6 }}>Log maintenance</h3>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 24 }}>{maintModal.name}</p>
            <form onSubmit={handleMaintenance} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 6 }} className="tracking">Next check date</label>
                <input type="date" value={nextCheck} onChange={e => setNextCheck(e.target.value)} required
                  style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', colorScheme: 'dark' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 6 }} className="tracking">Note (optional)</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Work performed, parts replaced…"
                  style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', resize: 'vertical', minHeight: 80 }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13 }} onClick={() => setMaintModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : 'Log it'}</button>
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

export default Equipment;
