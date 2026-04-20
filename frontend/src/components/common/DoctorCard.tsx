import React from 'react';
import { Link } from 'react-router-dom';
import { Doctor } from '../../types';
import './DoctorCard.css';

interface Props { doctor: Doctor; }

const DoctorCard: React.FC<Props> = ({ doctor }) => {
  const stars = Math.round(Number(doctor.rating));

  return (
    <div className="doctor-card animate-fade-in">
      <div className="doctor-card__header">
        <div className="doctor-card__avatar">
          {doctor.user?.name?.charAt(0) || 'D'}
        </div>
        <div className="doctor-card__badge">
          <span className="badge badge-success">✓ Verified</span>
        </div>
      </div>
      <div className="doctor-card__body">
        <h3 className="doctor-card__name">{doctor.user?.name}</h3>
        <p className="doctor-card__spec">{doctor.specialization}</p>
        <p className="doctor-card__qual">{doctor.qualification}</p>
        <div className="doctor-card__meta">
          <span>📍 {doctor.city}</span>
          <span>🏥 {doctor.experience} yrs exp</span>
        </div>
        <div className="doctor-card__rating">
          <div className="stars">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={`star ${s <= stars ? '' : 'star-empty'}`}>★</span>
            ))}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>({doctor.totalRatings} reviews)</span>
        </div>
        <div className="doctor-card__fee">
          <span className="doctor-card__fee-label">Consultation Fee</span>
          <span className="doctor-card__fee-amount">₹{doctor.consultationFee}</span>
        </div>
      </div>
      <div className="doctor-card__footer">
        <Link to={`/doctors/${doctor._id}`} className="btn btn-primary w-full">Book Appointment</Link>
      </div>
    </div>
  );
};

export default DoctorCard;
