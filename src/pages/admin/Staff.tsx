import React, { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../../services/api';

const Staff: React.FC = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', shift: '' });
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');
  const colors = ['var(--lime)', 'var(--magenta)', 'var(--cyan)', 'var(--warn)'];

  const load = useCallback(async () => {
    try { setStaff((await adminAPI.getStaff()) || []); }
    catch { setSnack('Failed to load staff'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.inviteStaff(form);
      setSnack('Staff member added!');
      setShowModal(false);
      setForm({ name: '', role: '', shift: '' });
      load();
    } catch (err: any) { setSnack(err.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ color: 'var(--text)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 8 }}>ADMIN / STAFF</div>
          <h2 className="display" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>Team management</h2>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 6 }}>Roster, shift scheduling and coverage.</p>
        </div>
        <button className="btn-primary" style={{ padding: '11px 20px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setShowModal(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0B0F" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          Add staff
        </button>
      </div>

      {/* Staff grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginBottom: 24 }}>
        {loading && <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>Loading…</div>}
        {staff.map((s: any, i: number) => {
          const c = colors[i % colors.length];
          const initials = s.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
          return (
            <div key={s.id} style={{ padding: 20, borderRadius: 18, background: 'var(--ink-2)', border: `1px solid var(--line)` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c === 'var(--lime)' ? 'rgba(212,255,61,0.12)' : c === 'var(--magenta)' ? 'rgba(255,61,127,0.12)' : c === 'var(--cyan)' ? 'rgba(77,227,213,0.12)' : 'rgba(255,178,61,0.12)'}`, display: 'grid', placeItems: 'center', color: c, fontWeight: 700, fontSize: 16, flexShrink: 0 }} className="display">{initials}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{s.role}</div>
                </div>
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--ink)', borderRadius: 8, border: '1px solid var(--line)', fontSize: 12 }}>
                <span style={{ color: 'var(--text-faint)', fontSize: 9 }} className="tracking">SHIFT</span>
                <div className="mono" style={{ marginTop: 4, color: c }}>{s.shift}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
                <span className="pulse-dot" style={{ width: 6, height: 6 } as any} />
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>On duty</span>
              </div>
            </div>
          );
        })}
        {!loading && staff.length === 0 && (
          <div style={{ padding: 40, color: 'var(--text-faint)', fontSize: 13, gridColumn: '1/-1' }}>No staff members yet</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,11,15,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 24, padding: 36, width: '100%', maxWidth: 420, position: 'relative' }}>
            <div className="ticks tl" /><div className="ticks tr" /><div className="ticks bl" /><div className="ticks br" />
            <h3 className="display" style={{ fontSize: 24, marginBottom: 24 }}>Add staff member</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Full name', key: 'name', placeholder: 'Sara Benali' },
                { label: 'Role', key: 'role', placeholder: 'Coach / Front Desk / Physio' },
                { label: 'Shift', key: 'shift', placeholder: '07:00 - 15:00' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 6 }} className="tracking">{f.label}</label>
                  <input type="text" placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} required
                    style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13, opacity: saving ? 0.7 : 1 }}>{saving ? 'Adding…' : 'Add member'}</button>
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

export default Staff;
