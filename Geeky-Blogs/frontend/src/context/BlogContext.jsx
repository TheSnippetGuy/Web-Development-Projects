import React, { createContext, useContext, useState } from "react";

const BlogContext = createContext({});
export const blogStructure = {
  title: "",
  des: "",
  banner: "",
  content: [],
  tags: [],
  activity: {},
  author: { personal_info: {} },
  publishedAt: "",
};

function BlogContextProvider({ children }) {
  let [blog, setBlog] = useState(blogStructure);
  const [isLikedByUser, setLikedByUser] = useState(false);
  let [commentsWrapper, setCommentsWrapper] = useState(true);
  let [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);

  return (
    <BlogContext.Provider
      value={{
        blog,
        setBlog,
        isLikedByUser,
        setLikedByUser,
        commentsWrapper,
        setCommentsWrapper,
        totalParentCommentsLoaded,
        setTotalParentCommentsLoaded,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
}

function useBlog() {
  const context = useContext(BlogContext);
  if (context === "undefined") {
    throw new Error("Context was Used Outside The Provider");
  }
  return context;
}

export { BlogContextProvider, useBlog };
