import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { toast } from "react-hot-toast";
import CommentField from "./CommentField";
import { useBlog } from "../context/BlogContext";
import axios from "axios";

function CommentCard({ index, leftVal, commentData }) {
  let {
    _id,
    commented_by: {
      personal_info: { profile_img, fullName, username: commented_by_username },
    },
    comment,
    commentedAt,
    children,
  } = commentData;

  let {
    userAuth: { accessToken, username },
  } = useUser();

  let {
    blog,
    blog: {
      comments,
      activity,
      activity: { total_parent_comments },
      comments: { results: commentsArr },
      author: {
        personal_info: { username: blog_author },
      },
    },
    setBlog,
    setTotalParentCommentsLoaded,
  } = useBlog();

  const [isReplying, setReplying] = useState(false);

  function getParentIndex() {
    let startingPoint = index - 1;
    try {
      while (commentsArr[startingPoint].childrenLevel >= commentData.childrenLevel) {
        startingPoint--;
      }
    } catch (err) {
      startingPoint = undefined;
    }
    return startingPoint;
  }

  async function loadReplies({ skip = 0, currentIndex = index }) {
    if (commentsArr[currentIndex].children.length) {
      hideReplies();
      try {
        let response = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/comment/get-replies", {
          _id: commentsArr[currentIndex]._id,
          skip,
        });
        if (response?.data?.status === "success") {
          let {
            data: { replies },
          } = response;

          commentsArr[currentIndex].isReplyLoaded = true;
          for (let i = 0; i < replies.length; i++) {
            replies[i].childrenLevel = commentsArr[currentIndex].childrenLevel + 1;
            commentsArr.splice(currentIndex + 1 + i + skip, 0, replies[i]);
          }
          setBlog({ ...blog, comments: { ...comments, results: commentsArr } });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async function handleReplyClick() {
    if (!accessToken) {
      return toast.error("Please Login To Reply to an Comment");
    }
    setReplying((prev) => !prev);
  }

  function removeCommentsCards(startingPoint, isDelete = false) {
    if (commentsArr[startingPoint]) {
      while (commentsArr[startingPoint].childrenLevel > commentData.childrenLevel) {
        commentsArr.splice(startingPoint, 1);

        if (!commentsArr[startingPoint]) {
          break;
        }
      }
    }
    if (isDelete) {
      let parentIndex = getParentIndex();

      if (parentIndex !== undefined) {
        commentsArr[parentIndex].children = commentsArr[parentIndex].children.filter((child) => child !== id);

        if (!commentsArr[parentIndex].children.length) {
          commentsArr[parentIndex].isReplyLoaded = false;
        }
      }
      commentsArr.splice(index, 1);
    }

    if (commentData.children === 0 && isDelete) {
      setTotalParentCommentsLoaded((prev) => prev - 1);
    }
    setBlog({
      ...blog,
      comments: { results: commentsArr },
      activity: {
        ...activity,
        total_parent_comments: total_parent_comments - (commentData.children === 0 && isDelete ? 1 : 0),
      },
    });
  }

  function hideReplies() {
    commentData.isReplyLoaded = false;
    removeCommentsCards(index + 1);
  }

  async function deleteComment(e) {
    e.target.setAttribute("disabled", true);
    try {
      let response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/comment/delete-comment",
        { _id },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.data.status === "success") {
        e.target.removeAttribute("disabled");
        removeCommentsCards(index + 1, true);
      }
    } catch (err) {
      console.log(err);
    }
  }

  function LoadMoreRepliesButton() {
    let parentIndex = getParentIndex();

    let button = (
      <button
        className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
        onClick={() => loadReplies({ skip: index - parentIndex, currentIndex: parentIndex })}
      >
        Load More Replies
      </button>
    );

    if (commentsArr[index + 1]) {
      if (commentsArr[index + 1].childrenLevel < commentsArr[index].childrenLevel) {
        if (index - parentIndex < commentsArr[parentIndex].children.length) {
          return button;
        }
      }
    } else {
      if (parentIndex) {
        if (index - parentIndex < commentsArr[parentIndex].children.length) {
          return button;
        }
      }
    }
  }

  return (
    <div className="w-full" style={{ paddingLeft: `${leftVal * 10}px` }}>
      <div className="my-5 p-6 rounded-md border border-grey">
        <div className="flex gap-3 items-center mb-8">
          <img src={profile_img} className="w-6 h-6 rounded-full" />
          <p className="line-clamp-1">
            {fullName} @{commented_by_username}
          </p>
          <p className="min-w-fit">
            {new Date(commentedAt).toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>
        <p className="font-gelasio text-xl ml-3">{comment}</p>
        <div className="flex items-center gap-5 mt-5">
          {commentData.isReplyLoaded ? (
            <button
              className="text-dark-grey p-2 px-3 hover:bg-grey/30  rounded-md flex items-center gap-2"
              onClick={hideReplies}
            >
              <i className="fi fi-rs-comment-dots" />
              Hide Reply
            </button>
          ) : (
            <button
              className="text-dark-grey p-2 px-3 hover:bg-grey/30  rounded-md flex items-center gap-2"
              onClick={loadReplies}
            >
              <i className="fi fi-rs-comment-dots" />
              {children.length} Load Replies
            </button>
          )}
          <button className="underline" onClick={handleReplyClick}>
            Reply
          </button>
          {(username === commented_by_username || username === blog_author) && (
            <button
              className="p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red/30 hover:text-red flex items-center"
              onClick={deleteComment}
            >
              <i className="fi fi-rr-trash pointer-events-none" />
            </button>
          )}
        </div>
        {isReplying && (
          <div className="mt-8">
            <CommentField action="reply" index={index} replyingTo={_id} setReplying={setReplying} />
          </div>
        )}
      </div>
      <LoadMoreRepliesButton />
    </div>
  );
}

export default CommentCard;
