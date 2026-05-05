import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { membershipAPI, memberAPI } from '../services/api';

const MembershipForm: React.FC = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [membershipId, setMembershipId] = useState<number | null>(null);
  const [form, setForm] = useState({
    member_id: memberId || '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: 'active' as 'active' | 'pending' | 'expired',
  });

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);
    Promise.all([
      memberAPI.getById(memberId).catch(() => null),
      membershipAPI.getByMemberId(memberId).catch(() => null),
    ]).then(([member, membership]) => {
      if (member) setMemberInfo(member);
      const ms = Array.isArray(membership) ? membership[0] : membership;
      if (ms) {
        setMembershipId(ms.id);
        setForm({
          member_id: String(ms.member_id || memberId),
          start_date: ms.start_date ? ms.start_date.split('T')[0] : new Date().toISOString().split('T')[0],
          end_date: ms.end_date ? ms.end_date.split('T')[0] : new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          status: ms.status || 'active',
        });
      }
    }).finally(() => setLoading(false));
  }, [memberId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.start_date || !form.end_date) { setError('Please provide both start and end dates'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, start_date: new Date(form.start_date), end_date: new Date(form.end_date) };
      if (membershipId) {
        await membershipAPI.update(membershipId, payload);
      } else {
        await membershipAPI.create(payload);
      }
      navigate('/admin/memberships');
    } catch (err: any) {
      setError(err.message || 'Failed to save membership');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 10,
    padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 6,
    letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontFamily: 'JetBrains Mono, monospace',
  };

  if (loading) {
    return (
      <div style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <span style={{ color: 'var(--text-faint)', fontSize: 14 }}>Loading membership…</span>
      </div>
    );
  }

  return (
    <div style={{ color: 'var(--text)', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 8 }}>
          ADMIN / MEMBERSHIPS / {memberId ? 'MANAGE' : 'ASSIGN'}
        </div>
        <h2 className="display" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>
          {memberId ? 'Manage subscription' : 'Assign membership'}
        </h2>
        {memberInfo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--lime), var(--magenta))', display: 'grid', placeItems: 'center', color: '#0A0B0F', fontWeight: 700, fontSize: 12 }}>
              {((memberInfo.first_name?.[0] || '') + (memberInfo.last_name?.[0] || '')).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{memberInfo.first_name} {memberInfo.last_name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{memberInfo.email}</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 24, padding: 36, position: 'relative' }}>
        <div className="ticks tl" /><div className="ticks tr" /><div className="ticks bl" /><div className="ticks br" />

        {error && (
          <div style={{ background: 'rgba(255,61,127,0.1)', border: '1px solid rgba(255,61,127,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: 'var(--magenta)', fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {!memberId && (
            <div>
              <label style={labelStyle}>Member ID</label>
              <input type="text" value={form.member_id} onChange={e => setForm(p => ({ ...p, member_id: e.target.value }))} required style={inputStyle}
                placeholder="e.g. 42"
                onFocus={e => (e.target.style.borderColor = 'var(--lime)')} onBlur={e => (e.target.style.borderColor = 'var(--line)')} />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Start date</label>
              <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} required style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--lime)')} onBlur={e => (e.target.style.borderColor = 'var(--line)')} />
            </div>
            <div>
              <label style={labelStyle}>End date</label>
              <input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} required style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--lime)')} onBlur={e => (e.target.style.borderColor = 'var(--line)')} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}
              style={{ ...inputStyle, appearance: 'none' }}>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn-ghost" style={{ flex: 1, padding: '13px', borderRadius: 10, fontSize: 13 }}
              onClick={() => navigate('/admin/memberships')}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}
              style={{ flex: 2, padding: '13px', borderRadius: 10, fontSize: 13, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : (membershipId ? 'Update subscription' : 'Create subscription')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MembershipForm;
