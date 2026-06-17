import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const ResetPassword: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || '/api'}/auth/reset-password/${token}`, { password });
            setMessage(response.data.message || 'Password successfully reset.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-visual">
                <div className="auth-visual__content animate-fade-in">
                    <h2>New Password</h2>
                    <p>Please enter your new password below. Make sure it's strong and secure.</p>
                </div>
            </div>
            <div className="auth-form-side">
                <div className="auth-form-container animate-fade-in">
                    <div className="auth-form__header">
                        <h1>Set New Password</h1>
                        <p>Enter your new credentials</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        {message && <div className="auth-success animate-fade-in">{message} Redirecting to login...</div>}
                        {error && <div className="auth-error animate-fade-in">{error}</div>}
                        <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Password →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
