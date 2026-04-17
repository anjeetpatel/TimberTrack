import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ overdueCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/inventory', icon: 'inventory_2', label: 'Inventory' },
    { to: '/customers', icon: 'groups', label: 'Customers' },
    { to: '/rentals', icon: 'receipt_long', label: 'Rentals', badge: overdueCount },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>
          <span className="material-symbols-outlined">forest</span>
          TimberTrack
        </h2>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">{link.icon}</span>
            {link.label}
            {link.badge > 0 && <span className="sidebar-badge">{link.badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-cta">
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/rentals/new')}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          New Rental
        </button>
      </div>

      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--outline-variant)', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--primary)' }}>account_circle</span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name || 'User'}</span>
          </div>
          <button onClick={handleLogout} className="btn-icon" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }} title="Logout">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
