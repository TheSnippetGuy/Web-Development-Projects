import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { Navigate, useParams } from "react-router-dom";
import BlogEditor from "../components/BlogEditor";
import PublishForm from "../components/PublishForm";
import { useEditor } from "../context/EditorContext";
import Loader from "../components/Loader";
import axios from "axios";

function Editor() {
  let { userAuth } = useUser();
  let { accessToken } = userAuth;
  let { editorState, blog, setBlog } = useEditor();
  let { blog_id } = useParams();
  const [loading, setLoading] = useState(true);

  async function fetchBlog() {
    try {
      let response = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/blog/get-blog", {
        blog_id,
        draft: true,
        mode: "edit",
      });

      if (response?.data?.status === "success") {
        setBlog(response?.data?.blog);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setBlog(null);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!blog_id) {
      return setLoading(false);
    }
    fetchBlog();
  }, []);

  return accessToken === null ? (
    <Navigate to="/signin" />
  ) : loading ? (
    <Loader />
  ) : editorState === "editor" ? (
    <BlogEditor />
  ) : (
    <PublishForm />
  );
}

export default Editor;
