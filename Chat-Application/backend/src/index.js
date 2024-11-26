import "dotenv/config";
import express from "express";
import authRouter from "./routes/auth.routes.js";
import messageRouter from "./routes/message.routes.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./lib/socket.js";

const PORT = process.env.PORT;

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

server.listen(PORT, () => {
  console.log("Server Running on PORT ->", PORT);
  connectDB();
});
