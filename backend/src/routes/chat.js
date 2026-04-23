const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// Send message via HTTP (fallback when socket fails)
router.post('/send', protect, async (req, res, next) => {
  try {
    const { receiverId, content, appointmentId } = req.body;
    const senderId = req.user.id;

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      appointmentId: appointmentId || undefined,
    });
    await message.save();

    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    // Also emit via socket if available
    if (req.io) {
      req.io.to(`user_${receiverId}`).emit('receive_message', populated);
      req.io.to(`user_${senderId}`).emit('receive_message', populated);
    }

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

// Get chat history between current user and another user
router.get('/:userId', protect, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    }).populate('sender', 'name avatar').populate('receiver', 'name avatar').sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
