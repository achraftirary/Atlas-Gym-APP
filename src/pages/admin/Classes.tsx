import React, { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../../services/api';

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', coach: '', start_time: '', capacity: '20' });
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await adminAPI.getClasses();
      setClasses(data || []);
    } catch { setSnack('Failed to load classes'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.createClass({ title: form.title, coach: form.coach, start_time: form.start_time, capacity: parseInt(form.capacity) });
      setSnack('Class created!');
      setShowModal(false);
      setForm({ title: '', coach: '', start_time: '', capacity: '20' });
      load();
    } catch (err: any) { setSnack(err.message || 'Failed to create class'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ color: 'var(--text)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 8 }}>ADMIN / CLASSES</div>
          <h2 className="display" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>Class schedule</h2>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 6 }}>Manage sessions, coaches and capacity.</p>
        </div>
        <button className="btn-primary" style={{ padding: '11px 20px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setShowModal(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0B0F" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          New class
        </button>
      </div>

      <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)' }}>
          <h3 className="display" style={{ fontSize: 18 }}>Upcoming sessions <span className="mono" style={{ fontSize: 12, color: 'var(--text-faint)' }}>({classes.length})</span></h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Class', 'Coach', 'Time', 'Spots', 'Fill rate'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, color: 'var(--text-faint)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', textTransform: 'uppercase', borderBottom: '1px solid var(--line)', background: 'var(--ink)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)' }}>Loading…</td></tr>}
              {!loading && classes.length === 0 && <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)' }}>No classes scheduled</td></tr>}
              {classes.map((c: any) => {
                const [booked, cap] = String(c.spots || '0/20').split('/');
                const pct = cap ? Math.round((parseInt(booked) / parseInt(cap)) * 100) : 0;
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '14px 20px', fontWeight: 600 }}>{c.name}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-dim)' }}>{c.coach}</td>
                    <td style={{ padding: '14px 20px' }}><span className="mono" style={{ fontSize: 13 }}>{c.time}</span></td>
                    <td style={{ padding: '14px 20px' }}><span className="mono">{c.spots}</span></td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 4, background: 'var(--ink)', borderRadius: 2, overflow: 'hidden', minWidth: 60 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: pct > 90 ? 'var(--magenta)' : pct > 60 ? 'var(--lime)' : 'var(--cyan)', borderRadius: 2 }} />
                        </div>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', width: 32 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,11,15,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 24, padding: 36, width: '100%', maxWidth: 460, position: 'relative' }}>
            <div className="ticks tl" /><div className="ticks tr" /><div className="ticks bl" /><div className="ticks br" />
            <h3 className="display" style={{ fontSize: 24, marginBottom: 24 }}>New class session</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Class title', key: 'title', type: 'text', placeholder: 'HIIT Burn' },
                { label: 'Coach', key: 'coach', type: 'text', placeholder: 'Coach Lina' },
                { label: 'Start time', key: 'start_time', type: 'datetime-local', placeholder: '' },
                { label: 'Capacity', key: 'capacity', type: 'number', placeholder: '20' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 6 }} className="tracking">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    required
                    style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', colorScheme: 'dark' }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13, opacity: saving ? 0.7 : 1 }}>{saving ? 'Creating…' : 'Create class'}</button>
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

export default Classes;
