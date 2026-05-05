import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { memberAPI } from '../services/api';

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

const field = (label: string, name: keyof FormData, type: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, required: boolean, helperText?: string) => (
  <div key={name}>
    <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 6, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
      onFocus={e => (e.target.style.borderColor = 'var(--lime)')}
      onBlur={e => (e.target.style.borderColor = 'var(--line)')}
    />
    {helperText && <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>{helperText}</p>}
  </div>
);

const MemberForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({ first_name: '', last_name: '', email: '', password: '' });

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    memberAPI.getById(id)
      .then(data => setFormData({ first_name: data.first_name || '', last_name: data.last_name || '', email: data.email || '', password: '' }))
      .catch(() => setError('Failed to load member'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEdit && !formData.password) { setError('Password is required for new members'); return; }
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await memberAPI.update(id, formData);
      } else {
        await memberAPI.create(formData);
      }
      navigate('/admin/members');
    } catch (err: any) {
      setError(err.message || 'Failed to save member');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <span style={{ color: 'var(--text-faint)', fontSize: 14 }}>Loading member…</span>
      </div>
    );
  }

  return (
    <div style={{ color: 'var(--text)', maxWidth: 560, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 8 }}>
          ADMIN / MEMBERS / {isEdit ? 'EDIT' : 'NEW'}
        </div>
        <h2 className="display" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>
          {isEdit ? 'Edit member' : 'Add new member'}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 6 }}>
          {isEdit ? 'Update member details. Leave password blank to keep current.' : 'Create a new member profile and access credentials.'}
        </p>
      </div>

      {/* Form card */}
      <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 24, padding: 36, position: 'relative' }}>
        <div className="ticks tl" /><div className="ticks tr" /><div className="ticks bl" /><div className="ticks br" />

        {error && (
          <div style={{ background: 'rgba(255,61,127,0.1)', border: '1px solid rgba(255,61,127,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: 'var(--magenta)', fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {field('First name', 'first_name', 'text', formData.first_name, handleChange, true)}
            {field('Last name', 'last_name', 'text', formData.last_name, handleChange, true)}
          </div>
          {field('Email address', 'email', 'email', formData.email, handleChange, true)}
          {field(
            isEdit ? 'New password (optional)' : 'Password',
            'password', 'password', formData.password, handleChange, !isEdit,
            isEdit ? 'Leave blank to keep the current password.' : 'Minimum 6 characters.'
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              className="btn-ghost"
              style={{ flex: 1, padding: '13px', borderRadius: 10, fontSize: 13 }}
              onClick={() => navigate('/admin/members')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
              style={{ flex: 2, padding: '13px', borderRadius: 10, fontSize: 13, opacity: saving ? 0.7 : 1 }}
            >
              {saving ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save changes' : 'Create member')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;
