import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberAPI } from '../services/api';

const MembersList: React.FC = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [snack, setSnack] = useState('');

  const load = useCallback(async () => {
    try { setMembers((await memberAPI.getAll()) || []); }
    catch { setSnack('Failed to load members'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(confirmDelete.id);
    try {
      await memberAPI.delete(confirmDelete.id);
      setSnack('Member deleted');
      setConfirmDelete(null);
      load();
    } catch (err: any) { setSnack(err.message || 'Failed to delete'); }
    finally { setDeleting(null); }
  };

  const filtered = members.filter(m =>
    !search ||
    `${m.first_name} ${m.last_name} ${m.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ color: 'var(--text)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 8 }}>ADMIN / MEMBERS</div>
          <h2 className="display" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>Member roster</h2>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 6 }}>{members.length} member{members.length !== 1 ? 's' : ''} in database</p>
        </div>
        <button className="btn-primary" style={{ padding: '11px 20px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => navigate('/admin/members/new')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0B0F" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          Add member
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { l: 'Total members', v: String(members.length), c: 'var(--lime)' },
          { l: 'Added this month', v: String(members.filter(m => new Date(m.created_at) > new Date(Date.now() - 30 * 86400000)).length), c: 'var(--cyan)' },
          { l: 'Search results', v: String(filtered.length), c: 'var(--magenta)' },
        ].map((m, i) => (
          <div key={i} className="metric-card" style={{ padding: '18px 22px' }}>
            <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)' }}>{m.l}</div>
            <div className="display" style={{ fontSize: 28, marginTop: 6, color: m.c }}>{m.v}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 14, alignItems: 'center' }}>
          <h3 className="display" style={{ fontSize: 18 }}>All members</h3>
          <div style={{ flex: 1 }} />
          <div style={{ position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" /></svg>
            <input type="text" placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 10, padding: '8px 14px 8px 36px', color: 'var(--text)', fontSize: 13, outline: 'none', width: 220 }} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Member', 'Email', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, color: 'var(--text-faint)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', textTransform: 'uppercase', borderBottom: '1px solid var(--line)', background: 'var(--ink)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)' }}>Loading…</td></tr>}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)' }}>
                  {members.length === 0 ? 'No members yet — add the first one!' : 'No results for this search'}
                </td></tr>
              )}
              {filtered.map((m: any) => {
                const initials = ((m.first_name?.[0] || '') + (m.last_name?.[0] || '')).toUpperCase();
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--lime), var(--magenta))', display: 'grid', placeItems: 'center', color: '#0A0B0F', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{initials}</div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{m.first_name} {m.last_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-dim)', fontSize: 13 }}>{m.email}</td>
                    <td style={{ padding: '14px 20px' }}><span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>{m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}</span></td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => navigate(`/admin/members/${m.id}`)} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(212,255,61,0.08)', color: 'var(--lime)', border: '1px solid rgba(212,255,61,0.2)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => navigate(`/admin/memberships/${m.id}`)} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(77,227,213,0.08)', color: 'var(--cyan)', border: '1px solid rgba(77,227,213,0.2)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Plan</button>
                        <button onClick={() => setConfirmDelete(m)} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(255,61,127,0.08)', color: 'var(--magenta)', border: '1px solid rgba(255,61,127,0.2)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,11,15,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--ink-2)', border: '1px solid rgba(255,61,127,0.4)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,61,127,0.12)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--magenta)" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
            </div>
            <h3 className="display" style={{ fontSize: 20, marginBottom: 8 }}>Delete member?</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 24 }}>
              This will permanently delete <strong style={{ color: 'var(--text)' }}>{confirmDelete.first_name} {confirmDelete.last_name}</strong> and all their data.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13 }} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting === confirmDelete.id} style={{ flex: 1, padding: '12px', borderRadius: 10, fontSize: 13, background: 'var(--magenta)', color: '#0A0B0F', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: deleting ? 0.7 : 1 }}>
                {deleting === confirmDelete.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {snack && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '12px 20px', background: snack.includes('delete') || snack.includes('Delete') ? 'var(--lime)' : 'var(--magenta)', color: '#0A0B0F', borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>
          {snack} <button onClick={() => setSnack('')} style={{ marginLeft: 10, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>×</button>
        </div>
      )}
    </div>
  );
};

export default MembersList;
