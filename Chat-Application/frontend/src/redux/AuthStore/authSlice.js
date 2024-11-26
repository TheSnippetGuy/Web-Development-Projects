import { createSlice } from "@reduxjs/toolkit";
import { checkAuth, LoginUser, logout, SignUpUser, updateProfile } from "./authAction.js";

const initialState = {
  authUser: null,
  isCheckingAuth: true,
  isLoggingIng: false,
  isUpdatingProfile: false,
  isSigningUp: false,
  onlineUsers: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
  },
  extraReducers: (builders) => {
    builders.addCase(checkAuth.pending, (state) => {
      state.isCheckingAuth = true;
      state.authUser = null;
      state.isLoggingIng = false;
    });
    builders.addCase(checkAuth.fulfilled, (state, action) => {
      state.isCheckingAuth = false;
      state.authUser = action.payload || null;
    });
    builders.addCase(checkAuth.rejected, (state) => {
      state.isCheckingAuth = false;
      state.authUser = null;
    });

    builders.addCase(SignUpUser.pending, (state) => {
      state.isSigningUp = true;
    });
    builders.addCase(SignUpUser.fulfilled, (state, action) => {
      state.isSigningUp = false;
      state.authUser = action.payload;
    });
    builders.addCase(SignUpUser.rejected, (state) => {
      state.isSigningUp = false;
      state.authUser = null;
    });

    builders.addCase(logout.fulfilled, (state) => {
      state.authUser = null;
    });

    builders.addCase(LoginUser.pending, (state) => {
      state.isLoggingIng = true;
    });
    builders.addCase(LoginUser.fulfilled, (state, action) => {
      state.isLoggingIng = false;
      state.authUser = action.payload;
    });
    builders.addCase(LoginUser.rejected, (state) => {
      state.isLoggingIng = false;
    });

    builders.addCase(updateProfile.pending, (state) => {
      state.isUpdatingProfile = true;
    });
    builders.addCase(updateProfile.fulfilled, (state, action) => {
      state.isUpdatingProfile = false;
      state.authUser = action.payload;
    });
    builders.addCase(updateProfile.rejected, (state) => {
      state.isUpdatingProfile = false;
    });
  },
});

export const { setOnlineUsers } = authSlice.actions;

export default authSlice.reducer;
