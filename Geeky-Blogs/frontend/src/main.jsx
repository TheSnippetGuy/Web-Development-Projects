import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { UserContextProvider } from "./context/UserContext.jsx";
import { EditorContextProvider } from "./context/EditorContext.jsx";
import { BlogContextProvider } from "./context/BlogContext.jsx";
import { ThemeContextProvider } from "./context/ThemeContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeContextProvider>
    <Router>
      <UserContextProvider>
        <BlogContextProvider>
          <EditorContextProvider>
            <App />
            <Toaster />
          </EditorContextProvider>
        </BlogContextProvider>
      </UserContextProvider>
    </Router>
  </ThemeContextProvider>
);
