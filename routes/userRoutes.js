import express from "express";
import {
  registerUser,
  loginUser,
  adminLogin,
  getUserProfile,
  logoutUser,
  updateUserProfile,
  updatePassword,
  updateProfilePicture,
  getAllUsers,
  getUserById,
  totalUsers,
} from "../controllers/userControllers.js";
import { isAuth, isAdmin } from "../middleware/authMiddleware.js";
import { singleUpload } from "../middleware/multer.js";

//router object
const router = express.Router();

// routes
//register
router.post("/register", registerUser);

//login user
router.post("/login", loginUser);

//login admin
router.post("/admin/login", adminLogin);

//profile
router.get("/profile", isAuth, getUserProfile);

//logout
router.get("/logout", logoutUser);

//update profile
router.put("/profile-update", isAuth, updateUserProfile);

// update password
router.put("/update-password", isAuth, updatePassword);

//update profile picture
router.put("/update-picture", isAuth, singleUpload, updateProfilePicture);

// get all users
router.get("/get-all-users", isAuth, getAllUsers);

// get a user
router.get("/get-user/:id", isAuth, getUserById);

// get total user
router.get("/total", isAuth, isAdmin, totalUsers);

export default router;
