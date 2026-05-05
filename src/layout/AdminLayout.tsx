import React, { useMemo, useState } from 'react';
import { Box, Drawer, useMediaQuery } from '@mui/material';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AtlasLogo from '../components/AtlasLogo';

const drawerWidth = 240;

const NAV_ITEMS = [
  { label: 'Overview', to: '/admin/dashboard', badge: null, path: 'M3 12h4l3-9 4 18 3-9h4' },
  { label: 'Members', to: '/admin/members', badge: null, path: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
  { label: 'Memberships', to: '/admin/memberships', badge: null, path: 'M2 7h20v10H2z M8 11h8 M8 14h5' },
  { label: 'Payments', to: '/admin/payments', badge: 'pending', path: 'M2 8h20v10H2z M2 12h20 M6 16h2' },
  { label: 'Attendance', to: '/admin/attendance', badge: null, path: 'M3 4h18v18H3z M3 10h18 M8 4v6 M16 4v6' },
  { label: 'Classes', to: '/admin/classes', badge: null, path: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z' },
  { label: 'Trainers', to: '/admin/trainers', badge: null, path: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8' },
  { label: 'Equipment', to: '/admin/equipment', badge: null, path: 'M6 6h12v12H6z M2 10h4 M18 10h4 M2 14h4 M18 14h4' },
  { label: 'CRM', to: '/admin/crm', badge: null, path: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
  { label: 'Staff', to: '/admin/staff', badge: null, path: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
  { label: 'Reports', to: '/admin/reports', badge: null, path: 'M3 3v18h18 M7 14l4-4 4 4 5-5' },
  { label: 'Branches', to: '/admin/branches', badge: null, path: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
  { label: 'Profile', to: '/admin/profile', badge: null, path: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M3 21v-1a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v1' },
];

const SidebarContent: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { language, setLanguage } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px 16px', background: 'var(--ink)' }}>
      {/* Logo */}
      <div style={{ padding: '0 8px', marginBottom: 22 }}>
        <Link to="/admin/dashboard" style={{ textDecoration: 'none', display: 'block' }}>
          <AtlasLogo size={28} accent wordmark wordmarkSize={13} color="var(--lime)" />
        </Link>
        <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 6, paddingLeft: 2 }} className="mono">3 branches · live</div>
      </div>

      {/* Search */}
      <div style={{ padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-dim)', marginBottom: 22, cursor: 'pointer' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" /></svg>
        Search anything
        <span style={{ marginLeft: 'auto', padding: '2px 6px', border: '1px solid var(--line)', borderRadius: 4, fontSize: 10 }} className="mono">⌘K</span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflow: 'auto' }}>
        <div className="tracking" style={{ fontSize: 9, color: 'var(--text-faint)', padding: '4px 14px 8px' }}>WORKSPACE</div>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              style={{ textDecoration: 'none' }}
            >
              <div className={`nav-item${active ? ' active' : ''}`}>
                <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {item.path.split(' M').map((p, i) => (
                    <path key={i} d={i === 0 ? p : `M${p}`} />
                  ))}
                </svg>
                <span style={{ fontSize: 13 }}>{item.label}</span>
                {item.badge === 'pending' && (
                  <span style={{ marginLeft: 'auto', fontSize: 10, padding: '1px 6px', background: 'var(--magenta)', color: '#0A0B0F', borderRadius: 4 }} className="mono">!</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Branch focus + controls */}
      <div style={{ marginTop: 16, padding: 14, background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 14 }}>
        <div className="tracking" style={{ fontSize: 10, color: 'var(--text-faint)' }}>BRANCH FOCUS</div>
        <div style={{ marginTop: 6, fontSize: 14, fontWeight: 600 }}>All Branches</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <span className="pulse-dot" />
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }} className="mono">live · all locations</span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
          <button
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="btn-ghost"
            style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, flex: 1 }}
          >
            {language.toUpperCase()} ⇅
          </button>
          <button
            onClick={handleLogout}
            className="btn-ghost"
            style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, flex: 1, borderColor: 'rgba(255,61,127,0.3)', color: 'var(--magenta)' }}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:900px)');
  const location = useLocation();
  const navigate = useNavigate();
  const adminName = localStorage.getItem('userName') || 'Admin';
  const adminInitials = adminName.split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'AD';

  const pageTitle = useMemo(() => {
    const item = NAV_ITEMS.find(n => location.pathname === n.to || location.pathname.startsWith(`${n.to}/`));
    return item?.label || 'Dashboard';
  }, [location.pathname]);

  return (
    <Box sx={{ display: 'flex', background: 'var(--ink)', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { width: drawerWidth, background: 'var(--ink)', borderRight: '1px solid var(--line)' } }}
          >
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{ '& .MuiDrawer-paper': { width: drawerWidth, background: 'var(--ink)', borderRight: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' } }}
            open
          >
            <SidebarContent />
          </Drawer>
        )}
      </Box>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 32px', borderBottom: '1px solid var(--line)',
          position: 'sticky', top: 0, background: 'rgba(10,11,15,0.85)',
          backdropFilter: 'blur(12px)', zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13 }}>
            {isMobile && (
              <button
                onClick={() => setMobileOpen(true)}
                style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 4, marginRight: 8 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
            <span style={{ color: 'var(--text-faint)' }}>Workspace</span>
            <span style={{ color: 'var(--text-faint)' }}>/</span>
            <span>{pageTitle}</span>
            <span style={{ marginLeft: 14, padding: '3px 10px', background: 'var(--ink-3)', border: '1px solid var(--line)', borderRadius: 6, fontSize: 10, color: 'var(--lime)' }} className="tracking">LIVE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--ink-2)', borderRadius: 999, border: '1px solid var(--line)' }}>
              {['Today', 'Week', 'Month'].map((x, i) => (
                <button key={x} style={{ padding: '5px 10px', borderRadius: 999, background: i === 0 ? 'var(--lime)' : 'transparent', color: i === 0 ? '#0A0B0F' : 'var(--text-dim)', border: 'none', fontSize: 10, fontWeight: 600, cursor: 'pointer' }} className="tracking">{x}</button>
              ))}
            </div>
            <button style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--ink-2)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /></svg>
            </button>
            <div onClick={() => navigate('/admin/profile')} title={adminName} style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--magenta), var(--lime))', display: 'grid', placeItems: 'center', color: '#0A0B0F', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>{adminInitials}</div>
          </div>
        </header>

        {/* Page content */}
        <Box sx={{ flex: 1, p: { xs: 3, md: 4 }, overflowY: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
