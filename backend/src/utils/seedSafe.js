const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Doctor = require('../models/Doctor');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mediconnect';

const specializations = ['Cardiologist','Dermatologist','General Physician','Neurologist','Orthopedic','Pediatrician','Psychiatrist','Gynecologist'];
const cities = ['Delhi','Mumbai','Bangalore','Chennai','Hyderabad','Pune','Kolkata','Chandigarh','Jalandhar'];
const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const slots = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'];

const seedSafe = async () => {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB successfully.');

  // Clean up any temporary test user
  await User.deleteOne({ email: 'testuser123@example.com' });

  // 1. Admin account
  let admin = await User.findOne({ email: 'admin@mediconnect.com' });
  if (!admin) {
    admin = await User.create({
      name: 'Admin User',
      email: 'admin@mediconnect.com',
      password: 'admin123',
      role: 'admin',
      phone: '9876500000'
    });
    console.log('Created Admin: admin@mediconnect.com');
  } else {
    admin.role = 'admin';
    admin.password = 'admin123';
    await admin.save();
    console.log('Updated Admin: admin@mediconnect.com');
  }

  // 2. Patient demo account
  let patient = await User.findOne({ email: 'patient@mediconnect.com' });
  if (!patient) {
    patient = await User.create({
      name: 'John Patient',
      email: 'patient@mediconnect.com',
      password: 'patient123',
      role: 'patient',
      phone: '9876543210'
    });
    console.log('Created Patient: patient@mediconnect.com');
  } else {
    patient.password = 'patient123';
    await patient.save();
    console.log('Updated Patient: patient@mediconnect.com');
  }

  // 3. Demo Doctors
  const doctorData = [
    { name: 'Dr. Priya Sharma', email: 'sharma@mediconnect.com', spec: 'Cardiologist', city: 'Delhi', fee: 800, exp: 12 },
    { name: 'Dr. Rahul Mehta', email: 'mehta@mediconnect.com', spec: 'Dermatologist', city: 'Mumbai', fee: 600, exp: 8 },
    { name: 'Dr. Ananya Singh', email: 'singh@mediconnect.com', spec: 'General Physician', city: 'Bangalore', fee: 400, exp: 5 },
    { name: 'Dr. Vikram Patel', email: 'patel@mediconnect.com', spec: 'Neurologist', city: 'Hyderabad', fee: 1000, exp: 15 },
    { name: 'Dr. Sneha Gupta', email: 'gupta@mediconnect.com', spec: 'Pediatrician', city: 'Chandigarh', fee: 500, exp: 7 },
    { name: 'Dr. Arjun Kapoor', email: 'kapoor@mediconnect.com', spec: 'Orthopedic', city: 'Pune', fee: 700, exp: 10 },
    { name: 'Dr. Ramesh Kumar', email: 'kumar@mediconnect.com', spec: 'Cardiologist', city: 'Jalandhar', fee: 450, exp: 15 },
  ];

  for (const d of doctorData) {
    let docUser = await User.findOne({ email: d.email });
    if (!docUser) {
      docUser = await User.create({
        name: d.name,
        email: d.email,
        password: 'doctor123',
        role: 'doctor',
        phone: '98765' + Math.floor(10000 + Math.random() * 90000)
      });
      console.log(`Created doctor user: ${d.email}`);
    } else {
      docUser.password = 'doctor123';
      docUser.role = 'doctor';
      await docUser.save();
      console.log(`Updated doctor user: ${d.email}`);
    }

    let doctor = await Doctor.findOne({ user: docUser._id });
    if (!doctor) {
      doctor = await Doctor.create({
        user: docUser._id,
        specialization: d.spec,
        qualification: 'MBBS, MD',
        experience: d.exp,
        consultationFee: d.fee,
        city: d.city,
        bio: `Experienced ${d.spec} with ${d.exp} years of practice. Dedicated to patient care.`,
        isApproved: true,
        rating: (3.8 + Math.random() * 1.2).toFixed(1),
        totalRatings: Math.floor(50 + Math.random() * 200),
        availability: days.map(day => ({
          day,
          slots: slots.map(time => ({ time, isBooked: false }))
        }))
      });
      console.log(`Created doctor profile for: ${d.name}`);
    } else {
      doctor.isApproved = true;
      if (!doctor.availability || doctor.availability.length === 0) {
        doctor.availability = days.map(day => ({
          day,
          slots: slots.map(time => ({ time, isBooked: false }))
        }));
      }
      await doctor.save();
      console.log(`Updated doctor profile for: ${d.name} (isApproved: true)`);
    }
  }

  // 4. Approve all other doctors in the database too
  const otherDoctors = await Doctor.find({ isApproved: false });
  for (const d of otherDoctors) {
    d.isApproved = true;
    if (!d.availability || d.availability.length === 0) {
      d.availability = days.map(day => ({
        day,
        slots: slots.map(time => ({ time, isBooked: false }))
      }));
    }
    await d.save();
  }
  console.log(`Approved ${otherDoctors.length} other pending doctor(s).`);

  const totalUsers = await User.countDocuments();
  const totalDoctors = await Doctor.countDocuments();
  const approvedDoctors = await Doctor.countDocuments({ isApproved: true });

  console.log('--- Summary ---');
  console.log(`Total Users: ${totalUsers}`);
  console.log(`Total Doctors: ${totalDoctors}`);
  console.log(`Approved Doctors: ${approvedDoctors}`);
  console.log('Demo Credentials:');
  console.log('  Admin:   admin@mediconnect.com / admin123');
  console.log('  Patient: patient@mediconnect.com / patient123');
  console.log('  Doctor:  sharma@mediconnect.com / doctor123');

  await mongoose.disconnect();
};

seedSafe().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
