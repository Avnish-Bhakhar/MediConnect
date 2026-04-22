import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/doctors');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const fillDemo = (role: string) => {
    if (role === 'patient') setForm({ email: 'patient@mediconnect.com', password: 'patient123' });
    if (role === 'admin') setForm({ email: 'admin@mediconnect.com', password: 'admin123' });
    if (role === 'doctor') setForm({ email: 'sharma@mediconnect.com', password: 'doctor123' });
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual__content animate-fade-in">
          <div className="auth-visual__icon animate-heartbeat">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <h2>Welcome Back!</h2>
          <p>Your health journey continues here. Access appointments, records, and more.</p>
          <div className="auth-visual__features">
            {['Verified Doctors', 'Real-time Booking', 'Secure & Private'].map(f => (
              <div key={f} className="auth-visual__feature"><span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>{f}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-container animate-fade-in">
          <div className="auth-form__header">
            <Link to="/" className="auth-form__back">← Back</Link>
            <h1>Sign In</h1>
            <p>Access your MediConnect account</p>
          </div>
          <div className="auth-demo-btns">
            <span>Demo:</span>
            {['patient', 'doctor'].map(r => (
              <button key={r} type="button" className="btn btn-outline btn-sm" onClick={() => fillDemo(r)}>{r}</button>
            ))}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            {error && <div className="auth-error animate-fade-in">{error}</div>}
            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
          <p className="auth-form__switch">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
