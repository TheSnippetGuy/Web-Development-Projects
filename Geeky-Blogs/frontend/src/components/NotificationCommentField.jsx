import { useState } from "react";
import { useUser } from "../context/UserContext";
import toast from "react-hot-toast";
import axios from "axios";

function NotificationCommentField({
  _id,
  blog_author,
  index = undefined,
  replyingTo = undefined,
  setReplying,
  notification_id,
  notificationData,
}) {
  const [comment, setComment] = useState("");

  let { _id: user_id } = blog_author;
  let {
    userAuth: { accessToken },
  } = useUser();

  let {
    notifications,
    notifications: { results },
    setNotifications,
  } = notificationData;

  async function handleComment(params) {
    if (!comment.length) {
      return toast.error("Write Something to Leave an Comment...");
    }

    try {
      let response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/comment/add-comment",
        {
          _id,
          blog_author: user_id,
          comment,
          replying_to: replyingTo,
          notification_id,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.data.status === "success") {
        setReplying(false);
        results[index].reply = { comment, _id: response.data._id };
        setNotifications({ ...notifications, results });
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
        placeholder="Leave a Reply..."
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
      ></textarea>
      <button className="btn-dark mt-5 px-10" onClick={handleComment}>
        Reply
      </button>
    </>
  );
}

export default NotificationCommentField;
