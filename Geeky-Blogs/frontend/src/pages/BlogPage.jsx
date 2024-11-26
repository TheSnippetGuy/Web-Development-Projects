import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import PageAnimation from "../common/PageAnimation";
import Loader from "../components/Loader";
import BlogInteraction from "../components/BlogInteraction";
import { blogStructure, useBlog } from "../context/BlogContext";
import BlogPostCard from "../components/BlogPostCard";
import BlogContent from "../components/BlogContent";
import CommentsContainer, { fetchComments } from "../components/CommentsContainer";

function BlogPage() {
  let { blog_id } = useParams();
  let { blog, setBlog, setLikedByUser, setCommentsWrapper, setTotalParentCommentsLoaded } = useBlog();
  let [loading, setLoading] = useState(true);
  let [similarBlogs, setSimilarBlogs] = useState(null);

  let {
    title,
    content,
    banner,
    author: {
      personal_info: { username: author_username, fullName, profile_img },
    },
    publishedAt,
  } = blog;

  async function fetchBlog() {
    try {
      let response = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/blog/get-blog", { blog_id });

      if (response?.data?.status === "success") {
        let {
          data: { blog },
        } = response;

        blog.comments = await fetchComments({
          blog_id: blog._id,
          setParentCommentCountFun: setTotalParentCommentsLoaded,
        });

        setBlog(blog);

        let res = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/blog/search-blogs", {
          tag: response?.data?.blog?.tags[0],
          limit: 6,
          eliminate_blog: blog_id,
        });
        setSimilarBlogs(res?.data?.blogs);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }

  useEffect(() => {
    setBlog(blogStructure);
    setSimilarBlogs(null);
    setLoading(true);
    setLikedByUser(false);
    setCommentsWrapper(false);
    setTotalParentCommentsLoaded(0);
    fetchBlog();
  }, [blog_id]);

  return (
    <PageAnimation>
      {loading ? (
        <Loader />
      ) : (
        <>
          <CommentsContainer />
          <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
            <img src={banner} className="aspect-video" />
            <div className="mt-12">
              <h2>{title}</h2>
              <div className="flex max-sm:flex-col justify-between my-8">
                <div className="flex gap-5 items-start">
                  <img src={profile_img} className="w-12 h-12 rounded-full" />
                  <p className="capitalize">
                    {fullName} <br />@
                    <Link to={`/user/${author_username}`} className="underline">
                      {author_username}
                    </Link>
                  </p>
                </div>
                <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
                  Published On{" "}
                  {new Date(publishedAt).toLocaleString("en-US", { year: "numeric", day: "2-digit", month: "short" })}
                </p>
              </div>
            </div>
            <BlogInteraction />
            <div className="my-12 font-gelasio blog-page-content">
              {content ? content[0].blocks.map((block, i) => <BlogContent block={block} key={i} />) : ""}
            </div>
            <BlogInteraction />
            {similarBlogs !== null && (
              <>
                <h1 className="text-2xl mt-14 mb-10 font-medium">Similar Blogs</h1>
                {similarBlogs.map((blog, i) => {
                  let {
                    author: { personal_info },
                  } = blog;
                  return (
                    <PageAnimation key={i} transition={{ duration: 1, delay: i * 0.08 }}>
                      <BlogPostCard blog={blog} />
                    </PageAnimation>
                  );
                })}
              </>
            )}
          </div>
        </>
      )}
    </PageAnimation>
  );
}

export default BlogPage;
