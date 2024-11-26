import React, { useEffect, useState } from "react";
import PageAnimation from "../common/PageAnimation";
import InPageNavigation, { activeTabRef } from "../components/InPageNavigation";
import axios from "axios";
import Loader from "../components/Loader";
import BlogPostCard from "../components/BlogPostCard";
import MinimalBlogPost from "../components/MinimalBlogPost";
import NoData from "../components/NoData";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMore from "../components/LoadMore";

function HomePage() {
  let [blogs, setBlogs] = useState(null);
  let [trendingBlogs, setTrendingBlogs] = useState(null);
  let [pageState, setPageState] = useState("home");

  let categories = ["tech", "finance", "entertainment", "infotainment", "cooking", "food", "movies", "travel"];

  async function fetchLatestBlog({ page = 1 }) {
    try {
      let response = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/blog/latest-blogs", { page });
      if (response?.data?.status === "success") {
        let formattedData = await filterPaginationData({
          state: blogs,
          data: response?.data?.blogs,
          page,
          countRoute: "/blog/all-latest-blogs-count",
        });
        setBlogs(formattedData);
      }
    } catch (err) {
      let {
        response: {
          data: { message },
        },
      } = err;
      console.log(message);
    }
  }

  async function loadBlogByCategory(e) {
    let category = e.target.innerText.toLowerCase();
    setBlogs(null);

    if (pageState === category) {
      setPageState("home");
      return;
    }

    setPageState(category);
  }

  async function fetchTrendingBlog() {
    try {
      let response = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/blog/trending-blogs");
      if (response?.data?.status === "success") {
        setTrendingBlogs(response?.data?.blogs);
      }
    } catch (err) {
      let {
        response: {
          data: { message },
        },
      } = err;
      console.log(message);
    }
  }

  async function fetchBlogByCategory({ page = 1 }) {
    try {
      let response = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/blog/search-blogs", {
        tag: pageState,
        page,
      });
      if (response?.data?.status === "success") {
        let formattedData = await filterPaginationData({
          state: blogs,
          data: response?.data?.blogs,
          page,
          countRoute: "/blog/search-blogs-count",
          data_to_send: { tag: pageState },
        });

        setBlogs(formattedData);
      }
    } catch (err) {
      let {
        response: {
          data: { message },
        },
      } = err;
      console.log(message);
    }
  }

  useEffect(() => {
    activeTabRef.current.click();

    if (pageState === "home") {
      fetchLatestBlog({ page: 1 });
    } else {
      fetchBlogByCategory({ page: 1 });
    }

    if (!trendingBlogs) {
      fetchTrendingBlog();
    }
  }, [pageState]);

  return (
    <PageAnimation>
      <section className="h-cover flex justify-center gap-10">
        {/* Latest Blog  */}
        <div className="w-full">
          <InPageNavigation routes={[pageState, "trending blogs"]} defaultHidden={["trending blogs"]}>
            <>
              {blogs === null ? (
                <Loader />
              ) : blogs.results.length ? (
                blogs.results.map((blog, i) => (
                  <PageAnimation key={i} transition={{ duration: 1, delay: i * 0.1 }}>
                    <BlogPostCard blog={blog} />
                  </PageAnimation>
                ))
              ) : (
                <NoData message="No Blog Published In this Category" />
              )}
              <LoadMore state={blogs} fetchDataFun={pageState === "home" ? fetchLatestBlog : fetchBlogByCategory} />
            </>
            {trendingBlogs === null ? (
              <Loader />
            ) : trendingBlogs.length ? (
              trendingBlogs.map((blog, i) => (
                <PageAnimation key={i} transition={{ duration: 1, delay: i * 0.1 }}>
                  <MinimalBlogPost blog={blog} index={i} />
                </PageAnimation>
              ))
            ) : (
              <NoData message="No Trending Blogs To Display" />
            )}
          </InPageNavigation>
        </div>
        {/* Filter and Trending Blogs */}
        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            <div>
              <h1 className="font-medium text-xl mb-8">Stories from all Interests</h1>
              <div className="flex gap-3 flex-wrap">
                {categories.map((category, i) => (
                  <button
                    key={i}
                    className={`tag ${pageState === category ? "bg-black text-white" : ""}`}
                    onClick={loadBlogByCategory}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h1 className="font-medium text-xl mb-8">
                Trending <i className="fi fi-rr-arrow-trend-up" />
              </h1>
              {trendingBlogs === null ? (
                <Loader />
              ) : (
                trendingBlogs.map((blog, i) => (
                  <PageAnimation key={i} transition={{ duration: 1, delay: i * 0.1 }}>
                    <MinimalBlogPost blog={blog} index={i} />
                  </PageAnimation>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </PageAnimation>
  );
}

export default HomePage;
