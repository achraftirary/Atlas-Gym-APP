import React, { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../../services/api';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isPaid = status === 'Paid';
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 4, fontSize: 10, fontWeight: 600,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      background: isPaid ? 'rgba(212,255,61,0.12)' : 'rgba(255,178,61,0.12)',
      color: isPaid ? 'var(--lime)' : 'var(--warn)',
      border: `1px solid ${isPaid ? 'rgba(212,255,61,0.3)' : 'rgba(255,178,61,0.3)'}`,
    }}>
      {status}
    </span>
  );
};

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<number | null>(null);
  const [snack, setSnack] = useState('');
  const [filter, setFilter] = useState<'all' | 'Paid' | 'Pending'>('all');

  const load = useCallback(async () => {
    try {
      const data = await adminAPI.getPayments();
      setPayments(data || []);
    } catch { setSnack('Failed to load payments'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markPaid = async (id: number) => {
    setMarking(id);
    try {
      await adminAPI.markPaymentPaid(id);
      setSnack('Payment marked as paid');
      load();
    } catch (e: any) { setSnack(e.message || 'Failed'); }
    finally { setMarking(null); }
  };

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter);
  const total = payments.reduce((sum, p) => sum + parseInt(p.amount?.replace(/[^\d]/g, '') || '0'), 0);
  const paid = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + parseInt(p.amount?.replace(/[^\d]/g, '') || '0'), 0);
  const pending = payments.filter(p => p.status === 'Pending').length;

  return (
    <div style={{ color: 'var(--text)' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 8 }}>ADMIN / PAYMENTS</div>
        <h2 className="display" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>Cash desk</h2>
        <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 6 }}>All transactions, outstanding balances and collection status.</p>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { l: 'Total volume', v: `${total.toLocaleString()} MAD`, c: 'var(--lime)' },
          { l: 'Collected', v: `${paid.toLocaleString()} MAD`, c: 'var(--cyan)' },
          { l: 'Pending', v: `${pending} transaction${pending !== 1 ? 's' : ''}`, c: 'var(--warn)' },
        ].map((m, i) => (
          <div key={i} className="metric-card" style={{ padding: '20px 24px' }}>
            <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)' }}>{m.l}</div>
            <div className="display" style={{ fontSize: 28, marginTop: 8, color: m.c }}>{m.v}</div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="display" style={{ fontSize: 18 }}>Transactions</h3>
          <div style={{ display: 'flex', gap: 6, padding: 4, background: 'var(--ink)', borderRadius: 999, border: '1px solid var(--line)' }}>
            {(['all', 'Paid', 'Pending'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 12px', borderRadius: 999, background: filter === f ? 'var(--lime)' : 'transparent', color: filter === f ? '#0A0B0F' : 'var(--text-dim)', border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer' }} className="tracking">{f}</button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['#', 'Member', 'Plan', 'Amount', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, color: 'var(--text-faint)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', textTransform: 'uppercase', borderBottom: '1px solid var(--line)', background: 'var(--ink)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>Loading…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>No payments found</td></tr>
              )}
              {filtered.map((p: any) => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '14px 20px' }}><span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>#{p.id}</span></td>
                  <td style={{ padding: '14px 20px', fontWeight: 600 }}>{p.member}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-dim)' }}>{p.plan}</td>
                  <td style={{ padding: '14px 20px' }}><span className="mono" style={{ fontSize: 14, fontWeight: 600 }}>{p.amount}</span></td>
                  <td style={{ padding: '14px 20px' }}><StatusBadge status={p.status} /></td>
                  <td style={{ padding: '14px 20px' }}>
                    {p.status === 'Pending' && (
                      <button
                        onClick={() => markPaid(p.id)}
                        disabled={marking === p.id}
                        style={{ padding: '6px 14px', borderRadius: 8, background: 'var(--lime)', color: '#0A0B0F', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', opacity: marking === p.id ? 0.6 : 1 }}
                      >
                        {marking === p.id ? '…' : 'Mark paid'}
                      </button>
                    )}
                    {p.status === 'Paid' && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>✓ Done</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {snack && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '12px 20px', background: 'var(--lime)', color: '#0A0B0F', borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>
          {snack} <button onClick={() => setSnack('')} style={{ marginLeft: 10, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>×</button>
        </div>
      )}
    </div>
  );
};

export default Payments;
