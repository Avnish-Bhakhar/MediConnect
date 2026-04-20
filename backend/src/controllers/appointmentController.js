const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, symptoms } = req.body;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    if (!doctor.isApproved) return res.status(400).json({ success: false, message: 'Doctor not available' });

    // Check slot conflict
    const existing = await Appointment.findOne({
      doctor: doctorId, date: new Date(date), timeSlot, status: { $in: ['pending', 'confirmed'] }
    });
    if (existing) return res.status(400).json({ success: false, message: 'Slot already booked' });

    const appointment = await Appointment.create({
      patient: req.user._id, doctor: doctorId, date: new Date(date),
      timeSlot, symptoms, fee: doctor.consultationFee
    });

    const populated = await appointment.populate([
      { path: 'patient', select: 'name email phone' },
      { path: 'doctor', populate: { path: 'user', select: 'name' } }
    ]);

    // Emit socket event
    if (req.io) {
      req.io.to(`doctor_${doctor.user.toString()}`).emit('new_appointment', {
        appointment: populated,
        message: `New appointment from ${req.user.name}`
      });
    }

    res.status(201).json({ success: true, appointment: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { patient: req.user._id };
    if (status) query.status = status;

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name avatar' } })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, appointments, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const { page = 1, limit = 10, status } = req.query;
    const query = { doctor: doctor._id };
    if (status) query.status = status;

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone avatar')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, appointments, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name _id' } });

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    appointment.status = req.body.status;
    if (req.body.prescription) appointment.prescription = req.body.prescription;
    if (req.body.notes) appointment.notes = req.body.notes;
    await appointment.save();

    // Notify patient
    if (req.io) {
      req.io.to(`patient_${appointment.patient._id.toString()}`).emit('appointment_updated', {
        appointment,
        message: `Appointment ${req.body.status} by Dr. ${appointment.doctor.user.name}`
      });
    }

    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
