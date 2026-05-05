import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');
  const [snackOk, setSnackOk] = useState(true);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    current_password: '', new_password: '', confirm_password: '',
  });

  useEffect(() => {
    adminAPI.getProfile()
      .then((data: any) => {
        setProfile(data);
        setForm(f => ({ ...f, first_name: data.first_name || '', last_name: data.last_name || '', email: data.email || '' }));
      })
      .catch(() => showSnack('Failed to load profile', false))
      .finally(() => setLoading(false));
  }, []);

  const showSnack = (msg: string, ok = true) => {
    setSnack(msg); setSnackOk(ok);
    setTimeout(() => setSnack(''), 4000);
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.new_password && form.new_password !== form.confirm_password) {
      showSnack('New passwords do not match', false); return;
    }
    if (form.new_password && form.new_password.length < 6) {
      showSnack('New password must be at least 6 characters', false); return;
    }
    setSaving(true);
    try {
      await adminAPI.updateProfile({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        ...(form.new_password ? { current_password: form.current_password, new_password: form.new_password } : {}),
      });
      localStorage.setItem('userName', `${form.first_name} ${form.last_name}`);
      setForm(f => ({ ...f, current_password: '', new_password: '', confirm_password: '' }));
      showSnack('Profile updated successfully');
    } catch (err: any) {
      showSnack(err.message || 'Failed to update profile', false);
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
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = 'var(--lime)');
  const onBlur  = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = 'var(--line)');

  if (loading) return (
    <div style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <span style={{ color: 'var(--text-faint)', fontSize: 14 }}>Loading profile…</span>
    </div>
  );

  const initials = ((profile?.first_name?.[0] || '') + (profile?.last_name?.[0] || '')).toUpperCase() || 'AD';

  return (
    <div style={{ color: 'var(--text)', maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 8 }}>ADMIN / PROFILE</div>
        <h2 className="display" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>Account settings</h2>
        <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 6 }}>Update your admin credentials and personal info.</p>
      </div>

      {/* Avatar card */}
      <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 20, padding: '24px 28px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--lime), var(--cyan))', display: 'grid', placeItems: 'center', color: '#0A0B0F', fontWeight: 800, fontSize: 22, flexShrink: 0 }} className="display">{initials}</div>
        <div>
          <div className="display" style={{ fontSize: 20 }}>{profile?.first_name} {profile?.last_name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 3 }}>{profile?.email}</div>
          <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
            <span style={{ padding: '3px 10px', borderRadius: 4, background: 'rgba(212,255,61,0.12)', color: 'var(--lime)', fontSize: 11, fontWeight: 600 }} className="tracking">{profile?.role || 'admin'}</span>
            <span style={{ padding: '3px 10px', borderRadius: 4, background: 'var(--ink-3)', color: 'var(--text-faint)', fontSize: 11 }} className="mono">Since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 24, padding: 32, position: 'relative' }}>
        <div className="ticks tl" /><div className="ticks tr" /><div className="ticks bl" /><div className="ticks br" />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Personal info */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, paddingBottom: 10, borderBottom: '1px dashed var(--line)' }}>Personal information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>First name</label>
                <input type="text" value={form.first_name} onChange={set('first_name')} required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label style={labelStyle}>Last name</label>
                <input type="text" value={form.last_name} onChange={set('last_name')} required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>Email address</label>
              <input type="email" value={form.email} onChange={set('email')} required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>

          {/* Password change */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, paddingBottom: 10, borderBottom: '1px dashed var(--line)' }}>Change password <span style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 400 }}>(leave blank to keep current)</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Current password</label>
                <input type="password" value={form.current_password} onChange={set('current_password')} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>New password</label>
                  <input type="password" value={form.new_password} onChange={set('new_password')} minLength={6} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div>
                  <label style={labelStyle}>Confirm new password</label>
                  <input type="password" value={form.confirm_password} onChange={set('confirm_password')} minLength={6} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={saving}
            style={{ padding: '14px', borderRadius: 12, fontSize: 14, fontWeight: 700, opacity: saving ? 0.7 : 1, alignSelf: 'flex-start', paddingLeft: 32, paddingRight: 32 }}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>

      {snack && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '12px 20px', background: snackOk ? 'var(--lime)' : 'var(--magenta)', color: '#0A0B0F', borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>
          {snack}
        </div>
      )}
    </div>
  );
};

export default Profile;
