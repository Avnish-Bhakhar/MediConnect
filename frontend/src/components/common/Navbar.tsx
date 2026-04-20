import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

useEffect(() => {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}, [dark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };
  const unread = notifications.length;

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container">
        <Link to="/" className="navbar__brand">
          <div className="navbar__logo">
            <span className="navbar__logo-icon">⚕</span>
          </div>
          <span className="navbar__brand-text">Medi<span>Connect</span></span>
        </Link>

        <div className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          <Link to="/doctors" className={`navbar__link ${location.pathname === '/doctors' ? 'active' : ''}`}>Find Doctors</Link>
          {user?.role === 'patient' && (
            <Link to="/appointments" className={`navbar__link ${location.pathname === '/appointments' ? 'active' : ''}`}>My Appointments</Link>
          )}
          {user?.role === 'doctor' && (
            <Link to="/doctor/dashboard" className={`navbar__link ${location.pathname.includes('/doctor') ? 'active' : ''}`}>Dashboard</Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className={`navbar__link ${location.pathname.includes('/admin') ? 'active' : ''}`}>Admin</Link>
          )}
        </div>

        <div className="navbar__actions">
          {user ? (
            <>
              <button className="navbar__notif-btn" onClick={() => setShowNotif(!showNotif)}>
                🔔
                {unread > 0 && <span className="navbar__badge">{unread}</span>}
              </button>
              {showNotif && (
                <div className="navbar__notif-dropdown animate-slide-down">
                  <div className="navbar__notif-header">
                    <span>Notifications</span>
                    <span className="navbar__notif-count">{unread}</span>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="navbar__notif-empty">No notifications</p>
                  ) : (
                    notifications.slice(0, 5).map(n => (
                      <div key={n.id} className={`navbar__notif-item navbar__notif-item--${n.type}`}>
                        <p>{n.message}</p>
                        <span>{new Date(n.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
              <div className="navbar__user">
                <div className="navbar__avatar">{user.name.charAt(0).toUpperCase()}</div>
                <span className="navbar__username">{user.name.split(' ')[0]}</span>
                <button
  onClick={() => setDark(!dark)}
  style={{
    background: 'none', border: '2px solid var(--gray-200)',
    borderRadius: '999px', cursor: 'pointer', padding: '0.35rem 0.75rem',
    fontSize: '1rem', transition: 'var(--transition)', color: 'var(--gray-700)'
  }}>
  {dark ? '☀️' : '🌙'}
</button>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
          <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
