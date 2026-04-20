require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mediconnect';

const specializations = ['Cardiologist','Dermatologist','General Physician','Neurologist','Orthopedic','Pediatrician','Psychiatrist','Gynecologist'];
const cities = ['Delhi','Mumbai','Bangalore','Chennai','Hyderabad','Pune','Kolkata','Chandigarh'];
const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const slots = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'];

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  await User.deleteMany({});
  await Doctor.deleteMany({});

  // Admin
  await User.create({ name: 'Admin User', email: 'admin@mediconnect.com', password: 'admin123', role: 'admin' });

  // Patient
  await User.create({ name: 'John Patient', email: 'patient@mediconnect.com', password: 'patient123', role: 'patient', phone: '9876543210' });

  // Doctors
  const doctorData = [
    { name: 'Dr. Priya Sharma', spec: 'Cardiologist', city: 'Delhi', fee: 800, exp: 12 },
    { name: 'Dr. Rahul Mehta', spec: 'Dermatologist', city: 'Mumbai', fee: 600, exp: 8 },
    { name: 'Dr. Ananya Singh', spec: 'General Physician', city: 'Bangalore', fee: 400, exp: 5 },
    { name: 'Dr. Vikram Patel', spec: 'Neurologist', city: 'Hyderabad', fee: 1000, exp: 15 },
    { name: 'Dr. Sneha Gupta', spec: 'Pediatrician', city: 'Chandigarh', fee: 500, exp: 7 },
    { name: 'Dr. Arjun Kapoor', spec: 'Orthopedic', city: 'Pune', fee: 700, exp: 10 },
  ];

  for (const d of doctorData) {
    const user = await User.create({
      name: d.name, email: `${d.name.split(' ')[2].toLowerCase()}@mediconnect.com`,
      password: 'doctor123', role: 'doctor', phone: '98765' + Math.floor(10000 + Math.random() * 90000)
    });
    await Doctor.create({
      user: user._id, specialization: d.spec, qualification: 'MBBS, MD',
      experience: d.exp, consultationFee: d.fee, city: d.city,
      bio: `Experienced ${d.spec} with ${d.exp} years of practice. Dedicated to patient care.`,
      isApproved: true, rating: (3.5 + Math.random() * 1.5).toFixed(1), totalRatings: Math.floor(50 + Math.random() * 200),
      availability: days.map(day => ({ day, slots: slots.map(time => ({ time, isBooked: false })) }))
    });
  }

  console.log('Seed complete!');
  console.log('Admin: admin@mediconnect.com / admin123');
  console.log('Patient: patient@mediconnect.com / patient123');
  console.log('Doctors: sharma@mediconnect.com etc / doctor123');
  mongoose.disconnect();
};

seed().catch(console.error);
