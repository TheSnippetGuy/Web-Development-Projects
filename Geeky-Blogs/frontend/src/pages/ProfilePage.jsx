import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageAnimation from "../common/PageAnimation";
import Loader from "../components/Loader";
import { useUser } from "../context/UserContext";
import AboutUser from "../components/AboutUser";
import { filterPaginationData } from "../common/filter-pagination-data";
import InPageNavigation from "../components/InPageNavigation";
import BlogPostCard from "../components/BlogPostCard";
import NoData from "../components/NoData";
import LoadMore from "../components/LoadMore";
import PageNotFound from "./PageNotFound";

export let profileDataStructure = {
  personal_info: { username: "", fullName: "", bio: "", profile_img: "" },
  account_info: { total_posts: 0, total_blogs: 0, total_reads: 0 },
  social_link: {},
  joinedAt: "",
};

function ProfilePage() {
  let { id: profileId } = useParams();
  let [profile, setProfile] = useState(profileDataStructure);
  let [loading, setLoading] = useState(true);
  let [blogs, setBlogs] = useState(null);
  let [profileLoaded, setProfileLoaded] = useState("");

  let {
    userAuth: { username },
  } = useUser();

  let {
    personal_info: { fullName, username: profile_username, profile_img, bio },
    account_info: { total_posts, total_reads },
    social_links,
    joinedAt,
  } = profile;

  async function fetchUserProfile() {
    try {
      let response = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/user/get-profile", {
        username: profileId,
      });

      if (response?.data?.status === "success") {
        let {
          data: { user },
        } = response;

        if (user !== null) {
          setProfile(user);
        }
        setProfileLoaded(profileId);
        getBlogs({ user_id: user._id });
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }

  async function getBlogs({ page = 1, user_id }) {
    user_id = user_id === undefined ? blogs.user_id : user_id;

    try {
      let response = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/blog/search-blogs", {
        author: user_id,
        page,
      });
      if (response?.data?.status === "success") {
        let formattedData = await filterPaginationData({
          state: blogs,
          data: response?.data?.blogs,
          page,
          countRoute: "/blog/search-blogs-count",
          data_to_send: { author: user_id },
        });

        formattedData.user_id = user_id;
        setBlogs(formattedData);
      }
    } catch (err) {
      let {
        response: {
          data: { message },
        },
      } = err;
      setLoading(false);
      console.log(message);
    }
  }

  function resetState() {
    setProfile(profileDataStructure);
    setLoading(true);
    setProfileLoaded("");
  }

  useEffect(() => {
    if (profileId !== profileLoaded) {
      setBlogs(null);
    }

    if (blogs === null) {
      resetState();
      fetchUserProfile();
    }
  }, [profileId, blogs]);

  return (
    <PageAnimation>
      {loading ? (
        <Loader />
      ) : profile_username.length ? (
        <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
          <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-10">
            <img src={profile_img} className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32" />
            <h1 className="text-2xl font-medium">@{profile_username}</h1>
            <p className="text-xl capitalize h-6">{fullName}</p>
            <p>
              {total_posts > 0 ? total_posts.toLocaleString() : 0} Blogs -{" "}
              {total_reads > 0 ? total_reads.toLocaleString() : 0} Reads
            </p>
            <div className="flex gap-4 mt-2">
              {profileId === username && (
                <Link to="/settings/edit-profile" className="btn-light rounded-md">
                  Edit profile
                </Link>
              )}
            </div>
            <AboutUser bio={bio} className="max-md:hidden" social_links={social_links} joinedAt={joinedAt} />
          </div>
          <div className="max-md:mt-12 w-full">
            <InPageNavigation routes={["Blogs Published", "About"]} defaultHidden={["About"]}>
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
                <LoadMore state={blogs} fetchDataFun={getBlogs} />
              </>
              <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt} />
            </InPageNavigation>
          </div>
        </section>
      ) : (
        <PageNotFound />
      )}
    </PageAnimation>
  );
}

export default ProfilePage;
