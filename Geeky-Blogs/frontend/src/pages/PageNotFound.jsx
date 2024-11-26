import React from "react";
import lightNotFound from "../imgs/404-light.png";
import darkNotFound from "../imgs/404-dark.png";
import { Link } from "react-router-dom";
import lightFullLogo from "../imgs/full-logo-light.png";
import darkFullLogo from "../imgs/full-logo-dark.png";
import { useTheme } from "../context/ThemeContext";

function PageNotFound() {
  const { theme } = useTheme();

  return (
    <section className="h-cover relative p-10 flex flex-col items-center gap-20 text-center">
      <img
        src={theme === "light" ? lightNotFound : darkNotFound}
        className="select-none border-2 border-grey w-72 aspect-square object-cover rounded"
      />
      <h1 className="text-4xl font-gelasio leading-7">Page Does not Exist</h1>
      <p className="text-dark-grey leading-7 text-xl -mt-8">
        The Page You are Looking for does not Exist. Head Back To{" "}
        <Link to="/" className="text-black underline">
          HomePage
        </Link>
      </p>
      <div className="mt-auto">
        <img
          src={theme === "light" ? lightFullLogo : darkFullLogo}
          className="h-8 object-contain block mx-auto select-none"
        />
        <p className="mt-5 text-dark-grey">Read Millions of Stories Around The World</p>
      </div>
    </section>
  );
}

export default PageNotFound;
