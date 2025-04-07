import dotenv from "dotenv";
import cors from "cors";
import express, { Request, Response } from "express";
import { connectDB } from "./config/db";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use("/", (req: Request, res: Response) => {
  res.json("Application is running!!!");
});

connectDB();
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
