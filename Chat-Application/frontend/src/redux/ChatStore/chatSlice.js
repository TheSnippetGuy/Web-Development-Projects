import { createSlice } from "@reduxjs/toolkit";
import { getMessages, sendMessage, getUsers } from "./chatAction";

const initialState = {
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
  },
  extraReducers: (builders) => {
    builders.addCase(getUsers.pending, (state) => {
      state.isUsersLoading = true;
    });
    builders.addCase(getUsers.fulfilled, (state, action) => {
      state.isUsersLoading = false;
      state.users = action.payload;
    });
    builders.addCase(getUsers.rejected, (state) => {
      state.isUsersLoading = false;
      state.users = [];
    });

    builders.addCase(getMessages.pending, (state) => {
      state.isMessagesLoading = true;
    });
    builders.addCase(getMessages.fulfilled, (state, action) => {
      state.isMessagesLoading = false;
      state.messages = action.payload;
    });
    builders.addCase(getMessages.rejected, (state) => {
      state.isMessagesLoading = false;
      state.messages = [];
    });
    builders.addCase(sendMessage.fulfilled, (state, action) => {
      state.messages = [...state.messages, action.payload];
    });
  },
});

export const { setSelectedUser, setMessages } = chatSlice.actions;
export default chatSlice.reducer;
