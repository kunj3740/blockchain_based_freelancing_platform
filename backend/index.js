// index.js

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./lib/db.js";
import authRoute from "./routes/auth.route.js";
import freelancerRoutes from "./routes/freelancer.route.js";
import gitRoute from "./routes/gig.route.js";
import categoryRoute from "./routes/category.route.js";
import orderRoute from "./routes/order.route.js";
import buyerRoute from "./routes/buyer.route.js";
import messageRoute from "./routes/message.route.js";
import contractRoute from "./routes/contract.route.js";
import { io, app, server } from "./lib/socket.js";
import projectRoutes from './routes/projectRoutes.js';

dotenv.config();

const PORT = process.env.PORT || 8000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use("/api/auth", authRoute);
app.use("/api/buyers", buyerRoute);
app.use("/api/freelancers", freelancerRoutes);
app.use("/api/gigs", gitRoute);
app.use("/api/orders", orderRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/messages", messageRoute);
app.use("/api/contract", contractRoute);

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
