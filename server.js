import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
//routes imports
import userRoutes from "./routes/userRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import connectDB from "./config/db.js";

//dot env configuration
dotenv.config();

// database configuration
connectDB();

//cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  api_key: process.env.ClOUDINARY_API_KEY,
});

// console.log(process.env.CLOUDINARY_NAME);
// console.log(process.env.CLOUDINARY_API_SECRET);
// console.log(process.env.ClOUDINARY_API_KEY);

//rest object
const app = express();

//midlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use(cookieParser());

//route
app.use("/user", userRoutes);
app.use("/driver", driverRoutes);

app.get("/", (req, res) => {
  return res.status(200).send("Hello, world!");
});

//port
const Port = process.env.PORT || 8080;

//listen
app.listen(Port, () => {
  console.log(
    `listening on port ${process.env.PORT} on ${process.env.NODE_ENV} Mode`
  );
});
