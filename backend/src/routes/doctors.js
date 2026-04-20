const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createDoctorProfile, getAllDoctors, getDoctorById,
  updateDoctorProfile, updateAvailability, approveDoctor, getPendingDoctors
} = require('../controllers/doctorController');

const router = express.Router();

router.get('/', getAllDoctors);
router.get('/pending', protect, authorize('admin'), getPendingDoctors);
router.get('/:id', getDoctorById);
router.post('/', protect, authorize('doctor'), createDoctorProfile);
router.put('/profile', protect, authorize('doctor'), updateDoctorProfile);
router.put('/availability', protect, authorize('doctor'), updateAvailability);
router.put('/:id/approve', protect, authorize('admin'), approveDoctor);

module.exports = router;
