const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 1000, trim: true },
}, { timestamps: true });

reviewSchema.index({ appointment: 1 }, { unique: true });
reviewSchema.index({ doctor: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
