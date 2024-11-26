import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import axios from "axios";

function ManageDraftBlogCard({ blog }) {
  let { title, des, blog_id, index } = blog;

  let { userAuth } = useUser();
  let { accessToken } = userAuth;

  index++;

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
    <div className="flex gap-5 lg:gap-10 pb-6 border-b mb-6 border-grey">
      <h1 className="blog-index text-center pl-4 md:pl-6 flex-none">{index < 10 ? "0" + index : index}</h1>
      <div>
        <h1 className="blog-title mb-3">{title}</h1>
        <p className="line-clamp-2 font-gelasio">{des.length ? des : "No Description"}</p>
        <div className="flex gap-6 mt-3">
          <Link to={`/editor/${blog_id}`} className="pr-4 py-2 underline">
            Edit
          </Link>
          <button className="pr-4 py-2 underline text-red" onClick={(e) => deleteBlog(blog, accessToken, e.target)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageDraftBlogCard;
