import jwt from "jsonwebtoken";
import userModel from "../models/userModels.js";
import driverModel from "../models/driverModel.js";

//User Auth
export const isAuth = async (req, res, next) => {
  const { token } = req.cookies;
  //validation
  if (!token) {
    return res.status(401).send({
      success: false,
      message: "Unauthorized User",
    });
  }
  const decodeData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await userModel.findById(decodeData._id);
  req.driver = await driverModel.findById(decodeData._id);
  next();
};

//Admin Auth
export const isAdmin = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(401).send({
      success: false,
      message: "Unauthorized Admin",
    });
  }
  next();
};
