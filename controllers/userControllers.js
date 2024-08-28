import userModel from "../models/userModels.js";
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/features.js";

//Register user
export const registerUser = async (req, res) => {
  try {
    const { fullname, email, password, phone } = req.body;

    // Validation
    if (!fullname || !email || !password || !phone) {
      return res.status(400).send({
        success: false,
        message: "Provide all Fields",
      });
    }

    // Check existing user
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "Email already exists",
      });
    }

    // Create new user
    const user = await userModel.create({
      fullname,
      email,
      password,
      phone,
    });

    res.status(201).send({
      success: true,
      message: "Registration Successful, please login",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in register API",
      error,
    });
  }
};

//Loign user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "Provide email and password",
      });
    }
    //check user
    const user = await userModel.findOne({ email });
    //validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    // check password
    const isMatch = await user.comparePassword(password);
    //validation
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid password",
      });
    }
    //token
    const token = user.generateToken();
    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        secure: process.env.NODE_ENV === "production", // Set to true only in production
        httpOnly: true, // This should generally be true for security
        sameSite: "lax", // This is a good default for most cases
      })
      .send({
        success: true,
        message: "Login Success",
        token,
        user,
      });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, message: " Error in login api", error });
  }
};

// login admin
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await userModel.findOne({ email });
    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Invalid email or not an admin" });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = user.generateToken();

    // Send response with token
    res.json({ token, message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    user.password = undefined;
    res.status(200).send({
      success: true,
      message: "User Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in profile api",
      error,
    });
  }
};

// Logout user
export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      expires: new Date(Date.now() + 1),
      secure: process.env.NODE_ENV === "development" ? true : false,
      httpOnly: process.env.NODE_ENV === "development" ? true : false,
      sameSite: process.env.NODE_ENV === "development" ? true : false,
    });
    res.status(200).send({
      success: true,
      message: "User Logged Out",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in logout api",
      error,
    });
  }
};

//update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { name, email, phone } = req.body;

    //validation update
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    //save user
    await user.save();
    res.status(200).send({
      success: true,
      message: "User Profile updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in profile api",
      error,
    });
  }
};

//update password
export const updatePassword = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(500).send({
        success: false,
        message: "Please provide old and new password",
      });
    }
    // old password check
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid old password",
      });
    }

    // new password hash
    user.password = newPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in password api",
      error,
    });
  }
};

//update profile picture
export const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .send({ success: false, message: "No file provided" });
    }

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    const file = getDataUri(req.file);

    if (user.profilePic && user.profilePic.public_id) {
      await cloudinary.uploader.destroy(user.profilePic.public_id);
    }

    const cbd = await cloudinary.v2.uploader.upload(file.content);
    if (!cbd || !cbd.public_id || !cbd.secure_url) {
      return res.status(500).send({ success: false, message: "Upload failed" });
    }

    user.profilePic = {
      public_id: cbd.public_id,
      url: cbd.secure_url,
    };

    await user.save();

    res.status(200).send({
      success: true,
      message: "Profile picture updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Upload failed",
      error,
    });
  }
};

//get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({});
    res.status(200).send({
      success: true,
      message: "All users fetched successfully",
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get all users api",
      error,
    });
  }
};

//get user by id
export const getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get user by id api",
      error,
    });
  }
};

//total number of users
export const totalUsers = async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments({});
    res.status(200).send({
      success: true,
      message: "Total number of users fetched successfully",
      totalUsers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in total users api",
      error,
    });
  }
};
