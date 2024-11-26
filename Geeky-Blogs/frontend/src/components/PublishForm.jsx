import React from "react";
import PageAnimation from "../common/PageAnimation";
import { blogStructure, useEditor } from "../context/EditorContext";
import Tag from "./Tag";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useUser } from "../context/UserContext";
import { useNavigate, useParams } from "react-router-dom";

function PublishForm() {
  let { blog, setBlog, setEditorState } = useEditor();
  let { title, banner, tags, des, content } = blog;
  let { blog_id } = useParams();

  let { userAuth } = useUser();
  let { accessToken } = userAuth;

  let navigate = useNavigate();

  function handleCloseEvent() {
    setEditorState("editor");
  }

  function handleChange(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
    let key = e.target.id;
    let value = e.target.value;
    setBlog({ ...blog, [key]: value });
  }

  function handleKeyDown(e) {
    if (e.keyCode === 13 || e.keyCode === 188) {
      e.preventDefault();
      let tag = e.target.value;

      if (tags.length < 10) {
        if (!tags.includes(tag) && tag.length) {
          setBlog({ ...blog, tags: [...tags, tag] });
        }
      } else {
        return toast.error("You can Add 10 Tags Maximum");
      }
      e.target.value = "";
    }
  }

  async function publishBlog(e) {
    if (e.target.className.includes("disable")) {
      return;
    }
    if (!title.length) {
      return toast.error("Please Provide an Title For Blog");
    }
    if (!des.length || des.length > 200) {
      return toast.error("Write a Description about blog within 200 characters To Publish It.");
    }

    if (!tags.length) {
      return toast.error("Enter at least 1 Tag To Help us Rank Your Blog Your Blog");
    }

    let loadingToast = toast.loading("Publishing....");
    e.target.classList.add("disable");

    let blogObj = { title, banner, des, content, tags, draft: false };

    try {
      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blog/create-blog",
        { ...blogObj, id: blog_id },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response?.data?.status === "success") {
        e.target.classList.remove("disable");
        toast.dismiss(loadingToast);
        console.log(response?.data?.message);

        toast.success(response?.data?.message);
        setTimeout(() => {
          setBlog(blogStructure);
          setEditorState("editor");
          navigate("/dashboard/blogs");
        }, 500);
      }
    } catch (err) {
      let {
        response: {
          data: { message },
        },
      } = err;
      e.target.classList.remove("disable");
      toast.dismiss(loadingToast);
      return toast.error(message);
    }
  }

  return (
    <PageAnimation>
      <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
        <button className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]" onClick={handleCloseEvent}>
          <i className="fi fi-br-cross" />
        </button>
        <div className="max-w-[550px] center">
          <p className="text-dark-grey mb-1">Preview</p>

          <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
            <img src={banner} className="" />
          </div>

          <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">{title}</h1>

          <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">{des}</p>
        </div>
        <div className="border-grey lg:border-1 lg:pl-8 ">
          <p className="text-dark-grey mb-2 mt-9">Blog Title:</p>
          <input
            type="text"
            id="title"
            placeholder="Blog Title"
            defaultValue={title}
            className="input-box pl-4"
            onChange={handleChange}
          />
          <p className="text-dark-grey mb-2 mt-9">Short Description:</p>
          <textarea
            id="des"
            maxLength="200"
            defaultValue={des}
            className="h-40 resize-none input-box leading-7 pl-4"
            onChange={handleChange}
          ></textarea>
          <p className="mt-1 text-dark-grey text-sm text-right">{200 - des.length} Characters Left</p>
          <p className="text-dark-grey mb-2 mt-9">Topics - Helps in Searching and Ranking Your Blog</p>
          <div className="relative input-box pl-2 py-2 pb-4">
            <input
              type="text"
              placeholder="Topic"
              className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
              onKeyDown={handleKeyDown}
            />
            {tags.map((tag, i) => (
              <Tag tag={tag} key={i} tagIndex={i} />
            ))}
          </div>
          <p className="mt-1 mb-4 text-dark-grey text-right">{10 - tags.length} Tag Left</p>
          <button className="btn-dark px-8" onClick={publishBlog}>
            Publish
          </button>
        </div>
      </section>
    </PageAnimation>
  );
}

export default PublishForm;
