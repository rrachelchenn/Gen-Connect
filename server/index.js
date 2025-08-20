const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const { router: authRoutes, authenticateToken } = require('./routes/auth');
const userRoutes = require('./routes/users');
const readingRoutes = require('./routes/readings');
const sessionRoutes = require('./routes/sessions');
const feedbackRoutes = require('./routes/feedback');
const availabilityRoutes = require('./routes/availability');
const requestRoutes = require('./routes/requests');
const zoomRoutes = require('./routes/zoom');
const tutorsRoutes = require('./routes/tutors');
const discussionsRoutes = require('./routes/discussions');

const { initDatabase } = require('./database/init');

const app = express();
const server = http.createServer(app);

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://www.genconnect.live', 'https://genconnect.live']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const io = socketIo(server, {
  cors: corsOptions
});

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Initialize database
initDatabase();

// Only seed demo data in development
if (process.env.NODE_ENV !== 'production') {
  const { seedDemoUsers } = require('./database/seed');
  const { seedSampleTutors } = require('./database/seedTutors');
  const { seedEnhancedReadings } = require('./database/seedEnhancedReadings');
  
  setTimeout(() => {
    seedDemoUsers();
    seedSampleTutors();
    seedEnhancedReadings();
  }, 1000);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/zoom', zoomRoutes);
app.use('/api/tutors', tutorsRoutes);
app.use('/api/discussions', discussionsRoutes);

// Socket.io for live sessions
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`User ${socket.id} joined session ${sessionId}`);
  });

  socket.on('send-message', (data) => {
    socket.to(data.sessionId).emit('receive-message', {
      message: data.message,
      sender: data.sender,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`GenConnect server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});