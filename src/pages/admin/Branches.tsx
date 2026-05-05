import React, { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../../services/api';

const Branches: React.FC = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', city: '' });
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');
  const colors = ['var(--lime)', 'var(--magenta)', 'var(--cyan)', 'var(--warn)'];

  const load = useCallback(async () => {
    try { setBranches((await adminAPI.getBranches()) || []); }
    catch { setSnack('Failed to load branches'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.createBranch(form);
      setSnack('Branch added!');
      setShowModal(false);
      setForm({ name: '', city: '' });
      load();
    } catch (err: any) { setSnack(err.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ color: 'var(--text)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 8 }}>ADMIN / BRANCHES</div>
          <h2 className="display" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>Locations</h2>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 6 }}>Multi-location management and branch overview.</p>
        </div>
        <button className="btn-primary" style={{ padding: '11px 20px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setShowModal(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0B0F" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          Add branch
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
        {loading && <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>Loading…</div>}
        {!loading && branches.length === 0 && <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>No branches yet</div>}
        {branches.map((b: any, i: number) => {
          const c = colors[i % colors.length];
          const rank = String(i + 1).padStart(2, '0');
          return (
            <div key={b.id} style={{ padding: 28, borderRadius: 22, background: 'var(--ink-2)', border: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 48, fontWeight: 800, color: 'rgba(255,255,255,0.04)', lineHeight: 1 }} className="display mono">{rank}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${c === 'var(--lime)' ? 'rgba(212,255,61,0.12)' : c === 'var(--magenta)' ? 'rgba(255,61,127,0.12)' : c === 'var(--cyan)' ? 'rgba(77,227,213,0.12)' : 'rgba(255,178,61,0.12)'}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" />
                  </svg>
                </div>
                <div>
                  <h3 className="display" style={{ fontSize: 18, margin: 0 }}>{b.name}</h3>
                  <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 2 }}>{b.city}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px dashed var(--line)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Total members</span>
                <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: c }}>{b.members || 0}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
                <span className="pulse-dot" />
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Active · all systems live</span>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,11,15,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 24, padding: 36, width: '100%', maxWidth: 420, position: 'relative' }}>
            <div className="ticks tl" /><div className="ticks tr" /><div className="ticks bl" /><div className="ticks br" />
            <h3 className="display" style={{ fontSize: 24, marginBottom: 24 }}>New branch</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[{ label: 'Branch name', key: 'name', placeholder: 'Atlas Gym Maarif' }, { label: 'City', key: 'city', placeholder: 'Casablanca' }].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 6 }} className="tracking">{f.label}</label>
                  <input type="text" placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required
                    style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13, opacity: saving ? 0.7 : 1 }}>{saving ? 'Adding…' : 'Add branch'}</button>
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

export default Branches;
