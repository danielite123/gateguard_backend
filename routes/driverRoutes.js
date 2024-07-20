import express from "express";
import {
  registerDriver,
  loginDriver,
  getDriverProfile,
  logoutDriver,
  updateDriverProfile,
  updatePassword,
  updateProfilePicture,
  updateDriverLicense,
  getAllDrivers,
  totalDrivers,
} from "../controllers/driverControllers.js";
import { isAdmin, isAuth } from "../middleware/authMiddleware.js";
import { singleUpload } from "../middleware/multer.js";

//router object
const router = express.Router();

// routes
//register
router.post("/register", registerDriver);

//login
router.post("/login", loginDriver);

//profile
router.get("/profile", isAuth, getDriverProfile);

//logout
router.get("/logout", isAuth, logoutDriver);

//update profile
router.put("/profile-update", isAuth, updateDriverProfile);

// update password
router.put("/update-password", isAuth, updatePassword);

//update profile picture
router.put("/update-picture", isAuth, singleUpload, updateProfilePicture);

// update driver license
router.put("/update-license", isAuth, singleUpload, updateDriverLicense);

// get all users
router.get("/get-all-drivers", isAuth, isAdmin, getAllDrivers);

// get total driver
router.get("/total", isAuth, isAdmin, totalDrivers);

export default router;
