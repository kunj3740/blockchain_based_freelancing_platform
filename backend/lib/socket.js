import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const users = {};

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("message", (msg) => {
    console.log("Message received:", msg);
  });

  const userId = socket.handshake.query.id;
  console.log(userId);

  users[userId] = socket.id;

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

export const getReceiverSocketId = (receiverId) => {
  return users[receiverId];
};

export { app, server, io };
