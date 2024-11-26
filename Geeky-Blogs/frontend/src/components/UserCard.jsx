import React from "react";
import { Link } from "react-router-dom";

function UserCard({ user }) {
  let { fullName, username, profile_img } = user.personal_info;
  return (
    <Link to={`/user/${username}`} className="flex gap-5 items-center mb-5">
      <img src={profile_img} className="w-14 h-14 rounded-full" />
      <div>
        <h1 className="font-medium text-xl line-clamp-2">{fullName}</h1>
        <p className="text-dark-grey">@ {username}</p>
      </div>
    </Link>
  );
}

export default UserCard;