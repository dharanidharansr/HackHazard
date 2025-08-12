const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const connectDB = require("./config/db");
const habitRoutes = require("./routes/habitRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
const authRoutes = require("./routes/authroutes");
const socketIo = require("socket.io");
const Chat = require("./models/chat"); // Add this
const recommendationRoutes = require('./routes/recommendationRoute');
const visualizerRoutes = require('./routes/visualizerRoutes');
const forecastRoutes = require('./routes/forecastRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const userRoutes = require("./routes/userRoutes");
const googleCalendarRoutes = require('./routes/googleCalendarRoutes');
const { initWebsocket } = require('./services/websocket');
const user = require("./models/user");
const coachRoutes = require("./routes/coachRoutes");
require("dotenv").config();

const PORT = process.env.PORT || 8000;

const app = express();
const httpServer = createServer(app);

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const normalizedClientUrl = clientUrl.endsWith('/') ? clientUrl.slice(0, -1) : clientUrl;
const allowedOrigins = [
  normalizedClientUrl,
  "https://your-frontend-app.vercel.app", // Replace with your actual frontend URL
  process.env.FRONTEND_URL || "http://localhost:5173"
];
// Initialize WebSocket with our HTTP server
initWebsocket(httpServer);
// Initialize Socket.IO
const io = socketIo(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

connectDB();

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-chat", (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat: ${chatId}`);
  });

  socket.on("typing-started", async ({ chatId, userId }) => {
    try {
      const chat = await Chat.findById(chatId);
      if (chat && !chat.typingUsers.includes(userId)) {
        chat.typingUsers.push(userId);
        await chat.save();
        io.to(chatId).emit("typing-update", chat.typingUsers);
      }
    } catch (error) {
      console.error("Error in typing-started:", error);
    }
  });

  socket.on("typing-stopped", async ({ chatId, userId }) => {
    try {
      const chat = await Chat.findById(chatId);
      if (chat) {
        chat.typingUsers = chat.typingUsers.filter(
          (id) => id.toString() !== userId
        );
        await chat.save();
        io.to(chatId).emit("typing-update", chat.typingUsers);
      }
    } catch (error) {
      console.error("Error in typing-stopped:", error);
    }
  });

  socket.on("message-read", async ({ chatId, messageId, userId }) => {
    try {
      const chat = await Chat.findById(chatId);
      if (chat) {
        const message = chat.messages.id(messageId);
        if (message && !message.readBy.includes(userId)) {
          message.readBy.push(userId);
          await chat.save();
          io.to(chatId).emit("read-receipt-update", {
            messageId,
            readBy: message.readBy,
          });
        }
      }
    } catch (error) {
      console.error("Error in message-read:", error);
    }
  });

  // Update the socket event for new messages
  socket.on("new-message", async ({ chatId, message }) => {
    try {
      const chat = await Chat.findById(chatId);
      if (chat) {
        io.to(chatId).emit("message-received", message);
      }
    } catch (error) {
      console.error("Error in new-message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/habits", habitRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/partners", partnerRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.get("/", (req, res) => {
  res.send("Habitz API is running...");
});
app.use('/api/google-calendar', googleCalendarRoutes);
app.use('/api/visualizer', visualizerRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/challenges', challengeRoutes);
app.use("/api/users", userRoutes);
app.use('/api/coach', coachRoutes);

// Change app.listen to httpServer.listen
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
