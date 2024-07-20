import jwt from "jsonwebtoken";
import userModel from "../models/userModels.js";
import driverModel from "../models/driverModel.js";

// Assuming userModel and driverModel are imported and correctly defined

export const isAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from header

  if (!token) {
    return res
      .status(401)
      .send({ success: false, message: "Unauthorized User" });
  }

  try {
    const decodeData = jwt.verify(token, process.env.JWT_SECRET);

    // Assuming decodeData._id uniquely identifies either a user or a driver
    const user = await userModel.findById(decodeData._id);
    const driver = await driverModel.findById(decodeData._id);

    if (!user && !driver) {
      return res
        .status(401)
        .send({ success: false, message: "User or Driver not found" });
    }

    // Set req.user or req.driver based on the type of decoded data
    if (user) {
      req.user = user;
    } else if (driver) {
      req.driver = driver;
    }

    next();
  } catch (error) {
    return res.status(401).send({ success: false, message: "Invalid Token" });
  }
};

// Admin Auth
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(401)
      .send({ success: false, message: "Unauthorized Admin" });
  }
  next();
};
