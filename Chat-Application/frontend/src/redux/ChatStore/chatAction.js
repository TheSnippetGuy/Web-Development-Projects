import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";

export const getUsers = createAsyncThunk("chat/getUser", async () => {
  try {
    const res = await axiosInstance.get("/messages/users");
    if (res.data.status === "success") {
      return res.data.users;
    }
  } catch (error) {
    toast.error(error.response.data.message);
  }
});

export const getMessages = createAsyncThunk("chat/getMessages", async (userId) => {
  try {
    const res = await axiosInstance.get(`/messages/${userId}`);
    if (res.data.status === "success") {
      return res.data.messages;
    }
  } catch (error) {
    toast.error(error.response.data.message);
  }
});

export const sendMessage = createAsyncThunk("chat/sendMessage", async (data, { getState }) => {
  try {
    const { selectedUser } = getState().chat;

    const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, data);
    if (res.data.status === "success") {
      return res.data.newMessage;
    }
  } catch (error) {
    toast.error(error.response.data.message);
  }
});
