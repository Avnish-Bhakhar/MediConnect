const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: { type: String, required: true },
  qualification: { type: String, required: true },
  experience: { type: Number, default: 0 },
  consultationFee: { type: Number, required: true },
  bio: { type: String, maxlength: 500 },
  city: { type: String, required: true },
  hospital: { type: String },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: false },
  availability: [{
    day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
    slots: [{ 
      time: String, 
      isBooked: { type: Boolean, default: false } 
    }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
