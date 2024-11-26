import React, { createContext, useEffect, useState } from "react";
import { useContext } from "react";
import { lookInSession } from "../common/session";
import { useTheme } from "./ThemeContext";

const UserContext = createContext({});

function UserContextProvider({ children }) {
  const [userAuth, setUserAuth] = useState({});

  const darkThemePreference = () => window.matchMedia("(prefers-color-scheme:dark)").matches;

  const { theme, setTheme } = useTheme(() => (darkThemePreference() ? "dark" : "light"));

  useEffect(() => {
    const userInSession = lookInSession("user");
    const themeInSession = lookInSession("theme");
    userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({ accessToken: null });

    if (themeInSession) {
      setTheme(() => {
        document.body.setAttribute("data-theme", themeInSession);
        return themeInSession;
      });
    } else {
      document.body.setAttribute("data-theme", theme);
    }
  }, []);

  return <UserContext.Provider value={{ userAuth, setUserAuth }}>{children}</UserContext.Provider>;
}

function useUser() {
  const context = useContext(UserContext);
  if (context === "undefined") {
    throw new Error("Context Was Used Outside The Provider");
  }
  return context;
}

export { UserContextProvider, useUser };
