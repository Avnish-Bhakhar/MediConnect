import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DoctorCard from '../components/common/DoctorCard';
import TourGuide from '../components/common/TourGuide';
import { Doctor } from '../types';
import './Home.css';

const specializations = ['Cardiologist','Dermatologist','General Physician','Neurologist','Orthopedic','Pediatrician','Psychiatrist','Gynecologist'];

const Home: React.FC = () => {
  const { user } = useAuth();
  const [featuredDoctors, setFeaturedDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctors?limit=3').then(res => {
      setFeaturedDoctors(res.data.doctors || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      <TourGuide />

      {/* Hero */}
      <section className="hero">
        <div className="hero__bg-shapes">
          <div className="hero__shape hero__shape--1" />
          <div className="hero__shape hero__shape--2" />
          <div className="hero__shape hero__shape--3" />
        </div>
        <div className="container">
          <div className="hero__content animate-fade-in">
            <div className="hero__eyebrow">🏥 India's Trusted Healthcare Platform</div>
            <h1 className="hero__title">
              Find & Book <span className="gradient-text">Top Doctors</span><br/>
              Near You, Instantly
            </h1>
            <p className="hero__subtitle">
              Connect with verified specialists across India. Book appointments online, get real-time updates, and manage your health journey all in one place.
            </p>
            <div className="hero__actions">
              <Link to="/doctors" className="btn btn-primary btn-lg">Find a Doctor →</Link>
              {!user && <Link to="/register" className="btn btn-outline btn-lg">Register Free</Link>}
            </div>
            <div className="hero__stats">
              <div className="hero__stat"><span className="hero__stat-num">500+</span><span>Doctors</span></div>
              <div className="hero__stat-divider" />
              <div className="hero__stat"><span className="hero__stat-num">10k+</span><span>Patients</span></div>
              <div className="hero__stat-divider" />
              <div className="hero__stat"><span className="hero__stat-num">20+</span><span>Specialties</span></div>
            </div>
          </div>
          <div className="hero__visual animate-float">
            <div className="hero__card-float hero__card-float--1 animate-fade-in-right">
              <span>✅</span><span>Appointment Confirmed!</span>
            </div>
            <div className="hero__card-float hero__card-float--2 animate-fade-in-left">
              <span>🔔</span><span>Real-time Notifications</span>
            </div>
            <div className="hero__illustration">
              <div className="hero__pulse-ring" />
              <div className="hero__center-icon animate-heartbeat">⚕</div>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="specializations section">
        <div className="container">
          <h2 className="section__title">Browse by <span className="gradient-text">Specialty</span></h2>
          <p className="section__subtitle">Find the right specialist for your health needs</p>
          <div className="spec-grid">
            {specializations.map((spec, i) => (
              <Link key={spec} to={`/doctors?specialization=${spec}`}
                className="spec-card animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s` }}>
                <span className="spec-card__icon">🩺</span>
                <span className="spec-card__name">{spec}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features section">
        <div className="container">
          <h2 className="section__title">Why Choose <span className="gradient-text">MediConnect?</span></h2>
          <div className="grid-3">
            {[
              { icon: '⚡', title: 'Instant Booking', desc: 'Book appointments in under 60 seconds. No phone calls, no waiting.' },
              { icon: '🔔', title: 'Real-time Updates', desc: 'Get instant Socket.IO notifications when your appointment is confirmed or updated.' },
              { icon: '🔒', title: 'Secure & Private', desc: 'JWT-protected data, RBAC roles, and encrypted medical records.' },
              { icon: '⭐', title: 'Verified Doctors', desc: 'Every doctor is manually verified and approved by our admin team.' },
              { icon: '💊', title: 'Digital Prescriptions', desc: 'Receive prescriptions digitally after your consultation.' },
              { icon: '🌙', title: 'Dark Mode', desc: 'Easy on the eyes — toggle between light and dark mode anytime.' },
            ].map((f, i) => (
              <div key={f.title} className="feature-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="featured-doctors section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 className="section__title" style={{ marginBottom: '0.5rem' }}>Featured <span className="gradient-text">Doctors</span></h2>
              <p className="section__subtitle" style={{ marginBottom: 0 }}>Top-rated specialists ready to help</p>
            </div>
            <Link to="/doctors" className="btn btn-outline">View All Doctors →</Link>
          </div>
          {loading ? (
            <div className="grid-3">{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 380, borderRadius: 'var(--radius-xl)' }} />)}</div>
          ) : (
            <div className="grid-3">{featuredDoctors.map(d => <DoctorCard key={d._id} doctor={d} />)}</div>
          )}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="cta-section">
          <div className="container">
            <div className="cta-card animate-fade-in">
              <h2>Ready to Take Control of Your Health?</h2>
              <p>Join thousands of patients who trust MediConnect for their healthcare needs.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
                <Link to="/doctors" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}>Browse Doctors</Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
