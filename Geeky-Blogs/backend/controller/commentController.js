import ExpressError from "../utils/ExpressError.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import Comment from "../Schema/Comment.js";
import Blog from "../Schema/Blog.js";
import Notification from "../Schema/Notification.js";

export const addAComment = asyncErrorHandler(async (req, res, next) => {
  let user_id = req.user;
  let { _id, comment, blog_author, replying_to, notification_id } = req.body;

  if (!comment.length) {
    return next(new ExpressError("Write Something To Leave an Comment", 403));
  }

  let commentObj = { blog_id: _id, blog_author, comment, commented_by: user_id };

  if (replying_to) {
    commentObj.parent = replying_to;
    commentObj.isReply = true;
  }

  let commentFile = await Comment.create(commentObj);

  let { comment: comm, commentedAt, children } = commentFile;
  let blog = await Blog.findOneAndUpdate(
    { _id },
    {
      $push: { comments: commentFile._id },
      $inc: { "activity.total_comments": 1, "activity.total_parent_comments": replying_to ? 0 : 1 },
    },
    { new: true }
  );

  let notificationObj = {
    type: replying_to ? "reply" : "comment",
    blog: _id,
    notification_for: blog_author,
    user: user_id,
    comment: commentFile._id,
  };

  if (replying_to) {
    notificationObj.replied_on_comment = replying_to;

    let replyingToCommentDoc = await Comment.findOneAndUpdate(
      { _id: replying_to },
      { $push: { children: commentFile._id } }
    );

    notificationObj.notification_for = replyingToCommentDoc.commented_by;

    if (notification_id) {
      let notification = await Notification.findOneAndUpdate({ _id: notification_id }, { reply: commentFile._id });
    }
  }

  let notification = await Notification.create(notificationObj);

  return res
    .status(200)
    .json({ status: "success", comment: comm, commentedAt, _id: commentFile._id, user_id, children });
});

export const getBlogsComment = asyncErrorHandler(async (req, res, next) => {
  let { blog_id, skip } = req.body;
  let maxLimit = 5;

  let comments = await Comment.find({ blog_id, isReply: false })
    .populate("commented_by", "personal_info.username personal_info.fullName personal_info.profile_img")
    .skip(skip)
    .limit(maxLimit)
    .sort({ commentedAt: -1 });

  return res.status(200).json({ status: "success", comments });
});

export const getReplies = asyncErrorHandler(async (req, res, next) => {
  let { _id, skip } = req.body;
  let maxLimit = 5;

  let doc = await Comment.findOne({ _id })
    .populate({
      path: "children",
      option: {
        limit: maxLimit,
        skip: skip,
        sort: { commentedAt: -1 },
      },
      populate: {
        path: "commented_by",
        select: "personal_info.profile_img personal_info.fullName personal_info.username",
      },
      select: "-blog_id -updatedAt",
    })
    .select("children");

  return res.status(200).json({ status: "success", replies: doc.children });
});

async function deleteComments(_id) {
  let comment = await Comment.findOneAndDelete({ _id });
  if (comment.parent) {
    let data = await Comment.findOneAndUpdate({ _id: comment.parent }, { $pull: { children: _id } });
  }

  let notification = await Notification.findOneAndDelete({ comment: _id });
  let reply = await Notification.findOneAndUpdate({ reply: _id }, { $unset: { reply: 1 } });

  let blog = await Blog.findOneAndUpdate(
    { _id: comment.blog_id },
    {
      $pull: { comments: _id },
      $inc: { "activity.total_comments": -1 },
      "activity.total_parent_comments": comment.parent ? 0 : -1,
    }
  );
  if (comment.children.length) {
    comment.children.map((replies) => {
      deleteComments(replies);
    });
  }
}

export const deleteComment = asyncErrorHandler(async (req, res, next) => {
  let user_id = req.user;
  let { _id } = req.body;

  let comment = await Comment.findOne({ _id });

  if (user_id === comment.commented_by.toString() || user_id === comment.blog_author.toString()) {
    deleteComments(_id);
    return res.status(200).json({ status: "success", message: "Comment Deleted SuccessFully" });
  } else {
    return next(new ExpressError("You Cannot Delete This Comment", 403));
  }
});
