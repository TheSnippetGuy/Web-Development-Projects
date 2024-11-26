import React, { useEffect } from "react";
import { useBlog } from "../context/BlogContext";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import toast from "react-hot-toast";
import axios from "axios";

function BlogInteraction() {
  let {
    blog,
    blog: {
      _id,
      title,
      blog_id,
      activity,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username: author_username },
      },
    },
    setBlog,
    isLikedByUser,
    setLikedByUser,
    commentsWrapper,
    setCommentsWrapper,
  } = useBlog();

  let {
    userAuth: { username, accessToken },
  } = useUser();

  async function handleLike() {
    if (accessToken) {
      setLikedByUser((prev) => !prev);
      !isLikedByUser ? total_likes++ : total_likes--;
      setBlog({ ...blog, activity: { ...activity, total_likes } });

      try {
        let response = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/blog/like-blog",
          { _id, isLikedByUser },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response?.data?.status === "success") {
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      return toast.error("Please Login To Like This Blog");
    }
  }

  async function isLiked() {
    try {
      let response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blog/isLiked-by-user",
        { _id },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (response?.data?.status === "success") {
        setLikedByUser(Boolean(response?.data?.notification));
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    isLiked();
  }, []);

  return (
    <>
      <hr className="border-grey my-2" />
      <div className="flex gap-6 justify-between">
        <div className="flex gap-3 items-center">
          <button
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isLikedByUser ? " bg-red/20 text-red" : "bg-grey/80"
            }`}
            onClick={handleLike}
          >
            <i className={`fi fi-${isLikedByUser ? "sr-heart" : "rr-hear t"}`} />
          </button>
          <p className="text-xl text-dark-grey">{total_likes}</p>

          <button
            className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80"
            onClick={() => setCommentsWrapper((prev) => !prev)}
          >
            <i className="fi fi-rr-comment-dots" />
          </button>
          <p className="text-xl text-dark-grey">{total_comments}</p>
        </div>

        <div className="flex gap-6 items-center">
          {username === author_username && (
            <Link to={`/editor/${blog_id}`} className="underline hover:text-purple">
              Edit
            </Link>
          )}
          <Link to={`https://twitter.com/intent/tweet?text=Read ${title}}&url=${location.href}`}>
            <i className="fi fi-brands-twitter text-xl hover:text-twitter" />
          </Link>
        </div>
      </div>
      <hr className="border-grey my-2" />
    </>
  );
}

export default BlogInteraction;
