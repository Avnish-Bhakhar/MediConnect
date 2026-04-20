import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Doctor } from '../types';
import './DoctorDetail.css';

const DoctorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ date: '', timeSlot: '', symptoms: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  useEffect(() => {
    api.get(`/doctors/${id}`).then(res => setDoctor(res.data.doctor)).finally(() => setLoading(false));
  }, [id]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSubmitting(true); setError(''); setSuccess('');
    try {
      await api.post('/appointments', { doctorId: id, ...booking });
      setSuccess('🎉 Appointment booked successfully! You will receive a confirmation shortly.');
      setBooking({ date: '', timeSlot: '', symptoms: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally { setSubmitting(false); }
  };

  const getAvailableSlots = () => {
    if (!doctor || !selectedDay) return [];
    const dayAvail = doctor.availability?.find(a => a.day === selectedDay);
    return dayAvail?.slots?.filter(s => !s.isBooked) || [];
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading doctor profile..." />;
  if (!doctor) return <div style={{ padding: '5rem', textAlign: 'center' }}>Doctor not found</div>;

  const stars = Math.round(Number(doctor.rating));

  return (
    <div className="doctor-detail">
      <div className="doctor-detail__hero">
        <div className="container">
          <div className="doctor-detail__profile animate-fade-in">
            <div className="doctor-detail__avatar">{doctor.user?.name?.charAt(0)}</div>
            <div className="doctor-detail__info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <h1>{doctor.user?.name}</h1>
                <span className="badge badge-success">✓ Verified</span>
              </div>
              <p className="doctor-detail__spec">{doctor.specialization} · {doctor.qualification}</p>
              <div className="doctor-detail__meta">
                <span>📍 {doctor.city}</span>
                <span>🏥 {doctor.experience} yrs experience</span>
                <span>💰 ₹{doctor.consultationFee} consultation</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="stars">{[1,2,3,4,5].map(s => <span key={s} className={`star ${s <= stars ? '' : 'star-empty'}`}>★</span>)}</div>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>{doctor.rating} ({doctor.totalRatings} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="doctor-detail__body">
          <div className="doctor-detail__left animate-fade-in-left">
            {doctor.bio && (
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--gray-800)', fontWeight: 700 }}>About</h3>
                <p style={{ color: 'var(--gray-600)', lineHeight: 1.7 }}>{doctor.bio}</p>
              </div>
            )}
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--gray-800)', fontWeight: 700 }}>Available Days</h3>
              <div className="availability-grid">
                {doctor.availability?.map(a => (
                  <div key={a.day} className="avail-day">
                    <span className="avail-day__name">{a.day.slice(0, 3)}</span>
                    <span className="avail-day__count">{a.slots?.filter(s => !s.isBooked).length} slots</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="doctor-detail__right animate-fade-in-right">
            <div className="booking-card">
              <div className="booking-card__header">
                <h2>📅 Book Appointment</h2>
                <p>Fill in details to schedule your visit</p>
              </div>
              {success && <div className="booking-success">{success}</div>}
              {error && <div className="auth-error">{error}</div>}
              <form onSubmit={handleBook}>
                <div className="form-group">
                  <label className="form-label">Select Date</label>
                  <input type="date" className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                    value={booking.date}
                    onChange={e => {
                      const d = new Date(e.target.value);
                      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
                      setSelectedDay(dayName);
                      setBooking({...booking, date: e.target.value, timeSlot: ''});
                    }} required />
                </div>
                {selectedDay && (
                  <div className="form-group">
                    <label className="form-label">Time Slot — {selectedDay}</label>
                    <div className="slots-grid">
                      {getAvailableSlots().length === 0 ? (
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>No slots available for this day</p>
                      ) : (
                        getAvailableSlots().map(slot => (
                          <button key={slot.time} type="button"
                            className={`slot-btn ${booking.timeSlot === slot.time ? 'active' : ''}`}
                            onClick={() => setBooking({...booking, timeSlot: slot.time})}>
                            {slot.time}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Symptoms / Reason (optional)</label>
                  <textarea className="form-input" rows={3} placeholder="Describe your symptoms..."
                    style={{ resize: 'vertical' }}
                    value={booking.symptoms} onChange={e => setBooking({...booking, symptoms: e.target.value})} />
                </div>
                <div className="booking-fee">
                  <span>Consultation Fee</span>
                  <span className="booking-fee__amount">₹{doctor.consultationFee}</span>
                </div>
                <button type="submit" className="btn btn-primary w-full btn-lg"
                  disabled={submitting || !booking.date || !booking.timeSlot}>
                  {submitting ? '⏳ Booking...' : user ? '✅ Confirm Appointment' : '🔒 Login to Book'}
                </button>
                {!user && <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '0.75rem' }}>You'll be redirected to login</p>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;
