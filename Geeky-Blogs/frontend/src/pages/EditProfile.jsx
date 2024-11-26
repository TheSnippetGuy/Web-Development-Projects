import React, { useEffect, useRef, useState } from "react";
import { useUser } from "../context/UserContext";
import axios from "axios";
import { profileDataStructure } from "./ProfilePage";
import PageAnimation from "../common/PageAnimation";
import Loader from "../components/Loader";
import InputBox from "../components/InputBox";
import toast from "react-hot-toast";
import { storeInSession } from "../common/session";
import { getDownloadURL, getStorage, uploadBytesResumable, ref } from "firebase/storage";
import { app } from "../common/firebase";

function EditProfile() {
  let {
    userAuth,
    setUserAuth,
    userAuth: { accessToken, username },
  } = useUser();

  let bioLimit = 150;
  let profileImageEle = useRef();
  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  let [charactersLeft, setCharactersLeft] = useState(bioLimit);
  const [updatedProfileImage, setUpdatedProfileImage] = useState(null);

  let editProfileForm = useRef();

  let {
    personal_info: { fullName, username: profile_username, profile_img, email, bio },
    social_links,
  } = profile;

  function handleCharacterChange(e) {
    setCharactersLeft(bioLimit - e.target.value.length);
  }

  async function getUserProfile(params) {
    try {
      let response = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/user/get-profile", { username });
      if (response?.data?.status === "success") {
        setProfile(response?.data?.user);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (accessToken) {
      getUserProfile();
    }
  }, [accessToken]);

  function handleImagePreview(e) {
    let img = e.target.files[0];
    profileImageEle.current.src = URL.createObjectURL(img);
    setUpdatedProfileImage(img);
  }

  async function handleImageUpload() {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + updatedProfileImage.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, updatedProfileImage);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      (error) => {
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUpdatedProfileImage(downloadURL);
          toast.success("Profile Image Uploaded successFully");
        });
      }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    let form = new FormData(editProfileForm.current);

    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { username, bio, youtube, instagram, twitter, github, facebook, website } = formData;

    if (username.length < 3) {
      return toast.error("Username should be 3 characters Long");
    }
    if (bio.length > bioLimit) {
      return toast.error("Bio Length Must be 150 characters Only ");
    }

    let loadingToast = toast.loading("updating");
    e.target.setAttribute("disabled", true);
    try {
      let response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/user/update-profile",
        {
          username,
          bio,
          profile_img: updatedProfileImage,
          social_links: { youtube, facebook, instagram, twitter, github, website },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response?.data?.status === "success") {
        if (userAuth.username !== response?.data?.username) {
          let newUserAuth = { ...userAuth, username: response?.data?.username };
          storeInSession("user", JSON.stringify(newUserAuth));
          setUserAuth(newUserAuth);
        }
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        return toast.success("Profile Updated SuccessFully");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      e.target.removeAttribute("disabled");
      return toast.error("Error Occurred While Updating Profile. Please Try Again");
    }
  }

  return (
    <PageAnimation>
      {loading ? (
        <Loader />
      ) : (
        <form ref={editProfileForm}>
          <h1 className="max-md:hidden">Edit Profile</h1>
          <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
            <div className="max-lg:center mb-5">
              <label
                htmlFor="uploadImg"
                id="profileImgLabel"
                className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden"
              >
                <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/30 opacity-0 hover:opacity-100 cursor-pointer">
                  Upload Image
                </div>
                <img src={profile_img || updatedProfileImage} ref={profileImageEle} />
              </label>
              <input type="file" id="uploadImg" accept=".jpeg, .png, .jpg" hidden onChange={handleImagePreview} />
              <button className="btn-light mt-5 max-lg:center lg:w-full px-10" onClick={handleImageUpload}>
                Upload
              </button>
            </div>
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                <div>
                  <InputBox
                    name="fullName"
                    type="text"
                    value={fullName}
                    placeholder="Full Name"
                    disable={true}
                    icon="user"
                  />
                </div>

                <div>
                  <InputBox
                    name="email"
                    type="email"
                    value={email}
                    placeholder="Email"
                    disable={true}
                    icon="envelope"
                  />
                </div>
              </div>
              <InputBox type="text" name="username" value={profile_username} placeholder="Username" icon="at" />
              <p className="text-dark-grey -mt-3">Username will user to search user and will be visible to all users</p>
              <textarea
                name="bio"
                maxLength={bioLimit}
                defaultValue={bio}
                placeholder="Bio"
                className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5"
                onChange={handleCharacterChange}
              ></textarea>
              <p className="mt-1 text-dark-grey">{charactersLeft} characters Left</p>
              <p className=" my-6 text-dark-grey">Your Social Handles Below</p>
              <div className="md:grid md:grid-cols-2 gap-x-6">
                {Object.keys(social_links).map((key, i) => {
                  let link = social_links[key];
                  return (
                    <InputBox
                      key={i}
                      name={key}
                      type="text"
                      value={link}
                      placeholder="https://"
                      icon={`fi ${key !== "website" ? "fi-brands-" + key : "fi-ss-globe"} text-2xl hover:text-black `}
                    />
                  );
                })}
              </div>
              <button className="btn-dark w-auto px-10" type="submit" onClick={handleSubmit}>
                Update
              </button>
            </div>
          </div>
        </form>
      )}
    </PageAnimation>
  );
}

export default EditProfile;
