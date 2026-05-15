import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || '/api'}/auth/forgot-password`, { email });
            setMessage(response.data.message || 'If an account exists with that email, a password reset link has been sent.');
        } catch (err: any) {
            const msg = err.response?.data?.error || err.response?.data?.message || 'Something went wrong. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-visual">
                <div className="auth-visual__content animate-fade-in">
                    <h2>Reset Password</h2>
                    <p>Don't worry, it happens. Provide your email and we'll send you a link to reset your password.</p>
                </div>
            </div>
            <div className="auth-form-side">
                <div className="auth-form-container animate-fade-in">
                    <div className="auth-form__header">
                        <Link to="/login" className="auth-form__back">← Back to Login</Link>
                        <h1>Forgot Password</h1>
                        <p>Enter your email to receive a reset link</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        {message && <div className="auth-success animate-fade-in">{message}</div>}
                        {error && <div className="auth-error animate-fade-in">{error}</div>}
                        <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
