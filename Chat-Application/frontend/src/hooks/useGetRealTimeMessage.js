import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "../redux/ChatStore/chatSlice";

const useGetRealTimeMessage = () => {
  const { socket } = useSelector((state) => state.socket);
  const { messages, selectedUser } = useSelector((state) => state.chat);
  const dispatch = useDispatch();
  useEffect(() => {
    socket?.on("newMessage", (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) return;
      dispatch(setMessages([...messages, newMessage]));
    });
  }, [socket, setMessages, messages]);
};

export default useGetRealTimeMessage;
