import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import Notification from "../Schema/Notification.js";
import ExpressError from "../utils/ExpressError.js";

export const getNotification = asyncErrorHandler(async (req, res, next) => {
  let user_id = req.user;

  let notification = Notification.exists({ notification_for: user_id, seen: false, user: { $ne: user_id } });

  if (notification) {
    return res.status(200).json({ new_notification_available: true });
  } else {
    return res.status(200).json({ new_notification_available: false });
  }
});

export const newNotification = asyncErrorHandler(async (req, res, next) => {
  let user_id = req.user;
  let notification = await Notification.findOne({ notification_for: user_id, seen: false, user: { $ne: user_id } });

  if (notification) {
    return res.status(200).json({ status: "success", new_notification_available: true });
  } else {
    return res.status(200).json({ status: "success", new_notification_available: false });
  }
});

export const notificationByFilter = asyncErrorHandler(async (req, res) => {
  let user_id = req.user;
  let { page, filter, deletedDocCount } = req.body;
  let maxLimit = 10;
  let findQuery = { notification_for: user_id, user: { $ne: user_id } };
  let skipDocs = (page - 1) * maxLimit;
  if (filter !== "all") {
    findQuery.type = filter;
  }
  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }

  let notifications = await Notification.find(findQuery)
    .skip(skipDocs)
    .limit(maxLimit)
    .populate("blog", "title blog_id")
    .populate("user", "personal_info.fullName personal_info.username personal_info.profile_img")
    .populate("comment", "comment")
    .populate("replied_on_comment", "comment")
    .populate("reply", "comment")
    .sort({ createdAt: -1 })
    .select("createdAt type seen reply");

  let notify = await Notification.updateMany(findQuery, { seen: true }).skip(skipDocs).limit(maxLimit);

  return res.status(200).json({ status: "success", notifications });
});

export const allNotificationCount = asyncErrorHandler(async (req, res) => {
  let user_id = req.user;
  let { filter } = req.body;
  let findQuery = { notification_for: user_id, user: { $ne: user_id } };
  if (filter !== "all") {
    findQuery.type = filter;
  }

  let count = await Notification.countDocuments(findQuery);

  return res.status(200).json({ status: "success", totalDocs: count });
});
