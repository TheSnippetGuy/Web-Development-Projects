import React, { createContext, useContext, useState } from "react";

export const blogStructure = {
  title: "",
  banner: "",
  content: [],
  tags: [],
  des: "",
  author: { personal_info: {} },
};

const EditorContext = createContext({});

function EditorContextProvider({ children }) {
  const [blog, setBlog] = useState(blogStructure);
  const [editorState, setEditorState] = useState("editor");
  const [textEditor, setTextEditor] = useState({ isReady: false });

  return (
    <EditorContext.Provider value={{ blog, setBlog, editorState, setEditorState, textEditor, setTextEditor }}>
      {children}
    </EditorContext.Provider>
  );
}

function useEditor() {
  const context = useContext(EditorContext);
  if (context === "undefined") {
    throw new Error("Context Was User Outside The Provider");
  }
  return context;
}

export { EditorContextProvider, useEditor };
