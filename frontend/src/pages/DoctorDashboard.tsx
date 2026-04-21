import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Appointment } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ChatModal from '../components/chat/ChatModal';
import './DoctorDashboard.css';

const statusColors: Record<string, string> = {
  pending: 'badge-warning', confirmed: 'badge-info',
  completed: 'badge-success', cancelled: 'badge-danger'
};

const DoctorDashboard: React.FC = () => {
  const { user, doctorProfile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0 });
  const [updating, setUpdating] = useState<string | null>(null);
  const [prescription, setPrescription] = useState<Record<string, string>>({});
  const [chatUser, setChatUser] = useState<{ id: string, name: string, appointmentId: string } | null>(null);

  useEffect(() => { fetchAppointments(); }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '20' });
      if (filter) params.set('status', filter);
      const res = await api.get(`/appointments/doctor?${params}`);
      const appts: Appointment[] = res.data.appointments || [];
      setAppointments(appts);
      setStats({
        total: res.data.total || 0,
        pending: appts.filter(a => a.status === 'pending').length,
        confirmed: appts.filter(a => a.status === 'confirmed').length,
        completed: appts.filter(a => a.status === 'completed').length,
      });
    } finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await api.put(`/appointments/${id}/status`, { status, prescription: prescription[id] || undefined });
      fetchAppointments();
    } catch (e) { alert('Update failed'); }
    finally { setUpdating(null); }
  };

  if (!doctorProfile && !loading) {
    return (
      <div style={{ paddingTop: 70, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: 72, height: 72, borderRadius: 16, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
        <h2 style={{ color: 'var(--gray-800)' }}>Complete Your Doctor Profile</h2>
        <p style={{ color: 'var(--gray-500)' }}>Set up your profile to start receiving appointments</p>
        <a href="/doctor/setup" className="btn btn-primary" style={{ textDecoration: 'none' }}>Setup Profile →</a>
      </div>
    );
  }

  return (
    <div className="doctor-dashboard">
      <div className="dashboard-hero">
        <div className="container">
          <div className="dashboard-hero__content animate-fade-in">
            <div className="dashboard-hero__avatar">{user?.name?.charAt(0)}</div>
            <div>
              <h1>Welcome, {user?.name?.split(' ')[0]}!</h1>
              <p>{doctorProfile?.specialization} · {doctorProfile?.city}</p>
              {doctorProfile && !doctorProfile.isApproved && (
                <div className="dashboard-pending-badge">Profile pending admin approval</div>
              )}
            </div>
          </div>
          <div className="dashboard-stats animate-fade-in">
            {[
              { label: 'Total', value: stats.total, color: 'var(--primary)', icon: 'Total' },
              { label: 'Pending', value: stats.pending, color: 'var(--warning)', icon: 'Wait' },
              { label: 'Confirmed', value: stats.confirmed, color: 'var(--secondary)', icon: 'Ok' },
              { label: 'Completed', value: stats.completed, color: 'var(--success)', icon: 'Done' },
            ].map(s => (
              <div key={s.label} className="dash-stat">
                <span className="dash-stat__icon">{s.icon}</span>
                <span className="dash-stat__value" style={{ color: s.color }}>{s.value}</span>
                <span className="dash-stat__label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-filters animate-slide-down">
          <h2 style={{ fontWeight: 700, color: 'var(--gray-800)' }}>Appointments</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
              <button key={s} className={`spec-filter__btn ${filter === s ? 'active' : ''}`}
                onClick={() => setFilter(s)}>
                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? <LoadingSpinner text="Loading appointments..." /> : appointments.length === 0 ? (
          <div className="appt-empty"><span style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem', color: 'var(--gray-400)' }}>No Data</span><h3>No appointments yet</h3><p>Appointments will appear here once patients book with you</p></div>
        ) : (
          <div className="doctor-appt-list">
            {appointments.map((appt, i) => (
              <div key={appt._id} className="doctor-appt-card animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="doctor-appt-card__patient">
                  <div className="doctor-appt-card__avatar">{appt.patient?.name?.charAt(0)}</div>
                  <div>
                    <h3>{appt.patient?.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{appt.patient?.email}</p>
                    {appt.patient?.phone && <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Phone: {appt.patient.phone}</p>}
                  </div>
                </div>
                <div className="doctor-appt-card__details">
                  <div className="doctor-appt-card__time">
                    <span>Date: {new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--primary)', background: 'var(--primary-light)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Time: {appt.timeSlot}</span>
                  </div>
                  {appt.symptoms && <p className="doctor-appt-card__symptoms">Symptoms: {appt.symptoms}</p>}
                </div>
                <div className="doctor-appt-card__fee">₹{appt.fee}</div>
                <div className="doctor-appt-card__actions">
                  <span className={`badge ${statusColors[appt.status]}`}>{appt.status}</span>
                  {appt.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-success btn-sm" disabled={updating === appt._id}
                        onClick={() => updateStatus(appt._id, 'confirmed')}>Confirm</button>
                      <button className="btn btn-danger btn-sm" disabled={updating === appt._id}
                        onClick={() => updateStatus(appt._id, 'cancelled')}>Cancel</button>
                    </div>
                  )}
                  {appt.status === 'confirmed' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <input className="form-input" style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                        placeholder="Add prescription..." value={prescription[appt._id] || ''}
                        onChange={e => setPrescription({ ...prescription, [appt._id]: e.target.value })} />
                      <button className="btn btn-primary btn-sm" disabled={updating === appt._id}
                        onClick={() => updateStatus(appt._id, 'completed')}>
                        {updating === appt._id ? 'Saving...' : 'Complete'}
                      </button>
                      <button className="btn btn-secondary btn-sm" style={{ background: 'var(--secondary)', color: 'white', border: 'none' }}
                        onClick={() => setChatUser({ id: appt.patient._id, name: appt.patient.name, appointmentId: appt._id })}>
                        Chat
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {chatUser && (
        <ChatModal 
          receiverId={chatUser.id} 
          receiverName={chatUser.name} 
          appointmentId={chatUser.appointmentId}
          onClose={() => setChatUser(null)} 
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
