import express from "express";
import {
  changePassword,
  getProfile,
  googleAuth,
  searchUsers,
  signIn,
  signup,
  updateProfile,
} from "../controller/userController.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import ExpressError from "../utils/ExpressError.js";
import jwt from "jsonwebtoken";
import {
  allNotificationCount,
  getNotification,
  newNotification,
  notificationByFilter,
} from "../controller/notificationController.js";

const router = express.Router();

export const verifyJWT = asyncErrorHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (token === null) {
    return next(new ExpressError("No Access Token", 403));
  }

  let decodeUser = await jwt.verify(token, process.env.JWT_SECRET_KEY);

  if (!decodeUser) {
    return next(new ExpressError("Access Token is Invalid", 403));
  }

  req.user = decodeUser.id;
  next();
});

router.route("/signup").post(signup);
router.route("/signin").post(signIn);
router.route("/google-auth").post(googleAuth);
router.route("/search-users").post(searchUsers);
router.route("/get-profile").post(getProfile);
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/update-profile").post(verifyJWT, updateProfile);
router.route("/get-notification").get(verifyJWT, getNotification);
router.route("/new-notification").get(verifyJWT, newNotification);
router.route("/notifications").post(verifyJWT, notificationByFilter);
router.route("/all-notifications-count").post(verifyJWT, allNotificationCount);

export default router;
