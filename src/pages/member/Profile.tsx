import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AtlasLogo from '../../components/AtlasLogo';

const MemberProfile: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');
  const [snackOk, setSnackOk] = useState(true);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    current_password: '', new_password: '', confirm_password: '',
  });

  useEffect(() => {
    Promise.all([
      memberAPI.getProfile(),
      memberAPI.getDashboard(),
    ]).then(([prof, dash]: any[]) => {
      setProfile(prof);
      setSubscription(dash?.subscription || null);
      setForm(f => ({ ...f, first_name: prof.first_name || '', last_name: prof.last_name || '', email: prof.email || '' }));
    }).catch(() => showSnack('Failed to load profile', false))
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
      await memberAPI.updateProfile({
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

  const handleLogout = () => { logout(); navigate('/login'); };

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

  const initials = ((form.first_name?.[0] || '') + (form.last_name?.[0] || '')).toUpperCase() || '??';
  const subStatusColor = subscription?.status === 'active' ? 'var(--lime)' : subscription?.status === 'pending' ? 'var(--warn)' : 'var(--magenta)';

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100vh', color: 'var(--text)', position: 'relative' }}>
      {/* Topbar */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid var(--line)', background: 'rgba(10,11,15,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <AtlasLogo size={24} accent wordmark wordmarkSize={13} color="var(--lime)" />
          <nav style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => navigate('/member/dashboard')} style={{ padding: '8px 14px', borderRadius: 8, background: 'transparent', color: 'var(--text-dim)', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Dashboard</button>
            <button style={{ padding: '8px 14px', borderRadius: 8, background: 'var(--ink-3)', color: 'var(--text)', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Profile</button>
          </nav>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 14px', borderRadius: 8, background: 'none', border: '1px solid var(--line)', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer' }}>Log out</button>
      </header>

      <div style={{ padding: '40px 40px 64px', maxWidth: 680, margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <span style={{ color: 'var(--text-faint)', fontSize: 14 }}>Loading profile…</span>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 28 }}>
              <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 8 }}>MEMBER / PROFILE</div>
              <h2 className="display" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>My profile</h2>
              <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 6 }}>Manage your personal info and account security.</p>
            </div>

            {/* Avatar + subscription */}
            <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 20, padding: '24px 28px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--lime), var(--magenta))', display: 'grid', placeItems: 'center', color: '#0A0B0F', fontWeight: 800, fontSize: 22, flexShrink: 0 }} className="display">{initials}</div>
              <div style={{ flex: 1 }}>
                <div className="display" style={{ fontSize: 20 }}>{form.first_name} {form.last_name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 3 }}>{form.email}</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {subscription ? (
                    <>
                      <span style={{ padding: '3px 10px', borderRadius: 4, background: `${subStatusColor}18`, color: subStatusColor, fontSize: 11, fontWeight: 600 }} className="tracking">{subscription.status}</span>
                      <span style={{ padding: '3px 10px', borderRadius: 4, background: 'var(--ink-3)', color: 'var(--text-faint)', fontSize: 11 }} className="mono">
                        Expires {new Date(subscription.end_date).toLocaleDateString()} · {subscription.days_remaining}d left
                      </span>
                    </>
                  ) : (
                    <span style={{ padding: '3px 10px', borderRadius: 4, background: 'rgba(255,61,127,0.12)', color: 'var(--magenta)', fontSize: 11, fontWeight: 600 }} className="tracking">No active subscription</span>
                  )}
                  <span style={{ padding: '3px 10px', borderRadius: 4, background: 'var(--ink-3)', color: 'var(--text-faint)', fontSize: 11 }} className="mono">
                    Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit form */}
            <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 24, padding: 32, position: 'relative' }}>
              <div className="ticks tl" /><div className="ticks tr" /><div className="ticks bl" /><div className="ticks br" />

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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

                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, paddingBottom: 10, borderBottom: '1px dashed var(--line)' }}>
                    Change password <span style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 400 }}>(leave blank to keep current)</span>
                  </div>
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
                  style={{ padding: '14px 32px', borderRadius: 12, fontSize: 14, fontWeight: 700, opacity: saving ? 0.7 : 1, alignSelf: 'flex-start' }}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {snack && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '12px 20px', background: snackOk ? 'var(--lime)' : 'var(--magenta)', color: '#0A0B0F', borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>
          {snack}
        </div>
      )}
    </div>
  );
};

export default MemberProfile;
