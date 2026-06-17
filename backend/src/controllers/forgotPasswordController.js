const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');

// @desc    Forgot Password - Send reset token to email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found with this email' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash token and save to user
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expiry (24 hours)
        user.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000;

        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a POST request to: \n\n ${resetUrl}`;

        const html = `
      <h1>Password Reset Request</h1>
      <p>Please click the link below to reset your password. This link is valid for 24 hours.</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message,
                html,
            });

            res.status(200).json({ success: true, message: 'Email sent' });
        } catch (error) {
            console.error('Email sending failed:', error);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ success: false, message: 'Email could not be sent', error: error.message });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const { token } = req.params;

        // Hash token from params to compare with hashed token in DB
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
