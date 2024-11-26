import { useRef } from "react";
import PageAnimation from "../common/PageAnimation";
import InputBox from "../components/InputBox";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useUser } from "../context/UserContext";

let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

function ChangePassword() {
  let changePasswordForm = useRef();

  let {
    userAuth: { accessToken },
  } = useUser();

  async function handleSubmit(e) {
    e.preventDefault();

    let form = new FormData(changePasswordForm.current);
    let formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { currentPassword, newPassword } = formData;

    if (!currentPassword.length || !newPassword.length) {
      return toast.error("Please Fill All The Fields");
    }
    if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
      return toast.error(
        "Password must be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters"
      );
    }

    e.target.setAttribute("disabled", true);
    let loadingToast = toast.loading("Updating...");

    try {
      let response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/user/change-password",
        {
          currentPassword,
          newPassword,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response?.data?.status === "success") {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        return toast.success("Password Updated SuccessFully");
      }
    } catch (err) {
      console.log(err);
      toast.dismiss(loadingToast);
      e.target.removeAttribute("disabled");
      return toast.success("Some Error Occurred While Updating Password");
    }
  }

  return (
    <PageAnimation>
      <form ref={changePasswordForm}>
        <h1 className="max-md:hidden">Change Password</h1>
        <div className="py-10 w-full md:max-w-[400px]">
          <InputBox
            name="currentPassword"
            type="password"
            className="profile-edit-input"
            placeholder="Current Password"
            icon="unlock"
          />
          <InputBox
            name="newPassword"
            type="password"
            className="profile-edit-input"
            placeholder="New Password"
            icon="unlock"
          />
          <button className="btn-dark px-10" type="submit" onClick={handleSubmit}>
            Change Password
          </button>
        </div>
      </form>
    </PageAnimation>
  );
}

export default ChangePassword;
