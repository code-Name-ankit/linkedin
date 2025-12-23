import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import serverless from "serverless-http";

import postsRouter from "./routes/posts.routes.js";
import userRouter from "./routes/user.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(postsRouter);
app.use(userRouter);
app.use("/uploads", express.static("uploads"));

/* ================= MONGODB CONNECTION ================= */
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Error:", err);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

/* ================= TEST ROUTE ================= */
app.get("/", (req, res) => {
  res.json({ message: "Lambda backend running 🚀" });
});

/* ================= EXPORT FOR LAMBDA ================= */
export const handler = serverless(app);
