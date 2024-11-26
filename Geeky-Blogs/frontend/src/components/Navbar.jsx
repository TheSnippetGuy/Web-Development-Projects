import React, { useEffect, useState } from "react";
import lightLogo from "../imgs/logo-light.png";
import darkLogo from "../imgs/logo-dark.png";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import UserPanel from "./UserPanel";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { storeInSession } from "../common/session";

function Navbar() {
  const [searchVisible, setSearchVisible] = useState(false);
  const [userNavPanel, setUserNavPanel] = useState(true);

  let { userAuth, setUserAuth } = useUser();
  let { accessToken, profile_img, new_notification_available } = userAuth;

  let navigate = useNavigate();

  let { theme, setTheme } = useTheme();

  function handleUserNavPanel() {
    setUserNavPanel((cur) => !cur);
  }

  function handleBlur() {
    setTimeout(() => {
      setUserNavPanel(false);
    }, 200);
  }

  function handleSearch(e) {
    let query = e.target.value;

    if (e.keyCode === 13 && query.length) {
      navigate(`/search/${query}`);
    }
  }

  function changeTheme() {
    let newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.setAttribute("data-theme", newTheme);
    storeInSession("theme", newTheme);
  }

  useEffect(() => {
    async function getNotifications() {
      let response = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/user/new-notification", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.data.status === "success") {
        setUserAuth({ ...userAuth, new_notification_available: response.data.new_notification_available });
      }
    }

    if (accessToken) {
      getNotifications();
    }
  }, [accessToken]);

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img src={theme === "light" ? lightLogo : darkLogo} className="w-full" />
        </Link>
        <p>{new_notification_available}</p>
        <div
          className={`absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show ${
            searchVisible ? "show" : "hide"
          }`}
        >
          <input
            type="text"
            placeholder="Search..."
            className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12"
            onKeyDown={handleSearch}
          />
          <i className="fi fi-rr-search absolute right-[10%] text-xl md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-dark-grey" />
        </div>
        <div className="flex items-center gap-3 md:gap-6 ml-auto">
          <button
            className="md:hidden w-12 h-12 rounded-full bg-grey flex items-center justify-center"
            onClick={() => setSearchVisible((cur) => !cur)}
          >
            <i className="fi fi-rr-search text-xl" />
          </button>
          <Link to="/editor" className="hidden md:flex gap-2 link">
            <i className="fi fi-rr-file-edit" />
            <p>Create</p>
          </Link>

          <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10" onClick={changeTheme}>
            <i className={`text-xxl block mt-1 fi fi-rr-${theme === "light" ? "moon-stars" : "sun"}`} />
          </button>

          {accessToken ? (
            <>
              <Link to="/dashboard/notifications">
                <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10">
                  <i className="fi fi-rr-bell text-2xl mt-1 block" />
                  {new_notification_available ? (
                    <span className="bg-red w-3 h-3 rounded-full absolute z-10 top-2 right-2"></span>
                  ) : (
                    ""
                  )}
                </button>
              </Link>
              <div className="relative" onClick={handleUserNavPanel} onBlur={handleBlur}>
                <button className="w-12 h-12 mt-1">
                  <img src={profile_img} className="w-full h-full object-cover rounded-full" />
                </button>
                {userNavPanel ? <UserPanel /> : ""}
              </div>
            </>
          ) : (
            <>
              <Link className="btn-dark py-2" to="/signin">
                Sign In
              </Link>
              <Link className="btn-light py-2 hidden md:block" to="/signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
      <Outlet />
    </>
  );
}

export default Navbar;
