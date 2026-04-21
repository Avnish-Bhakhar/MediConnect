import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './DoctorSetup.css';

const specializations = ['Cardiologist','Dermatologist','General Physician','Neurologist','Orthopedic','Pediatrician','Psychiatrist','Gynecologist','ENT Specialist','Ophthalmologist'];
const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const defaultSlots = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'];

const DoctorSetup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    specialization: '', qualification: '', experience: '', consultationFee: '', bio: '', city: '', hospital: '',
    availability: days.map(day => ({ day, slots: defaultSlots.map(time => ({ time, isBooked: false })) }))
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/doctors', { ...form, experience: Number(form.experience), consultationFee: Number(form.consultationFee) });
      navigate('/doctor/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Setup failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="doctor-setup">
      <div className="setup-hero">
        <div className="container">
          <h1 className="animate-fade-in">Setup Your Doctor Profile</h1>
          <p>Complete your profile to start receiving appointments</p>
          <div className="setup-steps">
            {[1, 2].map(s => (
              <div key={s} className={`setup-step ${step >= s ? 'active' : ''}`}>
                <div className="setup-step__num">{s}</div>
                <span>{s === 1 ? 'Basic Info' : 'Availability'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="container">
        <form onSubmit={handleSubmit} className="setup-form animate-fade-in">
          {step === 1 && (
            <div className="setup-card">
              <h2>Basic Information</h2>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <select className="form-input" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} required>
                    <option value="">Select specialization</option>
                    {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Qualification</label>
                  <input className="form-input" placeholder="e.g. MBBS, MD" value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input type="number" className="form-input" placeholder="5" min="0" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Consultation Fee (₹)</label>
                  <input type="number" className="form-input" placeholder="500" min="0" value={form.consultationFee} onChange={e => setForm({...form, consultationFee: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" placeholder="Delhi" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Hospital / Clinic</label>
                  <input className="form-input" placeholder="Apollo Hospital" value={form.hospital} onChange={e => setForm({...form, hospital: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-input" rows={3} placeholder="Tell patients about your experience..." value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} style={{ resize: 'vertical' }} />
              </div>
              <button type="button" className="btn btn-primary btn-lg" onClick={() => setStep(2)}>Next: Set Availability →</button>
            </div>
          )}
          {step === 2 && (
            <div className="setup-card">
              <h2>Set Your Availability</h2>
              <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Default slots are set for all days. You can update them later from dashboard.</p>
              <div className="availability-setup">
                {form.availability.map((dayAvail, di) => (
                  <div key={dayAvail.day} className="availability-day-setup">
                    <h4>{dayAvail.day}</h4>
                    <div className="slots-setup-grid">
                      {dayAvail.slots.map((slot, si) => (
                        <div key={slot.time} className="slot-setup-item">{slot.time}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {error && <div className="auth-error">{error}</div>}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-outline btn-lg" onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? 'Saving...' : 'Submit Profile'}
                </button>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '0.75rem' }}>Your profile will be reviewed and approved by admin before going live.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default DoctorSetup;
