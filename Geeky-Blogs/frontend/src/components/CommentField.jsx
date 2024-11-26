import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import toast from "react-hot-toast";
import axios from "axios";
import { useBlog } from "../context/BlogContext";

function CommentField({ action, index = undefined, replyingTo = undefined, setReplying }) {
  const [comment, setComment] = useState("");

  let {
    blog,
    blog: {
      _id,
      author: { _id: blog_author },
      comments,
      comments: { results: commentsArr },
      activity,
      activity: { total_comments, total_parent_comments },
    },
    setTotalParentCommentsLoaded,
    setBlog,
  } = useBlog();

  let {
    userAuth: { accessToken, username, fullName, profile_img },
  } = useUser();

  async function handleComment() {
    if (!accessToken) {
      return toast.error("Please Login To Comment on This Blog");
    }
    if (!comment.length) {
      return toast.error("Write Something to Leave an Comment...");
    }

    try {
      let response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/comment/add-comment",
        {
          _id,
          blog_author,
          comment,
          replying_to: replyingTo,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response?.data?.status === "success") {
        let { data } = response;

        console.log(response);

        setComment("");
        data.commented_by = { personal_info: { username, profile_img, fullName } };

        let newCommentArr;

        if (replyingTo) {
          commentsArr[index].children.push(data._id);
          data.childrenLevel = commentsArr[index].childrenLevel + 1;
          data.parentIndex = index;
          commentsArr[index].isReplyLoaded = true;

          commentsArr.splice(index + 1, 0, data);
          newCommentArr = commentsArr;
          setReplying(false);
        } else {
          data.childrenLevel = 0;
          newCommentArr = [data, ...commentsArr];
        }

        let parentalCommentIncrementVal = replyingTo ? 0 : 1;
        setBlog({
          ...blog,
          comments: { ...comments, results: newCommentArr },
          activity: {
            ...activity,
            total_comments: total_comments + 1,
            total_parent_comments: total_parent_comments + parentalCommentIncrementVal,
          },
        });

        setTotalParentCommentsLoaded((prev) => prev + parentalCommentIncrementVal);
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Leave a Comment..."
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
      ></textarea>
      <button className="btn-dark mt-5 px-10" onClick={handleComment}>
        {action}
      </button>
    </>
  );
}

export default CommentField;
