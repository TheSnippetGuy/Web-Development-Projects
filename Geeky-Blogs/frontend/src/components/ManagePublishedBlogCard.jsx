import { useState } from "react";
import { Link } from "react-router-dom";
import BlogStats from "./BlogStats";
import { useUser } from "../context/UserContext";
import axios from "axios";

function ManagePublishedBlogCard({ blog }) {
  let { banner, blog_id, title, publishedAt, activity } = blog;
  let [showStat, setShowStat] = useState(false);

  let { userAuth } = useUser();
  let { accessToken } = userAuth;

  async function deleteBlog(blog, accessToken, target) {
    let { index, blog_id, setStateFunc } = blog;
    target.setAttribute("disabled", true);

    try {
      let response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blog/delete-blog",
        { blog_id },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.status === "success") {
        target.removeAttribute("disabled");
        setStateFunc((prevVal) => {
          let { deletedDocCount, totalDocs, results } = prevVal;
          results.splice(index, 1);

          if (!deletedDocCount) {
            deletedDocCount = 0;
          }

          if (!results.length && totalDocs - 1 > 0) {
            return null;
          }
          return { ...prevVal, totalDocs: totalDocs - 1, deletedDocCount: deletedDocCount + 1 };
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <div className="flex gap-10 border-b mb-6 max-md:px-4 border-grey pb-6 items-center">
        <img src={banner} className="max-md:hidden lg:hidden xl:block w-28 h-28 flex-none bg-grey object-cover" />
        <div className="flex flex-col justify-between py-2 w-full min-w-[300px]">
          <div>
            <Link to={`/blog/${blog_id}`} className="blog-title mb-4 hover:underline">
              {title}
            </Link>
            <p className="line-clamp-1">
              Published On{" "}
              {new Date(publishedAt).toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
          <div className="flex gap-6 mt-3">
            <Link to={`/editor/${blog_id}`} className="pr-4 py-2 underline">
              Edit
            </Link>
            <button className="lg:hidden pr-4 py-2 underline" onClick={() => setShowStat((prevVal) => !prevVal)}>
              Stats
            </button>
            <button className="pr-4 py-2 underline text-red" onClick={(e) => deleteBlog(blog, accessToken, e.target)}>
              Delete
            </button>
          </div>
        </div>
        <div className="max-lg:hidden">
          <BlogStats stats={activity} />
        </div>
      </div>
      {showStat ? (
        <div className="lg:hidden">
          <BlogStats stats={activity} />
        </div>
      ) : (
        ""
      )}
    </>
  );
}

export default ManagePublishedBlogCard;
