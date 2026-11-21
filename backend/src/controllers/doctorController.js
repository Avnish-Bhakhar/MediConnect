const Doctor = require('../models/Doctor');
const User = require('../models/User');

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
    const { specialization, city, search, page = 1, limit = 9 } = req.query;
    const query = { isApproved: true };

    if (specialization && specialization.trim() && specialization.trim() !== 'All') {
      query.specialization = { $regex: escapeRegex(specialization.trim()), $options: 'i' };
    }

    if (city && city.trim()) {
      query.city = { $regex: escapeRegex(city.trim()), $options: 'i' };
    }

    if (search && search.trim()) {
      const cleanSearch = escapeRegex(search.trim());
      const searchRegex = { $regex: cleanSearch, $options: 'i' };

      // Find user IDs whose name matches the search term
      const matchingUsers = await User.find({ name: searchRegex }).select('_id');
      const userIds = matchingUsers.map((u) => u._id);

      query.$or = [
        { specialization: searchRegex },
        { hospital: searchRegex },
        { qualification: searchRegex },
        { bio: searchRegex },
        { user: { $in: userIds } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 9);

    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .populate('user', 'name email avatar phone')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ rating: -1 });

    res.json({
      success: true,
      doctors,
      total,
      pages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
    });
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
