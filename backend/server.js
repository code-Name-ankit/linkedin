import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import postsRouter from "./routes/posts.routes.js";
import userRouter from "./routes/user.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(postsRouter);
app.use(userRouter);
app.use("/uploads", express.static("uploads"));


const PORT = process.env.PORT;
const url = process.env.MONGODB_URI;

mongoose
  .connect(url)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// app.get("/", (req, res) => {
//   res.send("Hello from the backend server!");
// });

