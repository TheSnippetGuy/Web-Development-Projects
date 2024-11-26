import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist/";
import storage from "redux-persist/lib/storage";
import authReducer from "./redux/AuthStore/authSlice";
import themeReducer from "./redux/ThemeStore/themeSlice";
import chatReducer from "./redux/ChatStore/chatSlice";
import socketReducer from "./redux/socketStore/socketSlice";

const rootReducer = combineReducers({
  theme: themeReducer,
  auth: authReducer,
  chat: chatReducer,
  socket: socketReducer,
});

const persistConfig = {
  key: "root",
  storage,
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
