require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// Build allowlist from environment. In production, require explicit configuration.
const allowedOrigins = (process.env.CLIENT_ORIGINS || process.env.CLIENT_URL || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  console.error('ERROR: CLIENT_ORIGINS must be set in production (comma-separated list)');
  process.exit(1);
}

const corsOptions = {
  origin: (origin, callback) => {
    // Disallow requests with no origin in production (prevents silent permissive behavior)
    if (!origin) {
      if (process.env.NODE_ENV === 'development') return callback(null, true);
      return callback(new Error('Not allowed by CORS: origin required'));
    }
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

// Socket.IO should use the same explicit allowlist (array form)
const io = new Server(server, {
  cors: { origin: allowedOrigins.length ? allowedOrigins : false, methods: ['GET', 'POST'], credentials: true }
});

// Connect DB
connectDB();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'mediconnect_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }
}));

// Attach io to req
app.use((req, res, next) => { req.io = io; next(); });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', require('./routes/chat'));

app.get('/', (req, res) => res.json({ message: 'Welcome to MediConnect API. Use /api to access endpoints.' }));
app.get('/api/health', (req, res) => res.json({ status: 'MediConnect API running', timestamp: new Date() }));

// Error handler
app.use(errorHandler);

// Socket.IO
socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
