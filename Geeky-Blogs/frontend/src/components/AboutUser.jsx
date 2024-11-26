import React from "react";
import { Link } from "react-router-dom";

function AboutUser({ bio, social_links, joinedAt, className }) {
  return (
    <div className={`md:w-[90%] md:mt-7 ${className}`}>
      <p className="text-xl leading-7">{bio.length ? bio : "User has Not Entered a Bio"}</p>
      <div className="flex gap-x-7 gap-y-2 flex-wrap my-7 items-center text-dark-grey">
        {Object.keys(social_links).map((key) => {
          let link = social_links[key];
          return (
            link && (
              <Link to="/link" key={i} target="_blank">
                <i
                  className={`fi ${key !== "website" ? "fi-brands-" + key : "fi-ss-globe"} text-2xl hover:text-black `}
                />
              </Link>
            )
          );
        })}
      </div>
      <p className="text-xl leading-7 text-dark-grey">
        Joined On : {new Date(joinedAt).toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
      </p>
    </div>
  );
}

export default AboutUser;
