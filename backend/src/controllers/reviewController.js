const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

exports.createReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;

    if (!appointmentId || !rating) {
      return res.status(400).json({ success: false, message: 'Appointment ID and rating (1-5) are required' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Verify appointment belongs to logged in patient
    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this appointment' });
    }

    // Must be completed
    if (appointment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Reviews can only be submitted for completed consultations' });
    }

    // Check if review already exists
    const existing = await Review.findOne({ appointment: appointmentId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this appointment' });
    }

    const review = await Review.create({
      patient: req.user._id,
      doctor: appointment.doctor,
      appointment: appointmentId,
      rating: Math.round(numRating),
      comment: comment ? comment.trim() : ''
    });

    // Recalculate doctor rating and totalRatings
    const allReviews = await Review.find({ doctor: appointment.doctor });
    const totalCount = allReviews.length;
    const avgRating = totalCount > 0
      ? Number((allReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalCount).toFixed(1))
      : 0;

    await Doctor.findByIdAndUpdate(appointment.doctor, {
      rating: avgRating,
      totalRatings: totalCount
    });

    const populated = await review.populate('patient', 'name avatar');

    res.status(201).json({
      success: true,
      review: populated,
      doctorRating: avgRating,
      totalRatings: totalCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const reviews = await Review.find({ doctor: doctorId })
      .populate('patient', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyReviewedAppointments = async (req, res) => {
  try {
    const reviews = await Review.find({ patient: req.user._id }).select('appointment rating comment');
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
