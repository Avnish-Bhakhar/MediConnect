import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Appointment } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Appointments.css';

const statusColors: Record<string, string> = {
  pending: 'badge-warning', confirmed: 'badge-info',
  completed: 'badge-success', cancelled: 'badge-danger'
};

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchAppointments(); }, [filter, page]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '8' });
      if (filter) params.set('status', filter);
      const res = await api.get(`/appointments/my?${params}`);
      setAppointments(res.data.appointments || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } finally { setLoading(false); }
  };

  const cancelAppointment = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await api.put(`/appointments/${id}/status`, { status: 'cancelled' });
      fetchAppointments();
    } catch (e) { alert('Cancel failed'); }
  };

  return (
    <div className="appointments-page">
      <div className="appointments-hero">
        <div className="container">
          <h1 className="animate-fade-in">My <span className="gradient-text">Appointments</span></h1>
          <p>Track and manage all your healthcare appointments</p>
        </div>
      </div>
      <div className="container">
        <div className="appt-filters animate-slide-down">
          {['', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
            <button key={s} className={`spec-filter__btn ${filter === s ? 'active' : ''}`}
              onClick={() => { setFilter(s); setPage(1); }}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        {loading ? <LoadingSpinner text="Loading appointments..." /> : appointments.length === 0 ? (
          <div className="appt-empty">
            <span>📋</span>
            <h3>No appointments found</h3>
            <p>Book your first appointment with a doctor</p>
            <a href="/doctors" className="btn btn-primary" style={{ textDecoration: 'none', marginTop: '1rem' }}>Find Doctors</a>
          </div>
        ) : (
          <div className="appt-list">
            {appointments.map((appt, i) => (
              <div key={appt._id} className="appt-card animate-fade-in" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="appt-card__left">
                  <div className="appt-card__avatar">
                    {appt.doctor?.user?.name?.charAt(0) || 'D'}
                  </div>
                  <div className="appt-card__info">
                    <h3>{appt.doctor?.user?.name}</h3>
                    <p className="appt-card__spec">{appt.doctor?.specialization}</p>
                    <div className="appt-card__meta">
                      <span>📅 {new Date(appt.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>🕐 {appt.timeSlot}</span>
                      <span>💰 ₹{appt.fee}</span>
                    </div>
                    {appt.symptoms && <p className="appt-card__symptoms">🩺 {appt.symptoms}</p>}
                    {appt.prescription && (
                      <div className="appt-card__prescription">
                        <strong>📋 Prescription:</strong> {appt.prescription}
                      </div>
                    )}
                  </div>
                </div>
                <div className="appt-card__right">
                  <span className={`badge ${statusColors[appt.status]}`}>
                    {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                  </span>
                  {(appt.status === 'pending' || appt.status === 'confirmed') && (
                    <button className="btn btn-danger btn-sm" onClick={() => cancelAppointment(appt._id)}>Cancel</button>
                  )}
                </div>
              </div>
            ))}
            {pages > 1 && (
              <div className="pagination">
                <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span style={{ padding: '0 1rem', color: 'var(--gray-600)', fontSize: '0.875rem' }}>Page {page} of {pages}</span>
                <button className="btn btn-outline btn-sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
