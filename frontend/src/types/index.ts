export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Doctor {
  _id: string;
  user: User;
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  bio?: string;
  city: string;
  hospital?: string;
  rating: number;
  totalRatings: number;
  isApproved: boolean;
  availability: Availability[];
}

export interface Availability {
  day: string;
  slots: TimeSlot[];
}

export interface TimeSlot {
  time: string;
  isBooked: boolean;
  _id?: string;
}

export interface Appointment {
  _id: string;
  patient: User;
  doctor: Doctor;
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  symptoms?: string;
  notes?: string;
  prescription?: string;
  fee: number;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  doctorProfile?: Doctor | null;
  isLoading: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: Date;
}
