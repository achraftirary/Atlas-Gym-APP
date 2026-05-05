import React from 'react';
import { Outlet } from 'react-router-dom';

const MemberLayout: React.FC = () => (
  <div style={{ minHeight: '100vh', background: 'var(--ink)', color: 'var(--text)' }}>
    <Outlet />
  </div>
);

export default MemberLayout;
