import Navbar from "./components/Navbar";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./redux/AuthStore/authAction";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { io } from "socket.io-client";
import { setSocket } from "./redux/socketStore/socketSlice";
import { setOnlineUsers } from "./redux/AuthStore/authSlice";

function App() {
  const { authUser, isCheckingAuth } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);
  const { socket } = useSelector((state) => state.socket);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [checkAuth]);

  useEffect(() => {
    if (authUser) {
      const socketio = io("http://localhost:3000", {
        query: {
          userId: authUser._id,
        },
      });
      dispatch(setSocket(socketio));
      socketio?.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });
      return () => socketio.close();
    } else {
      if (socket) {
        socket.close();
        dispatch(setSocket(null));
      }
    }
  }, [authUser]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }
  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
