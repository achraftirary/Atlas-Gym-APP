import React, { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../../services/api';

const Trainers: React.FC = () => {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', specialty: '', rating: '4.5', availability: 'Mon-Fri' });
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');
  const colors = ['var(--lime)', 'var(--magenta)', 'var(--cyan)', 'var(--warn)'];

  const load = useCallback(async () => {
    try { setTrainers((await adminAPI.getTrainers()) || []); }
    catch { setSnack('Failed to load trainers'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.createTrainer({ ...form, rating: parseFloat(form.rating) });
      setSnack('Trainer added!');
      setShowModal(false);
      setForm({ name: '', specialty: '', rating: '4.5', availability: 'Mon-Fri' });
      load();
    } catch (err: any) { setSnack(err.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const stars = (r: number) => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));

  return (
    <div style={{ color: 'var(--text)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 8 }}>ADMIN / TRAINERS</div>
          <h2 className="display" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>Coach roster</h2>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 6 }}>Manage your team of professional coaches.</p>
        </div>
        <button className="btn-primary" style={{ padding: '11px 20px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setShowModal(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0B0F" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          Add trainer
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
        {loading && <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>Loading…</div>}
        {!loading && trainers.length === 0 && <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>No trainers yet</div>}
        {trainers.map((t: any, i: number) => {
          const c = colors[i % colors.length];
          const initials = t.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
          const rating = parseFloat(t.rating) || 4.5;
          return (
            <div key={t.id} style={{ padding: 24, borderRadius: 20, background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${c === 'var(--lime)' ? 'rgba(212,255,61,0.12)' : c === 'var(--magenta)' ? 'rgba(255,61,127,0.12)' : c === 'var(--cyan)' ? 'rgba(77,227,213,0.12)' : 'rgba(255,178,61,0.12)'}`, display: 'grid', placeItems: 'center', color: c, fontWeight: 700, fontSize: 18, border: `2px solid ${c}40` }} className="display">{initials}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{t.specialty}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px dashed var(--line)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Rating</span>
                <span style={{ fontSize: 12, color: 'var(--warn)' }}>{stars(rating)} {rating}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px dashed var(--line)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Availability</span>
                <span className="mono" style={{ fontSize: 12, color: c }}>{t.availability}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,11,15,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 24, padding: 36, width: '100%', maxWidth: 420, position: 'relative' }}>
            <div className="ticks tl" /><div className="ticks tr" /><div className="ticks bl" /><div className="ticks br" />
            <h3 className="display" style={{ fontSize: 24, marginBottom: 24 }}>Add trainer</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Full name', key: 'name', placeholder: 'Coach Lina Bensalah' },
                { label: 'Specialty', key: 'specialty', placeholder: 'HIIT / Strength / Mobility' },
                { label: 'Rating (1-5)', key: 'rating', placeholder: '4.5' },
                { label: 'Availability', key: 'availability', placeholder: 'Mon/Wed/Fri' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 6 }} className="tracking">{f.label}</label>
                  <input type="text" placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required
                    style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13, opacity: saving ? 0.7 : 1 }}>{saving ? 'Adding…' : 'Add trainer'}</button>
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

export default Trainers;
