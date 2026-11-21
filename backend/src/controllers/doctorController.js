const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

exports.createDoctorProfile = async (req, res) => {
  try {
    const existing = await Doctor.findOne({ user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Doctor profile exists' });
    const doctor = await Doctor.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const { specialization, city, page = 1, limit = 9 } = req.query;
    const query = { isApproved: true };
    if (specialization) query.specialization = { $regex: specialization, $options: 'i' };
    if (city) query.city = { $regex: city, $options: 'i' };

    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .populate('user', 'name email avatar phone')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ rating: -1 });

    res.json({ success: true, doctors, total, pages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email avatar phone');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id }, req.body, { new: true, runValidators: true }
    ).populate('user', 'name email avatar');
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id },
      { availability: req.body.availability },
      { new: true }
    );
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id, { isApproved: req.body.isApproved }, { new: true }
    ).populate('user', 'name email');
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isApproved: false }).populate('user', 'name email phone');
    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date query parameter is required' });

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[targetDate.getDay()];

    const daySchedule = doctor.availability?.find((a) => a.day === dayName);
    if (!daySchedule || !daySchedule.slots || daySchedule.slots.length === 0) {
      return res.json({ success: true, day: dayName, date, slots: [] });
    }

    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctor: doctor._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] }
    }).select('timeSlot');

    const bookedTimeSlots = new Set(bookedAppointments.map((a) => a.timeSlot));

    const slots = daySchedule.slots.map((s) => ({
      time: s.time,
      isBooked: s.isBooked || bookedTimeSlots.has(s.time)
    }));

    res.json({
      success: true,
      day: dayName,
      date,
      slots
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
