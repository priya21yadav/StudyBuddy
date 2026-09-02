const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

// Database Connection
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Controllers me Socket access karne ke liye
app.set('io', io);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);

// Health Check Route
app.get('/', (req, res) => {
  res.send('StudyBuddy API & Socket Server is Running Live! 🚀');
});

// Socket.io Real-time Event Handlers
io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id);

  // User ko uski personal room me join karwayen notifications and messages receive karne ke liye
  socket.on('register_user', (userId) => {
    if (userId) {
      const roomStr = String(userId);
      socket.join(roomStr);
      console.log(`⚡ User registered for personal room & notifications: ${roomStr}`);
    }
  });

  // Join a private chat or video room
  socket.on('join_room', (roomId) => {
    if (roomId) {
      const rStr = String(roomId);
      socket.join(rStr);
      console.log(`User ${socket.id} joined room: ${rStr}`);
      socket.to(rStr).emit('user_joined', { socketId: socket.id });
    }
  });

  // Handle Send Text Message (Emits to both room and recipient's personal socket room)
  socket.on('send_message', (data) => {
    if (data.room) {
      socket.to(String(data.room)).emit('receive_message', data);
    }
    if (data.recipientId) {
      socket.to(String(data.recipientId)).emit('receive_message', data);
    }
  });

  // ==================== WebRTC Video Signaling ==================== //
  socket.on('call_user', ({ room, offer }) => {
    socket.to(String(room)).emit('incoming_call', { offer, from: socket.id });
  });

  socket.on('answer_call', ({ room, answer }) => {
    socket.to(String(room)).emit('call_accepted', { answer });
  });

  socket.on('ice_candidate', ({ room, candidate }) => {
    socket.to(String(room)).emit('ice_candidate', { candidate });
  });
  // ================================================================ //

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});