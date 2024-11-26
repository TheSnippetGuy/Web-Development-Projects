import ExpressError from "../utils/ExpressError.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import User from "../Schema/User.js";
import Blog from "../Schema/Blog.js";
import Notification from "../Schema/Notification.js";
import { nanoid } from "nanoid";
import Comment from "../Schema/Comment.js";

export const createBlog = asyncErrorHandler(async (req, res, next) => {
  let authorId = req.user;
  let { title, des, banner, content, tags, draft, id } = req.body;

  if (!title.length) {
    return next(new ExpressError("You Must Provide a Title For an Blog", 403));
  }

  if (!draft) {
    if (!des.length || des.length > 200) {
      return next(new ExpressError("You Must Provide a Description For an Blog under 200 characters", 403));
    }

    if (!banner.length) {
      return next(new ExpressError("You Must Provide a Banner For an Blog", 403));
    }

    if (!content.blocks.length) {
      return next(new ExpressError("You Must Provide Some Content For Blog To Publish It", 403));
    }

    if (!tags.length || tags.length > 10) {
      return next(new ExpressError("Please Provide a Tag maximum 10 For Your Content To Publish and Rank"));
    }
  }

  tags = tags.map((tag) => tag.toLowerCase());
  let blog_id =
    id ||
    title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s/g, "-")
      .trim() + nanoid();

  if (id) {
    let blog = await Blog.findOneAndUpdate(
      { blog_id },
      { title, des, banner, content, tags, draft: draft ? draft : false },
      { new: true }
    );

    return res.status(200).json({ status: "success", message: "Blog Updated SuccessFully", id: blog_id });
  } else {
    let blog = await Blog.create({
      title,
      banner,
      des,
      content,
      tags,
      author: authorId,
      blog_id,
      draft: Boolean(draft),
    });

    let incrementVal = draft ? 0 : 1;

    let user = await User.findByIdAndUpdate(authorId, {
      $inc: { "account_info.total_post": incrementVal },
      $push: { blogs: blog._id },
    });

    return res.status(201).json({ status: "success", message: "Blog Published SuccessFully", id: blog.blog_id });
  }
});

export const getLatestBlog = asyncErrorHandler(async (req, res, next) => {
  let { page } = req.body;

  let blogs = await Blog.find({ draft: false })
    .populate("author", "personal_info.fullName personal_info.username personal_info.profile_img -_id")
    .sort({ publishedAt: -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .limit(5)
    .skip((page - 1) * 5);

  return res.status(200).json({ status: "success", blogs });
});

export const getTrendingBlogs = asyncErrorHandler(async (req, res, next) => {
  let blogs = await Blog.find({ draft: false })
    .populate("author", "personal_info.fullName personal_info.username personal_info.profile_img -_id")
    .sort({ "activity.total_reads": -1, "activity.total_likes": -1, publishedAt: -1 })
    .select("blog_id title publishedAt -_id")
    .limit(5);

  return res.status(200).json({ status: "success", blogs });
});

export const searchBlogs = asyncErrorHandler(async (req, res, next) => {
  let { tag, page, query, author, limit, eliminate_blog } = req.body;
  let findQuery;
  let maxLimit = limit ? limit : 5;

  if (tag) {
    findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { author, draft: false };
  }

  let blogs = await Blog.find(findQuery)
    .populate("author", "personal_info.fullName personal_info.username personal_info.profile_img -_id")
    .sort({ publishedAt: -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .limit(maxLimit)
    .skip((page - 1) * maxLimit);

  return res.status(200).json({ status: "success", blogs });
});

export const allLatestBlogCount = asyncErrorHandler(async (req, res, next) => {
  let count = await Blog.countDocuments({ draft: false });
  return res.status(200).json({ status: "success", totalDocs: count });
});

export const searchBlogsCount = asyncErrorHandler(async (req, res, next) => {
  let { tag, query, author } = req.body;
  let findQuery;
  if (tag) {
    findQuery = { tags: tag, draft: false };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { author, draft: false };
  }
  let count = await Blog.countDocuments(findQuery);
  return res.status(200).json({ status: "success", totalDocs: count });
});

export const getBlog = asyncErrorHandler(async (req, res, next) => {
  let { blog_id, draft, mode } = req.body;
  let incrementVal = mode !== "edit" ? 1 : 0;
  let blog = await Blog.findOneAndUpdate({ blog_id }, { $inc: { "activity.total_reads": incrementVal } }, { new: true })
    .populate("author", "personal_info.fullName personal_info.username personal_info.profile_img")
    .select("title des content banner activity publishedAt blog_id tags");
  let user = await User.findOneAndUpdate(
    { "personal_info.username": blog.author.personal_info.username },
    { $inc: { "account_info.total_reads": incrementVal } },
    { new: true }
  );

  if (!blog) {
    return next(new ExpressError("No Blog Found With This Id", 404));
  }

  if (blog.draft && !draft) {
    return next(new ExpressError("You Cannot Access Draft Blog", 403));
  }

  if (!user) {
    return next(new ExpressError("No Author Found", 404));
  }

  return res.status(200).json({
    status: "success",
    blog,
  });
});

export const likeBlog = asyncErrorHandler(async (req, res, next) => {
  let user_id = req.user;
  let { _id, isLikedByUser } = req.body;
  let incrementVal = !isLikedByUser ? 1 : -1;

  let blog = await Blog.findOneAndUpdate({ _id }, { $inc: { "activity.total_likes": incrementVal } }, { new: true });

  if (!isLikedByUser) {
    let notification = await Notification.create({
      type: "like",
      blog: _id,
      notification_for: blog.author,
      user: user_id,
    });
    return res.status(200).json({ status: "success", liked_by_user: true });
  } else {
    let notification = await Notification.findOneAndDelete({ user: user_id, blog: _id, type: "like" }, { new: true });
    return res.status(200).json({ status: "success", liked_by_user: false });
  }
});

export const isLikedByUser = asyncErrorHandler(async (req, res, next) => {
  let user_id = req.user;
  let { _id } = req.body;

  let notification = await Notification.exists({ user: user_id, type: "like", blog: _id });

  return res.status(200).json({ status: "success", notification });
});

export const userWrittenBlogs = asyncErrorHandler(async (req, res, next) => {
  let user_id = req.user;
  let { page, draft, query, deletedDocCount } = req.body;
  let maxLimit = 5;
  let skipDocs = (page - 1) * maxLimit;

  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }

  const blogs = await Blog.find({ author: user_id, draft, title: new RegExp(query, "i") })
    .skip(skipDocs)
    .limit(maxLimit)
    .sort({ publishedAt: -1 })
    .select("title banner publishedAt blog_id activity des draft -_id");

  return res.status(200).json({ status: "success", blogs });
});

export const userWrittenBlogsCount = asyncErrorHandler(async (req, res, next) => {
  let user_id = req.user;
  let { draft, query } = req.body;
  let count = await Blog.countDocuments({ author: user_id, draft, title: new RegExp(query, "i") });

  return res.status(200).json({ status: "success", totalDocs: count });
});

export const deleteBlog = asyncErrorHandler(async (req, res, next) => {
  let user_id = req.user;
  let { blog_id } = req.body;

  let blog = await Blog.findOneAndDelete({ blog_id });
  let notification = await Notification.deleteMany({ blog: blog._id });
  let comment = await Comment.deleteMany({ blog_id: blog._id });
  let user = await User.findOneAndUpdate(
    { _id: user_id },
    { $pull: { blog: blog._id }, $inc: { "account_info.total_posts": -1 } }
  );
  return res.status(200).json({ status: "success", message: "Blog Deleted SuccessFully" });
});
