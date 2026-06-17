const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

const socketHandler = (io) => {
  // Auth + origin-check middleware for socket
  io.use(async (socket, next) => {
    try {
      // Validate Origin against allowlist
      const origin = socket.handshake.headers.origin;
      const allowedOrigins = (process.env.CLIENT_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      if (origin) {
        if (!allowedOrigins.includes(origin)) return next(new Error('Origin not allowed'));
      } else if (process.env.NODE_ENV === 'production') {
        return next(new Error('Origin required'));
      }

      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user.role})`);

    // Join role-based room
    socket.join(`${socket.user.role}_${socket.user._id.toString()}`);
    socket.join(`user_${socket.user._id.toString()}`);
    socket.join('general');

    socket.on('join_room', (room) => {
      socket.join(room);
    });

    socket.on('send_notification', (data) => {
      io.to(data.targetRoom).emit('notification', data);
    });

    socket.on('send_message', async (data) => {
      try {
        const { receiverId, content, appointmentId } = data;
        const message = new Message({
          sender: socket.user._id,
          receiver: receiverId,
          content,
          appointmentId
        });
        await message.save();
        
        const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatar').populate('receiver', 'name avatar');

        // Emit to receiver's personal room
        io.to(`user_${receiverId}`).emit('receive_message', populatedMessage);
        // Also emit back to sender so they see it
        socket.emit('receive_message', populatedMessage);
      } catch (error) {
        console.error('Socket message error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

module.exports = socketHandler;
