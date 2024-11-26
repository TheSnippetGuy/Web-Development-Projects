import { Link } from "react-router-dom";
import { useState } from "react";
import NotificationCommentField from "./NotificationCommentField";
import { useUser } from "../context/UserContext";
import axios from "axios";

function NotificationCard({ data, index, notificationState }) {
  let [isReplying, setIsReplying] = useState(false);

  let {
    seen,
    type,
    reply,
    createdAt,
    comment,
    replied_on_comment,
    user,
    user: {
      personal_info: { fullName, username, profile_img },
    },
    blog: { _id, blog_id, title },
    _id: notification_id,
  } = data;

  let { userAuth } = useUser();
  let { username: author_username, profile_img: author_profile_img, accessToken } = userAuth;

  let {
    notifications,
    notifications: { results, totalDocs },
    setNotifications,
  } = notificationState;

  function handleReply() {
    setIsReplying((prevVal) => !prevVal);
  }

  async function handleDelete(comment_id, type, target) {
    target.setAttribute("disabled", true);
    try {
      let response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/comment/delete-comment",
        {
          _id: comment_id,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.status === "success") {
        if (type === "comment") {
          results.splice(index, 1);
        } else {
          delete results[index].reply;
        }
        target.removeAttribute("disabled");
        setNotifications({
          ...notifications,
          results,
          totalDocs: totalDocs - 1,
          deleteCount: notifications.deleteCount + 1,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className={`p-6 border-b border-grey border-l-black ${!seen ? "border-l-2" : ""} `}>
      <div className="flex gap-5 mb-3">
        <img src={profile_img} className="w-14 h-14 flex-none rounded-full" />
        <div className="w-full">
          <h1 className="font-medium text-xl text-dark-grey">
            <span className="lg:inline-block hidden capitalize">{fullName} </span>
            <Link to={`/user/${username}`} className="mx-1 text-black underline">
              @{username}{" "}
            </Link>
            <span className="font-normal">
              {type === "like" ? " Liked Your Blog" : type === "comment" ? " Commented on Your Blog" : " replied on"}
            </span>
          </h1>
          {type === "reply" ? (
            <div className="p-4 mt-4 rounded-md bg-grey">
              <p>{replied_on_comment.comment}</p>
            </div>
          ) : (
            <Link
              to={`/blog/${blog_id}`}
              className="font-medium text-dark-grey hover:underline line-clamp-1"
            >{`"${title}"`}</Link>
          )}
        </div>
      </div>
      {type !== "like" ? <p className="ml-14 pl-5 font-gelasio text-xl my-5">{comment.comment}</p> : ""}
      <div className="ml-14 pl-5 mt-5 text-dark-grey flex gap-8">
        <p>{new Date(createdAt).toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric" })}</p>
        {type !== "like" ? (
          <>
            {!reply ? (
              <button className="underline hover:text-black" onClick={handleReply}>
                Reply
              </button>
            ) : (
              ""
            )}
            <button
              className="underline hover:text-black"
              onClick={(e) => handleDelete(comment._id, "comment", e.target)}
            >
              Delete
            </button>
          </>
        ) : (
          ""
        )}
      </div>
      {isReplying ? (
        <div className="mt-8">
          <NotificationCommentField
            _id={_id}
            blog_author={user}
            index={index}
            replyingTo={comment._id}
            setReplying={setIsReplying}
            notification_id={notification_id}
            notificationData={notificationState}
          />
        </div>
      ) : (
        ""
      )}

      {reply ? (
        <div className="ml-20 p-5 bg-grey mt-5 rounded-md">
          <div className="flex gap-3 mb-3">
            <img src={author_profile_img} className="w-8 h-8 rounded-full" />
            <div>
              <h1 className="font-medium text-xl text-dark-grey">
                <Link to={`/user/${author_username}`} className="mx-1 text-black underline">
                  @{author_username}
                </Link>
                <span className="font-normal">replied to</span>
                <Link to={`/user/${username}`} className="mx-1 text-black underline">
                  @{username}
                </Link>
              </h1>
            </div>
          </div>
          <p className="ml-14 font-gelasio text-xl my-2">{reply.comment}</p>

          <button
            className="underline hover:text-black ml-14 mt-2"
            onClick={(e) => handleDelete(comment._id, "reply", e.target)}
          >
            Delete
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default NotificationCard;
