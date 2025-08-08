const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const readingRoutes = require('./routes/readings');
const sessionRoutes = require('./routes/sessions');
const feedbackRoutes = require('./routes/feedback');
const availabilityRoutes = require('./routes/availability');
const requestRoutes = require('./routes/requests');
const zoomRoutes = require('./routes/zoom');
const tutorsRoutes = require('./routes/tutors');

const { initDatabase } = require('./database/init');
const { seedDemoUsers } = require('./database/seed');
const { seedSampleTutors } = require('./database/seedTutors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Initialize database and seed demo users
initDatabase();
setTimeout(() => {
  seedDemoUsers();
  seedSampleTutors();
}, 1000); // Delay to ensure database is ready

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

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

server.listen(PORT, () => {
  console.log(`GenConnect server running on port ${PORT}`);
});