import { useParams } from "react-router-dom";
import InPageNavigation from "../components/InPageNavigation";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import PageAnimation from "../common/PageAnimation";
import BlogPostCard from "../components/BlogPostCard";
import NoData from "../components/NoData";
import LoadMore from "../components/LoadMore";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";
import UserCard from "../components/UserCard";

function SearchPage() {
  let { query } = useParams();
  let [blogs, setBlogs] = useState(null);
  let [users, setUsers] = useState(null);

  async function searchBlogs({ page = 1, create_new_arr = false }) {
    try {
      let response = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/blog/search-blogs", { query, page });
      if (response?.data?.status === "success") {
        let formattedData = await filterPaginationData({
          state: blogs,
          data: response?.data?.blogs,
          page,
          countRoute: "/blog/search-blogs-count",
          data_to_send: { query },
          create_new_arr,
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

  async function fetchUsers() {
    try {
      let response = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/user/search-users", { query });

      if (response?.data?.status === "success") {
        setUsers(response?.data?.users);
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

  function resetState() {
    setBlogs(null);
    setUsers(null);
  }

  useEffect(() => {
    searchBlogs({ page: 1, create_new_arr: true });
    fetchUsers();
  }, [query]);

  function UserCardWrapper() {
    return (
      <>
        {users === null ? (
          <Loader />
        ) : users.length ? (
          users.map((user, i) => (
            <PageAnimation key={i} transition={{ duration: 1, delay: i * 0.08 }}>
              <UserCard user={user} />
            </PageAnimation>
          ))
        ) : (
          <NoData message="No User Found " />
        )}
      </>
    );
  }

  return (
    <section className="h-cover flex justify-center gap-10">
      <div className="w-full">
        <InPageNavigation
          routes={[`Search Result for ${query}`, "Accounts Matched"]}
          defaultHidden={["Accounts Matched"]}
        >
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
            <LoadMore state={blogs} fetchDataFun={searchBlogs} />
          </>

          <UserCardWrapper />
        </InPageNavigation>
      </div>
      <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
        <h1 className="font-medium text-xl mb-8">
          User Related to Search
          <i className="fi fi-rr-user ml-3 mt-1" />
        </h1>
        <UserCardWrapper />
      </div>
    </section>
  );
}

export default SearchPage;
