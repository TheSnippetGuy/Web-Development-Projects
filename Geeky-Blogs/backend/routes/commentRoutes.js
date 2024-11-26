import express from "express";
import { verifyJWT } from "./userRoutes.js";
import { addAComment, deleteComment, getBlogsComment, getReplies } from "../controller/commentController.js";
const router = express.Router();

router.route("/add-comment").post(verifyJWT, addAComment);
router.route("/get-blog-comments").post(getBlogsComment);
router.route("/get-replies").post(getReplies);
router.route("/delete-comment").post(verifyJWT, deleteComment);

export default router;
