import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import connectDB from './config/db.js'
import authRoutes from './routes/auth.js'
import postRoutes from './routes/posts.js'
import profileRoutes from './routes/profile.js'
import userRoutes from './routes/users.js'
import chatRoutes from './routes/chats.js'
import messageRoutes from './routes/messages.js'
import notificationRoutes from './routes/notifications.js'
import { saveMessage } from './controllers/messageController.js'

import Chat from './models/Chat.js'

dotenv.config()
const PORT = process.env.PORT || 5000
const userSockets = {}

const app = express()
const server = http.createServer(app)

// 1. Socket.IO инициализация
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

// 2. EXPRESS MIDDLEWARES
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ limit: '20mb', extended: true }))
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

// 3. ПРОКИДЫВАЕМ SOCKET.IO В REQ
app.use((req, res, next) => {
  req.io = io
  req.userSockets = userSockets
  next()
})

// 4. РОУТЫ
app.use('/api/users', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/chats', chatRoutes)
app.use('/api/messages', messageRoutes)

// 5. SOCKET.IO JWT MIDDLEWARE
io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) return next(new Error('Authentication error'))

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.userId = decoded.id
    next()
  } catch (err) {
    next(new Error('Authentication error'))
  }
})

// 6. SOCKET.IO EVENTS
io.on('connection', (socket) => {
  const userId = socket.userId
  if (userId) {
    userSockets[userId] = socket.id
    console.log('User connected:', userId)
  }

  socket.on('join_chat', (chatId) => {
    socket.join(chatId)
    console.log(`User ${socket.userId} joined chat: ${chatId}`)
  })

  socket.on('sendMessage', async ({ chatId, to, message }) => {
    try {
      const savedMessage = await saveMessage(socket.userId, to, message, chatId)

      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: {
          text: message,
          sender: socket.userId,
          createdAt: new Date(),
        },
      })

      const roomId = chatId

      io.to(roomId).emit('receiveMessage', {
        _id: savedMessage._id,
        chatId: chatId,
        senderId: socket.userId,
        text: message,
        createdAt: savedMessage.createdAt,
      })

      const receiverSocketId = userSockets[to]
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('notification', {
          type: 'MESSAGE',
          chatId: chatId,
          from: socket.userId,
          text: message,
        })
      }
    } catch (err) {
      console.error(err)
      socket.emit('error', 'Message delivery failed')
    }
  })

  socket.on('disconnect', () => {
    if (userId) {
      delete userSockets[userId]
      console.log('User disconnected:', userId)
    }
  })
})

// 7. START SERVER
const startServer = async () => {
  try {
    await connectDB()
    console.log('MongoDB connected')
    server.listen(PORT, () => console.log(`Server started on port ${PORT}`))
  } catch (error) {
    console.error('Startup error:', error)
    process.exit(1)
  }
}

startServer()
