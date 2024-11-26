import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import { filterPaginationData } from "../common/filter-pagination-data";
import InPageNavigation from "../components/InPageNavigation";
import Loader from "../components/Loader";
import NoData from "../components/NoData";
import PageAnimation from "../common/PageAnimation";
import ManagePublishedBlogCard from "../components/ManagePublishedBlogCard";
import ManageDraftBlogCard from "../components/ManageDraftBlogCard";
import LoadMore from "../components/LoadMore";
import { useSearchParams } from "react-router-dom";

function ManageBlogs() {
  const [blogs, setBlogs] = useState(null);
  const [drafts, setDrafts] = useState(null);
  const [query, setQuery] = useState("");

  const activeTab = useSearchParams()[0].get("tab");

  let { userAuth } = useUser();
  let { accessToken } = userAuth;

  async function getBlogs({ page, draft, deletedDocCount = 0 }) {
    let response = await axios.post(
      import.meta.env.VITE_SERVER_DOMAIN + "/blog/user-written-blogs",
      {
        page,
        draft,
        query,
        deletedDocCount,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (response.data.status === "success") {
      let formattedData = await filterPaginationData({
        state: draft ? drafts : blogs,
        data: response.data.blogs,
        page,
        user: accessToken,
        countRoute: "/blog/user-written-blogs-count",
        data_to_send: { draft, query },
      });

      if (draft) {
        setDrafts(formattedData);
      } else {
        setBlogs(formattedData);
      }
    }
  }

  useEffect(() => {
    if (accessToken) {
      if (blogs === null) {
        getBlogs({ page: 1, draft: false });
      }
      if (drafts === null) {
        getBlogs({ page: 1, draft: true });
      }
    }
  }, [accessToken, blogs, drafts, query]);

  function handleSearch(e) {
    let searchQuery = e.target.value;
    setQuery(searchQuery);
    if (e.keyCode === 13 && searchQuery.length) {
      setBlogs(null);
      setDrafts(null);
    }
  }

  function handleChange(e) {
    if (!e.target.value.length) {
      setQuery("");
      setBlogs(null);
      setDrafts(null);
    }
  }

  return (
    <>
      <h1 className="max-md:hidden">Manage Blogs</h1>
      <div className="relative max-md:mt-5 md:mt-8 mb-10">
        <input
          type="search"
          className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey"
          placeholder="Search Blogs"
          onChange={handleChange}
          onKeyDown={handleSearch}
        />
        <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey" />
      </div>
      <InPageNavigation routes={["Published Blogs", "Drafts"]} defaultActiveIndex={activeTab !== "draft" ? 0 : 1}>
        {/* Published Blogs  */}
        {blogs === null ? (
          <Loader />
        ) : blogs.results.length ? (
          <>
            {blogs.results.map((blog, i) => (
              <PageAnimation key={i} transition={{ delay: i * 0.04 }}>
                <ManagePublishedBlogCard blog={{ ...blog, index: i, setStateFunc: setBlogs }} />
              </PageAnimation>
            ))}
            <LoadMore
              state={blogs}
              fetchDataFun={getBlogs}
              additionalParam={{ draft: false, deletedDocCount: blogs.deletedDocCount }}
            />
          </>
        ) : (
          <NoData message="No Published Blogs" />
        )}

        {/* Draft Blogs  */}
        {drafts === null ? (
          <Loader />
        ) : drafts.results.length ? (
          <>
            {drafts.results.map((blog, i) => (
              <PageAnimation key={i} transition={{ delay: i * 0.04 }}>
                <ManageDraftBlogCard blog={{ ...blog, index: i, setStateFunc: setDrafts }} />
              </PageAnimation>
            ))}
            <LoadMore
              state={drafts}
              fetchDataFun={getBlogs}
              additionalParam={{ draft: true, deletedDocCount: drafts.deletedDocCount }}
            />
          </>
        ) : (
          <NoData message="No Draft Blogs" />
        )}
      </InPageNavigation>
    </>
  );
}

export default ManageBlogs;
