import driverModel from "../models/driverModel.js";
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/features.js";

//Register diver
export const registerDriver = async (req, res) => {
  try {
    const { name, email, password, phone, age } = req.body;
    //validation`
    if (!name || !email || !password || !phone || !age) {
      return res.status(500)({
        success: false,
        message: "Provide all Fields",
      });
    }

    // Check if age is 21 and above
    if (age < 21) {
      return res.status(400).json({
        success: false,
        message: "Driver must be at least 21 years old",
      });
    }

    // check existing driver
    const existingDriver = await driverModel.findOne({ email });
    //validation
    if (existingDriver) {
      return res.status(500).send({
        success: false,
        message: "Email already exists",
      });
    }
    // create new driver
    const driver = await driverModel.create({
      name,
      email,
      password,
      phone,
      age,
    });
    res.status(201).send({
      success: true,
      message: "Registration Sucess please login",
      driver,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, message: " Error in register api", error });
  }
};

//Loign user
export const loginDriver = async (req, res) => {
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
    const driver = await driverModel.findOne({ email });
    //validation
    if (!driver) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    // check password
    const isMatch = await driver.comparePassword(password);
    //validation
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid password",
      });
    }
    //token
    const token = driver.generateToken();
    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
        sameSite: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Login Sucess",
        token,
        driver,
      });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, message: " Error in login api", error });
  }
};

// Get User Profile
export const getDriverProfile = async (req, res) => {
  try {
    const driver = await driverModel.findById(req.driver._id);
    driver.password = undefined;
    res.status(200).send({
      success: true,
      message: "Driver Profile fetched successfully",
      driver,
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
export const logoutDriver = async (req, res) => {
  try {
    res.clearCookie("token", {
      expires: new Date(Date.now() + 1),
      secure: process.env.NODE_ENV === "development" ? true : false,
      httpOnly: process.env.NODE_ENV === "development" ? true : false,
      sameSite: process.env.NODE_ENV === "development" ? true : false,
    });
    res.status(200).send({
      success: true,
      message: "Driver Logged Out",
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
export const updateDriverProfile = async (req, res) => {
  try {
    const driver = await driverModel.findById(req.driver._id);
    const { name, email, phone, age } = req.body;

    //validation update
    if (name) driver.name = name;
    if (email) driver.email = email;
    if (phone) driver.phone = phone;
    if (age) driver.age = age;

    //save driver
    await driver.save();
    res.status(200).send({
      success: true,
      message: "Driver Profile updated successfully",
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
    const driver = await driverModel.findById(req.driver._id);
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(500).send({
        success: false,
        message: "Please provide old and new password",
      });
    }
    // old password check
    const isMatch = await driver.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid old password",
      });
    }

    // new password hash
    driver.password = newPassword;
    await driver.save();
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
    const driver = await driverModel.findById(req.driver._id);
    // file get from client photo
    const file = getDataUri(req.file);

    // Check if driver already has a profile picture
    if (driver.profilePic && driver.profilePic.public_id) {
      // Delete previous profile picture from Cloudinary
      await cloudinary.uploader.destroy(driver.profilePic.public_id);
    }

    // upload new photo
    const cbd = await cloudinary.v2.uploader.upload(file.content);
    driver.profilePic = {
      public_id: cbd.public_id,
      url: cbd.secure_url,
    };
    //save function
    await driver.save();
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

// export driver license
export const updateDriverLicense = async (req, res) => {
  try {
    const driver = await driverModel.findById(req.driver._id);
    // file get from client photo
    const file = getDataUri(req.file);

    // Check if driver already has a profile picture
    if (driver.driverLicense && driver.driverLicense.public_id) {
      // Delete previous profile picture from Cloudinary
      await cloudinary.uploader.destroy(driver.profilePic.public_id);
    }

    // upload new photo
    const cbd = await cloudinary.v2.uploader.upload(file.content);
    driver.driverLicense = {
      public_id: cbd.public_id,
      url: cbd.secure_url,
    };
    //save function
    await driver.save();
    res.status(200).send({
      success: true,
      message: "Driver License updated successfully",
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
