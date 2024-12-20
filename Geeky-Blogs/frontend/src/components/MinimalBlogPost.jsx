import React from "react";
import { Link } from "react-router-dom";

function MinimalBlogPost({ blog, index }) {
  let {
    title,
    publishedAt,
    blog_id: id,
    author: {
      personal_info: { fullName, username, profile_img },
    },
  } = blog;

  return (
    <Link to={`/blog/${id}`} className="flex gap-5 mb-8">
      <h1 className="blog-index">{index < 10 ? "0" + (index + 1) : index}</h1>
      <div>
        <div className="flex gap-2 items-center mb-7">
          <img src={profile_img} className="w-6 h-6 rounded-full" />
          <p className="line-clamp-1">
            {fullName} @{username}
          </p>
          <p className="w-fit">{new Date(publishedAt).toLocaleString("en-US", { year: "numeric", month: "short" })}</p>
        </div>
        <h1 className="blog-title">{title}</h1>
      </div>
    </Link>
  );
}

export default MinimalBlogPost;
