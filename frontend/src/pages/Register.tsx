import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form);
      navigate(form.role === 'doctor' ? '/doctor/setup' : '/doctors');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual__content animate-fade-in">
          <div className="auth-visual__icon animate-heartbeat">⚕</div>
          <h2>Join MediConnect</h2>
          <p>Create your account and connect with India's best healthcare professionals today.</p>
          <div className="auth-visual__features">
            {['Free to join', 'Instant access', 'Trusted by 10,000+ users'].map(f => (
              <div key={f} className="auth-visual__feature"><span>✓</span>{f}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-container animate-fade-in">
          <div className="auth-form__header">
            <Link to="/" className="auth-form__back">← Back</Link>
            <h1>Create Account</h1>
            <p>Start your health journey today</p>
          </div>
          <div className="auth-role-picker">
            {['patient', 'doctor'].map(r => (
              <button key={r} type="button"
                className={`auth-role-btn ${form.role === r ? 'active' : ''}`}
                onClick={() => setForm({...form, role: r})}>
                {r === 'patient' ? '👤' : '👨‍⚕️'} {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Dr. John Smith"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone (optional)</label>
              <input className="form-input" placeholder="+91 9876543210"
                value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="Min 6 characters"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            {error && <div className="auth-error animate-fade-in">{error}</div>}
            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? '⏳ Creating account...' : 'Create Account →'}
            </button>
          </form>
          <p className="auth-form__switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
