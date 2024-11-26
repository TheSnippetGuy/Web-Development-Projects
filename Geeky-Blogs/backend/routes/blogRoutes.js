import express from "express";
import {
  allLatestBlogCount,
  createBlog,
  deleteBlog,
  getBlog,
  getLatestBlog,
  getTrendingBlogs,
  isLikedByUser,
  likeBlog,
  searchBlogs,
  searchBlogsCount,
  userWrittenBlogs,
  userWrittenBlogsCount,
} from "../controller/blogController.js";
import { verifyJWT } from "./userRoutes.js";
const router = express.Router();

router.route("/create-blog").post(verifyJWT, createBlog);
router.route("/latest-blogs").post(getLatestBlog);
router.route("/trending-blogs").get(getTrendingBlogs);
router.route("/search-blogs").post(searchBlogs);
router.route("/all-latest-blogs-count").post(allLatestBlogCount);
router.route("/search-blogs-count").post(searchBlogsCount);
router.route("/get-blog").post(getBlog);
router.route("/like-blog").post(verifyJWT, likeBlog);
router.route("/isLiked-by-user").post(verifyJWT, isLikedByUser);
router.route("/user-written-blogs").post(verifyJWT, userWrittenBlogs);
router.route("/user-written-blogs-count").post(verifyJWT, userWrittenBlogsCount);
router.route("/delete-blog").post(verifyJWT, deleteBlog);

export default router;
