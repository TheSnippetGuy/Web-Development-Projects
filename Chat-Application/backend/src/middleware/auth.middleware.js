import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectedRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ status: "Error", message: "UnAuthorized.Token Not Found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      return res.status(401).json({ status: "Error", message: "UnAuthorized. Invalid Or Expired Token" });
    }
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ status: "Error", message: "User Not Found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
