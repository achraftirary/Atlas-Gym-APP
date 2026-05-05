import React, { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Memberships: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', term: 'Monthly', perks: '' });
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');
  const navigate = useNavigate();
  const colors = ['var(--lime)', 'var(--magenta)', 'var(--cyan)'];

  const load = useCallback(async () => {
    try {
      const [p, m] = await Promise.all([adminAPI.getMemberships(), import('../../services/api').then(a => a.memberAPI.getAll())]);
      setPlans(p || []);
      setMembers(m || []);
    } catch { setSnack('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.createMembershipPlan({ ...form, price: parseFloat(form.price) });
      setSnack('Plan created!');
      setShowModal(false);
      setForm({ name: '', price: '', term: 'Monthly', perks: '' });
      load();
    } catch (err: any) { setSnack(err.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ color: 'var(--text)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 8 }}>ADMIN / MEMBERSHIPS</div>
          <h2 className="display" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>Membership plans</h2>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 6 }}>Pricing tiers, perks and member assignments.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" style={{ padding: '11px 18px', borderRadius: 10, fontSize: 13 }} onClick={() => navigate('/admin/memberships/new')}>Assign to member</button>
          <button className="btn-primary" style={{ padding: '11px 20px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setShowModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0B0F" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            New plan
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16, marginBottom: 24 }}>
        {loading && <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>Loading…</div>}
        {!loading && plans.length === 0 && <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>No plans yet</div>}
        {plans.map((plan: any, i: number) => {
          const c = colors[i % colors.length];
          const membersOnPlan = members.filter((m: any) => m.plan === plan.name).length;
          return (
            <div key={plan.id} style={{ padding: 28, borderRadius: 22, background: 'var(--ink-2)', border: `1px solid ${i === 0 ? 'rgba(212,255,61,0.3)' : 'var(--line)'}`, position: 'relative', overflow: 'hidden' }}>
              {i === 0 && <><div className="ticks tl" /><div className="ticks tr" /><div className="ticks bl" /><div className="ticks br" /></>}
              <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 12 }}>{plan.term?.toUpperCase()} PLAN</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
                <span className="display mono" style={{ fontSize: 36, color: c }}>{plan.price}</span>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>/ {plan.term?.toLowerCase()}</span>
              </div>
              <h3 className="display" style={{ fontSize: 20, marginBottom: 8 }}>{plan.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16 }}>{plan.perks}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px dashed var(--line)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Members on plan</span>
                <span className="mono" style={{ fontSize: 13, color: c }}>{membersOnPlan}</span>
              </div>
              <button className="btn-primary" style={{ width: '100%', padding: '10px', borderRadius: 10, fontSize: 13, marginTop: 14, textAlign: 'center' as const }} onClick={() => navigate('/admin/memberships/new')}>
                Assign →
              </button>
            </div>
          );
        })}
      </div>

      {/* Members with memberships */}
      <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)' }}>
          <h3 className="display" style={{ fontSize: 18 }}>Member subscriptions</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Member', 'Email', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, color: 'var(--text-faint)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', textTransform: 'uppercase', borderBottom: '1px solid var(--line)', background: 'var(--ink)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={3} style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)' }}>Loading…</td></tr>}
              {!loading && members.length === 0 && <tr><td colSpan={3} style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)' }}>No members yet</td></tr>}
              {members.map((m: any) => (
                <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '14px 20px', fontWeight: 600 }}>{m.first_name} {m.last_name}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-dim)', fontSize: 13 }}>{m.email}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <button onClick={() => navigate(`/admin/memberships/${m.id}`)} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(212,255,61,0.1)', color: 'var(--lime)', border: '1px solid rgba(212,255,61,0.3)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                      Manage →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,11,15,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 24, padding: 36, width: '100%', maxWidth: 420, position: 'relative' }}>
            <div className="ticks tl" /><div className="ticks tr" /><div className="ticks bl" /><div className="ticks br" />
            <h3 className="display" style={{ fontSize: 24, marginBottom: 24 }}>New membership plan</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[{ label: 'Plan name', key: 'name', placeholder: 'Gold' }, { label: 'Price (MAD)', key: 'price', placeholder: '790' }, { label: 'Perks', key: 'perks', placeholder: 'All access + 2 PT/mo' }].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 6 }} className="tracking">{f.label}</label>
                  <input type="text" placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required
                    style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 6 }} className="tracking">Term</label>
                <select value={form.term} onChange={e => setForm(p => ({ ...p, term: e.target.value }))}
                  style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none' }}>
                  {['Monthly', 'Quarterly', 'Annual'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13, opacity: saving ? 0.7 : 1 }}>{saving ? 'Creating…' : 'Create plan'}</button>
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

export default Memberships;
