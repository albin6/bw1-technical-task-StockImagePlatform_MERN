import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import express, { Request, Response } from "express";

import { connectDB } from "./config/db";
import { errorHandler } from "./middlewares/error-handler.middleware";
import authRoutes from "./routes/auth.route";
import imageRoutes from "./routes/image.route";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

app.use("/", (req: Request, res: Response) => {
  res.json("Application is running!!!");
});

app.use("/api/auth", authRoutes);
app.use("/api/img", imageRoutes);

app.use(errorHandler);

connectDB();
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
