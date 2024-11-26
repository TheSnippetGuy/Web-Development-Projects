import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMessages } from "../redux/ChatStore/chatAction";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import useGetRealTimeMessage from "../hooks/useGetRealTimeMessage";

function ChatContainer() {
  const { messages, isMessagesLoading, selectedUser } = useSelector((state) => state.chat);

  const messageEndRef = useRef(null);

  const { authUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useGetRealTimeMessage();

  useEffect(() => {
    dispatch(getMessages(selectedUser._id));
  }, [selectedUser._id]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behaviour: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex flex-col flex-1 overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((message, index) => (
          <div
            key={index}
            className={`chat ${message?.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={message?.senderId === authUser._id ? authUser.profile_Pic || "" : selectedUser.profile_Pic || ""}
                  alt="profile picture"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">{formatMessageTime(message?.createdAt)}</time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message?.image && (
                <img src={message?.image} alt="attachment" className="sm:max-w-[200px] rounded-md mb-2" />
              )}
              {message?.text && <p>{message?.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
}

export default ChatContainer;
