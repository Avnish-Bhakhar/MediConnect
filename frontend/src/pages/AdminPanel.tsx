import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './AdminPanel.css';

const AdminPanel: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [pendingDoctors, setPendingDoctors] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview' | 'doctors' | 'users' | 'appointments'>('overview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes, usersRes, apptRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/doctors/pending'),
        api.get('/admin/users'),
        api.get('/appointments/all'),
      ]);
      setStats(statsRes.data.stats);
      setPendingDoctors(pendingRes.data.doctors || []);
      setUsers(usersRes.data.users || []);
      setAppointments(apptRes.data.appointments || []);
    } finally { setLoading(false); }
  };

  const approveDoctor = async (id: string, approve: boolean) => {
    setActionLoading(id);
    try {
      await api.put(`/doctors/${id}/approve`, { isApproved: approve });
      fetchAll();
    } finally { setActionLoading(null); }
  };

  const toggleUser = async (id: string) => {
    setActionLoading(id);
    try {
      await api.put(`/admin/users/${id}/toggle`);
      fetchAll();
    } finally { setActionLoading(null); }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading admin panel..." />;

  return (
    <div className="admin-panel">
      <div className="admin-hero">
        <div className="container">
          <h1 className="animate-fade-in">⚙️ Admin <span className="gradient-text">Control Panel</span></h1>
          <p>Manage doctors, patients, and appointments</p>
        </div>
      </div>

      <div className="container">
        {/* Stats */}
        <div className="admin-stats animate-fade-in">
          {[
            { label: 'Total Patients', value: stats?.totalUsers, icon: '👤', color: 'var(--primary)' },
            { label: 'Active Doctors', value: stats?.totalDoctors, icon: '👨‍⚕️', color: 'var(--success)' },
            { label: 'Appointments', value: stats?.totalAppointments, icon: '📋', color: 'var(--secondary)' },
            { label: 'Pending Approval', value: stats?.pendingDoctors, icon: '⏳', color: 'var(--warning)' },
            { label: "Today's Appts", value: stats?.todayAppointments, icon: '📅', color: 'var(--danger)' },
          ].map(s => (
            <div key={s.label} className="admin-stat-card">
              <div className="admin-stat-card__icon" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
              <div>
                <div className="admin-stat-card__value" style={{ color: s.color }}>{s.value ?? '—'}</div>
                <div className="admin-stat-card__label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="admin-tabs animate-slide-down">
          {(['overview', 'doctors', 'users', 'appointments'] as const).map(t => (
            <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'overview' ? '📊' : t === 'doctors' ? '👨‍⚕️' : t === 'users' ? '👥' : '📋'} {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'doctors' && pendingDoctors.length > 0 && (
                <span className="admin-tab__badge">{pendingDoctors.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="admin-overview animate-fade-in">
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>⏳ Doctors Pending Approval ({pendingDoctors.length})</h3>
              {pendingDoctors.length === 0 ? <p style={{ color: 'var(--gray-500)' }}>All doctors approved ✅</p> : (
                pendingDoctors.slice(0, 5).map(d => (
                  <div key={d._id} className="pending-doctor-row">
                    <div className="pending-doctor-row__avatar">{d.user?.name?.charAt(0)}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{d.user?.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{d.specialization} · {d.city}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-success btn-sm" disabled={actionLoading === d._id}
                        onClick={() => approveDoctor(d._id, true)}>✅ Approve</button>
                      <button className="btn btn-danger btn-sm" disabled={actionLoading === d._id}
                        onClick={() => approveDoctor(d._id, false)}>❌ Reject</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Doctors */}
        {tab === 'doctors' && (
          <div className="animate-fade-in">
            <h3 style={{ padding: '1rem 0', fontWeight: 700, color: 'var(--gray-800)' }}>All Pending Doctors ({pendingDoctors.length})</h3>
            {pendingDoctors.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><p style={{ color: 'var(--gray-500)' }}>No pending doctors 🎉</p></div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Doctor</th><th>Specialization</th><th>City</th><th>Fee</th><th>Experience</th><th>Actions</th></tr></thead>
                  <tbody>
                    {pendingDoctors.map(d => (
                      <tr key={d._id}>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><div className="table-avatar">{d.user?.name?.charAt(0)}</div><div><div style={{ fontWeight: 600 }}>{d.user?.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{d.user?.email}</div></div></div></td>
                        <td><span className="badge badge-info">{d.specialization}</span></td>
                        <td>{d.city}</td>
                        <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{d.consultationFee}</td>
                        <td>{d.experience} yrs</td>
                        <td><div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn btn-success btn-sm" disabled={actionLoading === d._id} onClick={() => approveDoctor(d._id, true)}>Approve</button>
                          <button className="btn btn-danger btn-sm" disabled={actionLoading === d._id} onClick={() => approveDoctor(d._id, false)}>Reject</button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="animate-fade-in">
            <h3 style={{ padding: '1rem 0', fontWeight: 700, color: 'var(--gray-800)' }}>All Users ({users.length})</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>User</th><th>Role</th><th>Phone</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><div className="table-avatar" style={{ background: u.role === 'doctor' ? 'linear-gradient(135deg,var(--secondary),#7c3aed)' : 'linear-gradient(135deg,var(--primary),var(--primary-dark))' }}>{u.name?.charAt(0)}</div><div><div style={{ fontWeight: 600 }}>{u.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{u.email}</div></div></div></td>
                      <td><span className={`badge ${u.role === 'doctor' ? 'badge-secondary' : 'badge-info'}`}>{u.role}</span></td>
                      <td style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>{u.phone || '—'}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Blocked'}</span></td>
                      <td><button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`} disabled={actionLoading === u._id} onClick={() => toggleUser(u._id)}>{u.isActive ? 'Block' : 'Unblock'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Appointments */}
        {tab === 'appointments' && (
          <div className="animate-fade-in">
            <h3 style={{ padding: '1rem 0', fontWeight: 700, color: 'var(--gray-800)' }}>Recent Appointments ({appointments.length})</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Status</th><th>Fee</th></tr></thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a._id}>
                      <td style={{ fontWeight: 600 }}>{a.patient?.name}</td>
                      <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{a.doctor?.user?.name}</td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--gray-600)' }}>{new Date(a.date).toLocaleDateString('en-IN')} · {a.timeSlot}</td>
                      <td><span className={`badge ${a.status === 'confirmed' ? 'badge-info' : a.status === 'completed' ? 'badge-success' : a.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>{a.status}</span></td>
                      <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{a.fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
