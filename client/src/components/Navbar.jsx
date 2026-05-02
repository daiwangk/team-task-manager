import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'navbar-link active' : 'navbar-link';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">⚡ TaskFlow</Link>

        <div className="navbar-links">
          <Link to="/" className={isActive('/')}>Dashboard</Link>
          <Link to="/projects" className={isActive('/projects')}>Projects</Link>
        </div>

        <div className="navbar-user">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user?.name}</span>
          <div className="navbar-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
