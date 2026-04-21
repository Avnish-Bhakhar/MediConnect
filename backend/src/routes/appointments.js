const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  bookAppointment, getMyAppointments, getDoctorAppointments,
  updateAppointmentStatus, getAllAppointments
} = require('../controllers/appointmentController');

const router = express.Router();

router.post('/', protect, authorize('patient'), [
  body('doctorId').notEmpty().withMessage('Doctor ID required'),
  body('date').isISO8601().withMessage('Valid date required'),
  body('timeSlot').notEmpty().withMessage('Time slot required'),
], validate, bookAppointment);

router.get('/my', protect, authorize('patient'), getMyAppointments);
router.get('/doctor', protect, authorize('doctor'), getDoctorAppointments);
router.get('/all', protect, authorize('admin', 'assistant'), getAllAppointments);
router.put('/:id/status', protect, authorize('doctor', 'admin', 'assistant'), updateAppointmentStatus);

module.exports = router;
