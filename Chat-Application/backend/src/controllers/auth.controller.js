import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";

export const signup = async (req, res) => {
  const { email, fullName, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ status: "Error", message: "All Fields are Required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ status: "Error", message: "Password Length Must be Greater than 6 Characters" });
    }
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ status: "Error", message: "Email Already Exists" });
    }
    user = await User.create({ fullName, email, password });

    generateToken(user.id, res);

    return res.status(201).json({
      status: "success",
      user: {
        _id: user._id,
        fullName: user.fullName,
        profile_Pic: user.profile_Pic,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  let { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password, user.password))) {
      return res.status(400).json({ status: "Error", message: "Invalid Credentials" });
    }
    generateToken(user.id, res);
    return res.status(201).json({
      status: "success",
      user: {
        _id: user._id,
        fullName: user.fullName,
        profile_Pic: user.profile_Pic,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ status: "success", message: "Logged Out SuccessFully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profile_Pic } = req.body;
    const userId = req.user.id;
    if (!profile_Pic) {
      return req.status(400).json({ status: "Error", message: "Profile Pic is Required" });
    }
    const uploadResponse = await cloudinary.uploader.upload(profile_Pic);
    const updatedUser = await User.findByIdAndUpdate(userId, { profile_Pic: uploadResponse.secure_url }, { new: true });

    return res
      .status(200)
      .json({ status: "success", message: "Profile Picture Updated SuccessFully", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    return res.status(200).json({ status: "success", user: req.user });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
