const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

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
