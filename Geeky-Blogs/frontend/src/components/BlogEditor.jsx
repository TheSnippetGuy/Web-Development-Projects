import lightLogo from "../imgs/logo-light.png";
import darkLogo from "../imgs/logo-dark.png";
import PageAnimation from "../common/PageAnimation";
import EditorJS from "@editorjs/editorjs";
import { useEditor } from "../context/EditorContext";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Tools } from "../common/Tools";
import { toast } from "react-hot-toast";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../common/firebase";
import defaultLightBanner from "../imgs/blog banner light.png";
import defaultDarkBanner from "../imgs/blog banner dark.png";
import { useTheme } from "../context/ThemeContext";

function BlogEditor() {
  let { blog_id } = useParams();
  let blogBannerEle = useRef();
  let blogUpdateBtnRef = useRef();
  const [updatedBannerImage, setUpdatedBannerImage] = useState(null);
  let { blog, setBlog, setEditorState, textEditor, setTextEditor } = useEditor();
  let { title, banner, content, tags, des } = blog;
  let { userAuth } = useUser();
  let { accessToken } = userAuth;
  let { theme } = useTheme();

  let navigate = useNavigate();

  function handleTitleKeyDown(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  }

  function handleTitleChange(e) {
    let input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog({ ...blog, title: input.value });
  }

  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJS({
          holder: "textEditor",
          data: Array.isArray(content) ? content[0] : content,
          tools: Tools,
          placeholder: "Let's Write an Awesome Story",
        })
      );
    }
  }, []);

  function handleImagePreview(e) {
    let img = e.target.files[0];
    blogBannerEle.current.src = URL.createObjectURL(img);
    setUpdatedBannerImage(img);
    setTimeout(() => {
      blogUpdateBtnRef.current.click();
    }, 3000);
  }

  async function handleImageUpload() {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + updatedBannerImage.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, updatedBannerImage);

    const uploadingBanner = toast.loading("Uploading Banner. Please Wait...");
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      (error) => {
        console.log(error);
      },
      () => {
        toast.dismiss(uploadingBanner);
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUpdatedBannerImage(downloadURL);
          toast.success("Banner Uploaded successFully");
        });
      }
    );
  }

  async function handlePublishEvent() {
    if (!banner) {
      banner = updatedBannerImage;
    } else {
      banner = banner;
    }
    if (!banner?.length) {
      return toast.error("Upload a Banner to Publish It.");
    }
    if (!title.length) {
      return toast.error("Write a Blog Title To Publish It.");
    }
    if (textEditor.isReady) {
      let data = await textEditor.save();
      if (data.blocks.length) {
        setBlog({ ...blog, content: data, banner });
        setEditorState("publish");
      } else {
        return toast.error("Write Some Blog Description To Publish It.");
      }
    }
  }

  async function handleSaveDraft(e) {
    if (e.target.className.includes("disable")) {
      return;
    }
    if (!title.length) {
      return toast.error("Write a Title For Blog Before Saving It as draft");
    }

    let loadingToast = toast.loading("Saving as Draft...");
    e.target.classList.add("disable");

    if (textEditor.isReady) {
      let content = await textEditor.save();

      let blogObj = { title, banner, des, content, tags, draft: true };

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
          toast.success("Saved as Draft");
          setTimeout(() => {
            navigate("/dashboard/blogs?tab=draft");
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
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img src={theme === "light" ? darkLogo : lightLogo} className="" />
        </Link>
        <p className="max-md:hidden text-black line-clamp-1 w-full">{title.length ? title : "New Blog"}</p>
        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2" onClick={handlePublishEvent}>
            Publish
          </button>
          <button className="hidden" ref={blogUpdateBtnRef} onClick={handleImageUpload}>
            Upload Banner
          </button>
          <button className="btn-light py-2" onClick={handleSaveDraft}>
            Save Draft
          </button>
        </div>
      </nav>
      <PageAnimation>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video bg-white border-4 border-grey hover:opacity-80">
              <label>
                <img
                  src={banner || (theme === "light" ? defaultLightBanner : defaultDarkBanner)}
                  className="z-20"
                  ref={blogBannerEle}
                />
                <input id="uploadBanner" type="file" accept=".png, .jpg, .jpeg" hidden onChange={handleImagePreview} />
              </label>
            </div>
            <textarea
              defaultValue={title}
              className="text-4xl font-medium w-full outline-none h-20 resize-none mt-10 leading-tight placeholder:opacity-40 bg-white"
              placeholder="Blog Title"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>
            <hr className="w-full opacity-10 my-5" />
            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </PageAnimation>
    </>
  );
}

export default BlogEditor;
