const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createReview,
  getDoctorReviews,
  getMyReviewedAppointments
} = require('../controllers/reviewController');

const router = express.Router();

router.get('/doctor/:doctorId', getDoctorReviews);
router.get('/my', protect, authorize('patient'), getMyReviewedAppointments);
router.post('/', protect, authorize('patient'), [
  body('appointmentId').notEmpty().withMessage('Appointment ID required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('comment').optional().isLength({ max: 1000 }).withMessage('Comment maximum 1000 characters')
], validate, createReview);

module.exports = router;
