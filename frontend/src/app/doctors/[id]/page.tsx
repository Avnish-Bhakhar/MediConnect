'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { Doctor, Review } from '../../../types';
import '@/styles/pages/DoctorDetail.css';

export default function DoctorDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ date: '', timeSlot: '', symptoms: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [slots, setSlots] = useState<Array<{ time: string; isBooked: boolean }>>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/doctors/${id}`)
      .then((res) => setDoctor(res.data.doctor))
      .catch((err) => {
        console.error('Failed to load doctor:', err);
      })
      .finally(() => setLoading(false));

    api
      .get(`/reviews/doctor/${id}`)
      .then((res) => setReviews(res.data.reviews || []))
      .catch((err) => console.error('Failed to load reviews:', err));
  }, [id]);

  const handleDateChange = async (dateStr: string) => {
    if (!dateStr) {
      setSelectedDay('');
      setSlots([]);
      setBooking((prev) => ({ ...prev, date: '', timeSlot: '' }));
      return;
    }
    const d = new Date(dateStr);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    setSelectedDay(dayName);
    setBooking((prev) => ({ ...prev, date: dateStr, timeSlot: '' }));

    setLoadingSlots(true);
    try {
      const res = await api.get(`/doctors/${id}/available-slots?date=${dateStr}`);
      setSlots(res.data.slots || []);
    } catch (e) {
      console.error('Failed to fetch available slots:', e);
      const dayAvail = doctor?.availability?.find((a) => a.day === dayName);
      setSlots(dayAvail?.slots || []);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/appointments', { doctorId: id, ...booking });
      setSuccess('Appointment booked successfully! You will receive a confirmation shortly.');
      const bookedDate = booking.date;
      setBooking({ date: '', timeSlot: '', symptoms: '' });
      if (bookedDate) {
        await handleDateChange(bookedDate);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  marginBottom: '0.5rem',
                }}
              >
                <h1>{doctor.user?.name}</h1>
                <span className="badge badge-success">Verified</span>
              </div>
              <p className="doctor-detail__spec">
                {doctor.specialization} · {doctor.qualification}
              </p>
              <div className="doctor-detail__meta">
                <span>Location: {doctor.city}</span>
                <span>Experience: {doctor.experience} yrs</span>
                <span>Fee: ₹{doctor.consultationFee} consultation</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={`star ${s <= stars ? '' : 'star-empty'}`}>
                      ★
                    </span>
                  ))}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                  {doctor.rating} ({doctor.totalRatings} reviews)
                </span>
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
                <h3 style={{ marginBottom: '1rem', color: 'var(--gray-800)', fontWeight: 700 }}>
                  About
                </h3>
                <p style={{ color: 'var(--gray-600)', lineHeight: 1.7 }}>{doctor.bio}</p>
              </div>
            )}
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--gray-800)', fontWeight: 700 }}>
                Available Days
              </h3>
              <div className="availability-grid">
                {doctor.availability?.map((a) => (
                  <div key={a.day} className="avail-day">
                    <span className="avail-day__name">{a.day.slice(0, 3)}</span>
                    <span className="avail-day__count">
                      {a.slots?.filter((s) => !s.isBooked).length} slots
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ color: 'var(--gray-800)', fontWeight: 700, margin: 0 }}>
                  Patient Reviews ({reviews.length})
                </h3>
                {reviews.length > 0 && (
                  <span style={{ fontWeight: 600, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    ★ {doctor.rating} / 5
                  </span>
                )}
              </div>
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  No reviews yet. Complete an appointment with this doctor to leave the first review!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviews.map((rev) => (
                    <div
                      key={rev._id}
                      style={{
                        padding: '0.75rem 0',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-800)' }}>
                          {rev.patient?.name || 'Verified Patient'}
                        </span>
                        <span style={{ color: '#f59e0b', fontSize: '0.8125rem' }}>
                          {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                        </span>
                      </div>
                      {rev.comment && (
                        <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>
                          {rev.comment}
                        </p>
                      )}
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                        {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="doctor-detail__right animate-fade-in-right">
            <div className="booking-card">
              <div className="booking-card__header">
                <h2>Book Appointment</h2>
                <p>Fill in details to schedule your visit</p>
              </div>
              {success && <div className="booking-success">{success}</div>}
              {error && <div className="auth-error">{error}</div>}
              <form onSubmit={handleBook}>
                <div className="form-group">
                  <label className="form-label">Select Date</label>
                  <input
                    type="date"
                    className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                    value={booking.date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    required
                  />
                </div>
                {selectedDay && (
                  <div className="form-group">
                    <label className="form-label">
                      Time Slot — {selectedDay}{' '}
                      {loadingSlots && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}>
                          (Checking availability...)
                        </span>
                      )}
                    </label>
                    <div className="slots-grid">
                      {loadingSlots ? (
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', gridColumn: 'span 3' }}>
                          Loading available slots...
                        </p>
                      ) : slots.length === 0 ? (
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', gridColumn: 'span 3' }}>
                          No slots available for this day
                        </p>
                      ) : (
                        slots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            className={`slot-btn ${booking.timeSlot === slot.time ? 'active' : ''} ${
                              slot.isBooked ? 'booked' : ''
                            }`}
                            onClick={() => !slot.isBooked && setBooking({ ...booking, timeSlot: slot.time })}
                            disabled={slot.isBooked}
                            title={slot.isBooked ? 'Already booked for this date' : `Select ${slot.time}`}
                          >
                            {slot.time} {slot.isBooked && '✕'}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Symptoms / Reason (optional)</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Describe your symptoms..."
                    style={{ resize: 'vertical' }}
                    value={booking.symptoms}
                    onChange={(e) => setBooking({ ...booking, symptoms: e.target.value })}
                  />
                </div>
                <div className="booking-fee">
                  <span>Consultation Fee</span>
                  <span className="booking-fee__amount">₹{doctor.consultationFee}</span>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-full btn-lg"
                  disabled={submitting || !booking.date || !booking.timeSlot}
                >
                  {submitting ? 'Booking...' : user ? 'Confirm Appointment' : 'Login to Book'}
                </button>
                {!user && (
                  <p
                    style={{
                      textAlign: 'center',
                      fontSize: '0.8rem',
                      color: 'var(--gray-500)',
                      marginTop: '0.75rem',
                    }}
                  >
                    You&apos;ll be redirected to login
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
