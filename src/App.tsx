import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MembersList from './components/MembersList';
import MemberForm from './components/MemberForm';
import LoginForm from './components/LoginForm';
import AdminLoginForm from './components/AdminLoginForm';
import RegisterForm from './components/RegisterForm';
import MemberDashboard from './components/MemberDashboard';
import MembershipForm from './components/MembershipForm';
import { useAuth } from './context/AuthContext';
import AdminLayout from './layout/AdminLayout';
import MemberLayout from './layout/MemberLayout';
import Overview from './pages/admin/Overview';
import Payments from './pages/admin/Payments';
import Attendance from './pages/admin/Attendance';
import Classes from './pages/admin/Classes';
import Trainers from './pages/admin/Trainers';
import Equipment from './pages/admin/Equipment';
import CRM from './pages/admin/CRM';
import Staff from './pages/admin/Staff';
import Reports from './pages/admin/Reports';
import Branches from './pages/admin/Branches';
import Memberships from './pages/admin/Memberships';
import AdminProfile from './pages/admin/Profile';
import MemberProfile from './pages/member/Profile';

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'admin' | 'member' }) => {
  const { isAuthenticated, userType } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (requiredRole && userType !== requiredRole) {
    return <Navigate to={userType === 'admin' ? '/admin/dashboard' : '/member/dashboard'} />;
  }
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, userType } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={userType === 'admin' ? '/admin/dashboard' : '/member/dashboard'} />;
  }
  return <>{children}</>;
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#D4FF3D',
      dark: '#A8CC2E',
      contrastText: '#0A0B0F',
    },
    secondary: {
      main: '#FF3D7F',
      dark: '#CC2E63',
      contrastText: '#0A0B0F',
    },
    info: {
      main: '#4DE3D5',
    },
    warning: {
      main: '#FFB23D',
    },
    background: {
      default: '#0A0B0F',
      paper: '#14161C',
    },
    text: {
      primary: '#F5F1E8',
      secondary: 'rgba(245,241,232,0.62)',
    },
    divider: 'rgba(255,255,255,0.08)',
    action: {
      hover: 'rgba(255,255,255,0.06)',
      selected: 'rgba(212,255,61,0.12)',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Space Grotesk', sans-serif",
    h1: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: '-0.03em' },
    h2: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: '-0.03em' },
    h3: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: '-0.02em' },
    h4: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0em' },
    caption: { fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { background: '#0A0B0F', color: '#F5F1E8' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#14161C',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, fontWeight: 600 },
        containedPrimary: {
          background: '#D4FF3D',
          color: '#0A0B0F',
          '&:hover': {
            background: '#c4ef2d',
            boxShadow: '0 8px 30px rgba(212,255,61,0.35)',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(212,255,61,0.4)',
          color: '#D4FF3D',
          '&:hover': { background: 'rgba(212,255,61,0.08)', borderColor: '#D4FF3D' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 10,
            '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.24)' },
            '&.Mui-focused fieldset': { borderColor: '#D4FF3D' },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#D4FF3D' },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          background: '#0A0B0F',
          color: 'rgba(245,241,232,0.38)',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          fontWeight: 600,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        },
        root: {
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          color: '#F5F1E8',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { background: 'rgba(255,255,255,0.03)' },
          '&:last-child td': { borderBottom: 'none' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { background: '#14161C', backgroundImage: 'none' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { background: '#0A0B0F', borderRight: '1px solid rgba(255,255,255,0.08)' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { background: 'rgba(10,11,15,0.85)', backdropFilter: 'blur(12px)', boxShadow: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
        colorPrimary: { background: 'rgba(212,255,61,0.12)', color: '#D4FF3D', border: '1px solid rgba(212,255,61,0.3)' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { background: 'rgba(255,255,255,0.06)', borderRadius: 999 },
        bar: { borderRadius: 999 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { background: '#14161C', border: '1px solid rgba(255,255,255,0.08)' },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.12)' },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
  },
});

const AppContent = () => {
  const { isAuthenticated, userType } = useAuth();

  return (
    <Routes>
      <Route path="/admin/login" element={<PublicRoute><AdminLoginForm /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginForm /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterForm /></PublicRoute>} />

      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Overview />} />
        <Route path="members" element={<MembersList />} />
        <Route path="members/new" element={<MemberForm />} />
        <Route path="members/:id" element={<MemberForm />} />
        <Route path="memberships" element={<Memberships />} />
        <Route path="memberships/new" element={<MembershipForm />} />
        <Route path="memberships/:memberId" element={<MembershipForm />} />
        <Route path="payments" element={<Payments />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="classes" element={<Classes />} />
        <Route path="trainers" element={<Trainers />} />
        <Route path="equipment" element={<Equipment />} />
        <Route path="crm" element={<CRM />} />
        <Route path="staff" element={<Staff />} />
        <Route path="reports" element={<Reports />} />
        <Route path="branches" element={<Branches />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      <Route path="/member" element={<ProtectedRoute requiredRole="member"><MemberLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<MemberDashboard />} />
        <Route path="profile" element={<MemberProfile />} />
      </Route>

      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to={userType === 'admin' ? '/admin/dashboard' : '/member/dashboard'} />
            : <Navigate to="/login" />
        }
      />
      <Route
        path="*"
        element={
          isAuthenticated
            ? <Navigate to={userType === 'admin' ? '/admin/dashboard' : '/member/dashboard'} />
            : <Navigate to="/login" />
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
