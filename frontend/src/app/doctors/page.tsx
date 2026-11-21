'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '../../api/axios';
import DoctorCard from '../../components/common/DoctorCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Doctor } from '../../types';
import '@/styles/pages/Doctors.css';

const specializations = [
  'All',
  'Cardiologist',
  'Dermatologist',
  'General Physician',
  'Neurologist',
  'Orthopedic',
  'Pediatrician',
  'Psychiatrist',
  'Gynecologist',
];

function DoctorsContent() {
  const searchParams = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    specialization: searchParams?.get('specialization') || '',
    city: '',
    search: '',
  });

  useEffect(() => {
    fetchDoctors();
  }, [filters, currentPage]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: '9' });
      if (filters.specialization) params.set('specialization', filters.specialization);
      if (filters.city.trim()) params.set('city', filters.city.trim());
      if (filters.search.trim()) params.set('search', filters.search.trim());
      const res = await api.get(`/doctors?${params}`);
      setDoctors(res.data.doctors || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpecFilter = (spec: string) => {
    setFilters({ ...filters, specialization: spec === 'All' ? '' : spec });
    setCurrentPage(1);
  };

  return (
    <div className="doctors-page">
      <div className="doctors-hero">
        <div className="container">
          <h1 className="animate-fade-in">
            Find Your <span className="gradient-text">Doctor</span>
          </h1>
          <p className="animate-fade-in">Browse {total}+ verified specialists across India</p>
          <div className="doctors-search animate-fade-in">
            <input
              className="form-input doctors-search__input"
              placeholder="Search by name or specialty..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setCurrentPage(1);
              }}
            />
            <input
              className="form-input"
              placeholder="City"
              style={{ width: 180 }}
              value={filters.city}
              onChange={(e) => {
                setFilters({ ...filters, city: e.target.value });
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>
      <div className="container">
        <div className="spec-filter animate-slide-down">
          {specializations.map((spec) => (
            <button
              key={spec}
              type="button"
              className={`spec-filter__btn ${
                filters.specialization === spec || (spec === 'All' && !filters.specialization)
                  ? 'active'
                  : ''
              }`}
              onClick={() => handleSpecFilter(spec)}
            >
              {spec}
            </button>
          ))}
        </div>
        {loading ? (
          <LoadingSpinner text="Finding doctors..." />
        ) : doctors.length === 0 ? (
          <div className="doctors-empty">
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem', color: 'var(--gray-400)' }}>
              🔍
            </span>
            <h3>No doctors found</h3>
            <p>Try adjusting your search query or filters</p>
            {(filters.search || filters.city || filters.specialization) && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ marginTop: '1rem' }}
                onClick={() => {
                  setFilters({ specialization: '', city: '', search: '' });
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="doctors-count">
              Showing {doctors.length} of {total} doctors
            </p>
            <div className="grid-3">
              {doctors.map((d) => (
                <DoctorCard key={d._id} doctor={d} />
              ))}
            </div>
            {pages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-outline btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  type="button"
                >
                  ← Previous
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`btn btn-sm ${currentPage === p ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="btn btn-outline btn-sm"
                  disabled={currentPage === pages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  type="button"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen text="Loading doctors..." />}>
      <DoctorsContent />
    </Suspense>
  );
}
