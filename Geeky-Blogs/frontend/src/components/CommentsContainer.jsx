import React from "react";
import { useBlog } from "../context/BlogContext";
import CommentField from "./CommentField";
import axios from "axios";
import NoData from "./NoData";
import PageAnimation from "../common/PageAnimation";
import CommentCard from "./CommentCard";

export async function fetchComments({ skip = 0, blog_id, setParentCommentCountFun, comment_array = null }) {
  let res;
  try {
    let response = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/comment/get-blog-comments", {
      blog_id,
      skip,
    });
    if (response?.data?.status === "success") {
      let {
        data: { comments },
      } = response;

      comments.map((comment) => {
        comment.childrenLevel = 0;
      });

      setParentCommentCountFun((prev) => prev + comments.length);

      if (comment_array === null) {
        res = { results: comments };
      } else {
        res = { results: [...comment_array, ...comments] };
      }
    }
  } catch (err) {
    console.log(err);
  }
  return res;
}

function CommentsContainer() {
  let { blog, commentsWrapper, setCommentsWrapper, totalParentCommentsLoaded, setTotalParentCommentsLoaded, setBlog } =
    useBlog();
  let {
    _id,
    title,
    comments: { results: commentsArr },
    activity: { total_parent_comments },
  } = blog;

  async function loadMoreComments() {
    let newCommentsArr = await fetchComments({
      skip: totalParentCommentsLoaded,
      blog_id: _id,
      setParentCommentCountFun: setTotalParentCommentsLoaded,
      comment_array: commentsArr,
    });

    setBlog({ ...blog, comments: newCommentsArr });
  }

  return (
    <div
      className={`max-sm:w-full fixed ${
        commentsWrapper ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]"
      } duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden`}
    >
      <div className="relative">
        <h1 className="text-xl font-medium">Comments</h1>
        <p className="text-lg mt-2 w-[70%] text-dark-grey line-clamp-1">{title}</p>
        <button
          className="absolute top-0 right-0 flex justify-center items-center w-12 h-12 rounded-full bg-grey"
          onClick={() => setCommentsWrapper((prev) => !prev)}
        >
          <i className="fi fi-br-cross text-2xl mt-1" />
        </button>
      </div>
      <hr className="border-grey my-8 w-[120%] -ml-10" />
      <CommentField action="comment" />
      {commentsArr && commentsArr.length ? (
        commentsArr.map((comment, i) => (
          <PageAnimation key={i}>
            <CommentCard index={i} leftVal={comment.childrenLevel * 4} commentData={comment} />
          </PageAnimation>
        ))
      ) : (
        <NoData message="No Comments Yet" />
      )}
      {total_parent_comments > totalParentCommentsLoaded ? (
        <button
          className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
          onClick={loadMoreComments}
        >
          Load More
        </button>
      ) : (
        ""
      )}
    </div>
  );
}

export default CommentsContainer;
