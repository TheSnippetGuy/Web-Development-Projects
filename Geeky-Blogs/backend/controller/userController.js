import User from "../Schema/User.js";
import ExpressError from "../utils/ExpressError.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { getAuth } from "firebase-admin/auth";

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

async function generateUsername(email) {
  let username = email.split("@")[0];
  let user = await User.findOne({ "personal_info.username": username });
  return user ? (username += nanoid().substring(0, 4)) : username;
}

function formatResponse(user) {
  let accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
  return {
    accessToken,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullName: user.personal_info.fullName,
  };
}

export const signup = asyncErrorHandler(async (req, res, next) => {
  const { fullName, email, password, confirmPassword } = req.body;

  if (!email.length) {
    return next(new ExpressError("Please Enter an Email", 403));
  }

  if (!emailRegex.test(email)) {
    return next(new ExpressError("Please Enter an Valid Email", 403));
  }

  if (!passwordRegex.test(password)) {
    return next(
      new ExpressError("Password must be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters")
    );
  }

  if (password !== confirmPassword) {
    return next(new ExpressError("Password and Confirm Password Must be Same", 403));
  }

  let username = await generateUsername(email);
  let user = await User.create({ personal_info: { fullName, email, password, username } });

  user = formatResponse(user);
  return res.status(200).json({ status: "success", message: "User created SuccessFully", user });
});

export const signIn = asyncErrorHandler(async (req, res, next) => {
  let { email, password } = req.body;

  let user = await User.findOne({ "personal_info.email": email });

  if (!user) {
    return next(new ExpressError("Invalid Email Id", 404));
  }

  if (!user.googleAuth) {
    if (!(await user.comparePassword(password, user.personal_info.password))) {
      return next(new ExpressError("Incorrect Password", 403));
    }

    user = formatResponse(user);
    return res.status(200).json({ status: "success", message: "Logged In  SuccessFully", user });
  } else {
    return next(new ExpressError("Account was Created Using Google. Try Logging In With Google"));
  }
});

export const googleAuth = asyncErrorHandler(async (req, res, next) => {
  let { accessToken } = req.body;
  let decodedUser = await getAuth().verifyIdToken(accessToken);

  let { email, name, picture } = decodedUser;
  picture = picture.replace("s96-c", "s384-c");

  let user = await User.findOne({ "personal_info.email": email }).select(
    "personal_info.fullName personal_info.username personal_info.profile_img google_auth"
  );

  //Login
  if (user) {
    if (!user.google_auth) {
      return next(
        new ExpressError("This email was Signed up without google. Please Log in with Password to access The Account")
      );
    }
  } else {
    //Sign up
    let username = await generateUsername(email);
    user = await User.create({
      personal_info: { fullName: name, email, username, profile_img: picture },
      google_auth: true,
    });
  }
  user = formatResponse(user);

  return res.status(200).json({ status: "success", message: "SuccessFull", user });
});

export const searchUsers = asyncErrorHandler(async (req, res, next) => {
  let { query } = req.body;
  let users = await User.find({ "personal_info.username": new RegExp(query, "i") })
    .limit(50)
    .select("personal_info.username personal_info.fullName personal_info.profile_img");

  return res.status(200).json({ status: "success", users });
});

export const getProfile = asyncErrorHandler(async (req, res, next) => {
  let { username } = req.body;

  let user = await User.findOne({ "personal_info.username": username }).select(
    "-personal_info.password -google_auth -updatedAt -blogs"
  );

  return res.status(200).json({ status: "success", user });
});

export const changePassword = asyncErrorHandler(async (req, res, next) => {
  let { currentPassword, newPassword } = req.body;
  if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
    return next(
      new ExpressError(
        "Password must be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters",
        403
      )
    );
  }

  let user = await User.findOne({ _id: req.user });

  if (!user) {
    return next(new ExpressError("User Not Found", 404));
  }

  if (user.google_auth) {
    return next(new ExpressError("You can't Change the password because you logged in through google", 403));
  }

  if (!(await user.comparePassword(currentPassword, user.personal_info.password))) {
    return next(new ExpressError("Current Password didn't Matched", 403));
  }

  user.personal_info.password = newPassword;

  await user.save();

  return res.status(200).json({ status: "success", message: "Password Change SuccessFully" });
});

export const updateProfile = asyncErrorHandler(async (req, res, next) => {
  let { username, bio, social_links, profile_img } = req.body;

  if (username.length < 3) {
    return next(new ExpressError("Username Length Must be at least 3 characters Long", 403));
  }

  if (bio.length > 150) {
    return next(new ExpressError("Bio Should not be more than 150 characters Long"));
  }

  let socialLinkArr = Object.keys(social_links);

  for (let i = 0; i < socialLinkArr.length; i++) {
    if (social_links[socialLinkArr[i]].length) {
      let hostname = new URL(social_links[socialLinkArr[i]]).hostname;

      if (!hostname.includes(`${socialLinkArr[i]}.com`) && socialLinkArr[i] !== "website") {
        return next(new ExpressError(`${socialLinkArr[i]} link is invalid. Please Enter a Valid Link`));
      }
    }
  }

  let updateObj = {};
  if (profile_img) {
    updateObj = {
      "personal_info.username": username,
      "personal_info.bio": bio,
      "personal_info.profile_img": profile_img,
      social_links,
    };
  } else {
    updateObj = {
      "personal_info.username": username,
      "personal_info.bio": bio,
      social_links,
    };
  }
  let user = await User.findOneAndUpdate({ _id: req.user }, updateObj, { runValidators: true, new: true });

  return res.status(200).json({ status: "success", message: "Profile Updated SuccessFully", username });
});
