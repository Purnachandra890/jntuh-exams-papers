// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
const app = express();
const server = http.createServer(app);

// 1) CORS whitelist
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://jntuh-exams-papers.onrender.com",
  ...(process.env.LOAD_BALANCER_URL ? [process.env.LOAD_BALANCER_URL] : []),
  ...(process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
    : []),
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  exposedHeaders: ["X-Cache", "X-Data-Source", "X-Server-Id", "X-Upstream-Server"],
}));

// Identify which backend instance handled the request (visible in browser devtools)
app.use((req, res, next) => {
  res.setHeader("X-Server-Id", process.env.SERVER_ID || "backend-unknown");
  next();
});

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));


let onlineUsers = 0;
io.on("connection", (socket) => {
  onlineUsers++;
  io.emit("OnlineUsers", onlineUsers);
  socket.emit("OnlineUsers", onlineUsers);

  socket.on("disconnect", () => {
    onlineUsers = Math.max(onlineUsers - 1, 0);
    io.emit("OnlineUsers", onlineUsers);
  });
});



// 2) Health-check endpoints (used by load balancer / Render)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    server: process.env.SERVER_ID || "backend-unknown",
  });
});

app.get("/api/ping", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Testing endpoint — proves which backend instance handled the request
app.get("/api/test-server", (req, res) => {
  res.status(200).json({
    server: process.env.SERVER_ID || "backend-unknown",
  });
});

// Import & mount your other routes
const getfiles = require("./routes/getFiles");
const uploadRoute = require("./routes/upload");
const getuserSelectionFile = require("./routes/getUserSelectionFile");
const verifyFileRoute = require("./routes/verifyFile");
const deleteFileRoute = require("./routes/deleteFile");
const recentPapers=require("./routes/recentPapers");
const authRoute = require("./routes/auth");
const { connectRedis } = require("./services/redis.service");

app.use("/api/files", getfiles);
app.use("/api/upload", uploadRoute);
app.use("/api/getfile", getuserSelectionFile);
app.use("/api/verify", verifyFileRoute);
app.use("/api/deletefile", deleteFileRoute);
app.use("/api/recent",recentPapers);
app.use("/api/auth", authRoute);

// Connect to MongoDB and start server…
// mongoose
//   .connect(process.env.MONGO_URI, {
//     /* options */
//   })
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("MongoDB error:", err));

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await connectRedis();

    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
}


startServer();
