import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";

export const checkAuth = createAsyncThunk("user/checkAuth", async () => {
  try {
    const res = await axiosInstance.get("/auth/check");
    if (res.data.status === "success") {
      return res.data.user;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
  }
});

export const SignUpUser = createAsyncThunk("user/signup", async (data) => {
  try {
    let res = await axiosInstance.post("/auth/signup", data);
    toast.success("Account Created SuccessFully");
    return res.data.user;
  } catch (error) {
    toast.error(error.response.data.message);
  }
});

export const LoginUser = createAsyncThunk("user/login", async (data) => {
  try {
    let res = await axiosInstance.post("/auth/login", data);
    toast.success("Logged In SuccessFully");
    return res.data.user;
  } catch (error) {
    toast.error(error.response.data.message);
  }
});

export const updateProfile = createAsyncThunk("user/updateProfile", async (data) => {
  try {
    const res = await axiosInstance.put("/auth/update-profile", data);
    if (res.data.status === "success") {
      toast.success("Profile Updated SuccessFully");
      return res.data.user;
    }
  } catch (error) {
    toast.error(error.response.data.message);
  }
});

export const logout = createAsyncThunk("user/logout", async () => {
  try {
    let res = await axiosInstance.post("/auth/logout");
    if (res.data.status === "success") {
      toast.success("Logged Out SuccessFully");
    }
  } catch (error) {
    toast.error(error.response.data.message);
  }
});
