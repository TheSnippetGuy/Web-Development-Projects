import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import globalErrorHandler from "./controller/errorController.js";
import ExpressError from "./utils/ExpressError.js";
import userRouter from "./routes/userRoutes.js";
import blogRouter from "./routes/blogRoutes.js";
import commentRouter from "./routes/commentRoutes.js";
import admin from "firebase-admin";
import serviceAccountKey from "./geeky-blogs-firebase-adminsdk-l5lq7-20cdd36165.json" assert { type: "json" };

const PORT = process.env.PORT;
const server = express();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cors());

server.use("/user", userRouter);
server.use("/blog", blogRouter);
server.use("/comment", commentRouter);

server.all("*", (req, res, next) => {
  return next(new ExpressError(`The Requested Url ${req.originalUrl} Not Found On this Server`, 404));
});

server.listen(PORT, () => {
  console.log("App Is Listening TO Port No ->", PORT);
});

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { autoIndex: true });
}

main().then(() => {
  console.log("Connected To Database SuccessFully");
});

server.use(globalErrorHandler);
