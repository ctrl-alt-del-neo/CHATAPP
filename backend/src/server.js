import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import connectDB from "./lib/db.js";
import { app, server } from "./lib/socket.js";
import path from "path";

dotenv.config();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Chat App API");
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}
server.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Server is running on port ${PORT}`);
  } catch (err) {
    console.error("Failed to connect to the database", err);
  }
});
