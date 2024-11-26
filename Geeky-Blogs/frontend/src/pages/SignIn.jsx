import React, { useRef } from "react";
import InputBox from "../components/InputBox";
import googleIcon from "../imgs/google.png";
import { Link, Navigate } from "react-router-dom";
import PageAnimation from "../common/PageAnimation";
import toast from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { useUser } from "../context/UserContext";
import { authWithGoogle } from "../common/firebase";

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

function SignIn() {
  const signInForm = useRef();

  let { userAuth, setUserAuth } = useUser();
  let { accessToken } = userAuth;

  async function handleAuthWithGoogle(e) {
    e.preventDefault();
    try {
      let user = await authWithGoogle();
      let response = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/user/google-auth", {
        accessToken: user.accessToken,
      });
      if (response?.data?.status === "success") {
        toast.success(response?.data?.message);
        storeInSession("user", JSON.stringify(response?.data?.user));
        setUserAuth(response?.data?.user);
      }
    } catch (err) {
      return toast.error("Trouble While Sign Up Through Google");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    let form = new FormData(signInForm.current);
    let formData = {};

    for (let [key, value] of form) {
      formData[key] = value;
    }

    let { email, password } = formData;

    if (!email.length) {
      return toast.error("Please Enter an Email");
    }

    if (!emailRegex.test(email)) {
      return toast.error("Please Enter an Valid Email");
    }

    if (!passwordRegex.test(password)) {
      return toast.error(
        "Password must be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters"
      );
    }

    try {
      let response = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/user/signin", formData);

      if (response?.data?.status === "success") {
        toast.success(response?.data?.message);
        storeInSession("user", JSON.stringify(response?.data?.user));
        setUserAuth(response?.data?.user);
      }
    } catch (err) {
      let {
        response: {
          data: { message },
        },
      } = err;
      return toast.error(message);
    }
  }
  return accessToken ? (
    <Navigate to="/" />
  ) : (
    <PageAnimation>
      <section className="h-cover flex items-center justify-center">
        <form className="w-[80%] max-w-[400px]" ref={signInForm}>
          <h1 className="text-3xl font-gelasio capitalize text-center mb-24 font-semibold">Join Us Today</h1>
          <InputBox name="email" type="email" placeholder="Your Email" id="email" icon="at" />
          <InputBox name="password" type="password" placeholder="Password" id="password" icon="key" />
          <button type="submit" className="btn-dark center mt-14" onClick={handleSubmit}>
            Sign In
          </button>
          <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
            <hr className="w-1/2 border-black" />
            <p>OR</p>
            <hr className="w-1/2 border-black" />
          </div>
          <button
            className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
            onClick={handleAuthWithGoogle}
          >
            <img src={googleIcon} className="w-5" />
            Continue With Google
          </button>
          <p className="mt-6 text-dark-grey text-xl text-center">
            Don't Have an Account ?
            <Link to="/signup" className="underline text-black text-xl ml-1">
              Join Us Today
            </Link>
          </p>
        </form>
      </section>
    </PageAnimation>
  );
}

export default SignIn;
