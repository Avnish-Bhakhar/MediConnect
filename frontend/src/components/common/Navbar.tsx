import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import './Navbar.css';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
);
const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
);
const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
);

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
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
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
          {user?.role === 'assistant' && (
            <Link to="/assistant/dashboard" className={`navbar__link ${location.pathname.includes('/assistant') ? 'active' : ''}`}>Dashboard</Link>
          )}
        </div>

        <div className="navbar__actions">
          <button className="navbar__theme-btn" onClick={() => setDark(!dark)} title="Toggle dark mode">
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          {user ? (
            <>
              <button className="navbar__notif-btn" onClick={() => setShowNotif(!showNotif)}>
                <BellIcon />
                {unread > 0 && <span className="navbar__badge">{unread}</span>}
              </button>
              {showNotif && (
                <div className="navbar__notif-dropdown animate-slide-down">
                  <div className="navbar__notif-header">
                    <span>Notifications</span>
                    <span className="navbar__notif-count">{unread}</span>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="navbar__notif-empty">No notifications yet</p>
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
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
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
