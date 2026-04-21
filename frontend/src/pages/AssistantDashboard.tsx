import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Appointment } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Appointments.css';

const AssistantDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments/all');
      setAppointments(res.data.appointments || []);
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (!confirm(`Are you sure you want to mark this appointment as ${status}?`)) return;
    try {
      await api.put(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="appointments-page">
      <div className="appointments-hero">
        <div className="container">
          <h1 className="animate-fade-in">Assistant Dashboard</h1>
          <p>Manage and approve all platform appointments</p>
        </div>
      </div>
      <div className="container" style={{ marginTop: '2rem' }}>
        {loading ? <LoadingSpinner text="Loading appointments..." /> : appointments.length === 0 ? (
          <div className="appt-empty">
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem', color: 'var(--gray-400)' }}>No Data</span>
            <h3>No appointments to manage</h3>
          </div>
        ) : (
          <div className="appt-list">
            {appointments.map((appt, i) => (
              <div key={appt._id} className="appt-card animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="appt-card__left">
                  <div className="appt-card__avatar">
                    {appt.patient?.name?.charAt(0) || 'P'}
                  </div>
                  <div className="appt-card__info">
                    <h3>Patient: {appt.patient?.name}</h3>
                    <p className="appt-card__spec">Doctor: {appt.doctor?.user?.name}</p>
                    <div className="appt-card__meta">
                      <span>Date: {new Date(appt.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--primary)', background: 'var(--primary-light)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Time: {appt.timeSlot}</span>
                    </div>
                  </div>
                </div>
                <div className="appt-card__right" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className={`badge badge-${appt.status === 'pending' ? 'warning' : appt.status === 'confirmed' ? 'info' : appt.status === 'completed' ? 'success' : 'danger'}`}>
                    {appt.status.toUpperCase()}
                  </span>
                  {appt.status === 'pending' && (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => updateStatus(appt._id, 'confirmed')}>Approve</button>
                      <button className="btn btn-danger btn-sm" onClick={() => updateStatus(appt._id, 'cancelled')}>Deny</button>
                    </>
                  )}
                  {appt.status === 'confirmed' && (
                    <button className="btn btn-danger btn-sm" onClick={() => updateStatus(appt._id, 'cancelled')}>Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantDashboard;
