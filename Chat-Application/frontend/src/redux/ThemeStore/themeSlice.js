import { createSlice } from "@reduxjs/toolkit";

let initialState = { theme: localStorage.getItem("chat-theme") || "coffee" };

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      localStorage.setItem("chat-theme", action.payload);
      state.theme = action.payload;
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
