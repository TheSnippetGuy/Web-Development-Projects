import { createContext, useContext, useState } from "react";

const ThemeContext = createContext({});

function ThemeContextProvider({ children }) {
  const [theme, setTheme] = useState("light");
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (context === "undefined") {
    throw new Error("Context Was User Outside The Provider");
  }
  return context;
}

export { ThemeContextProvider, useTheme };
