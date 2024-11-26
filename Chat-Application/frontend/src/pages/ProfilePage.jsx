import { useDispatch, useSelector } from "react-redux";
import { Camera, User } from "lucide-react";
import { useState } from "react";
import { updateProfile } from "../redux/AuthStore/authAction";

function ProfilePage() {
  const { authUser, isUpdatingProfile } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = useState(null);
  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImage(base64Image);
      dispatch(updateProfile({ profile_Pic: base64Image }));
    };
  }

  return (
    <div className="h-screen mt-20">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-base-300 rounded-xl p-6 space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your Profile Information</p>
          </div>
          {/* Avatar Upload Section  */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <img
                src={authUser.profile_Pic || "" || selectedImage}
                alt="profile"
                className="size-28 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                  isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                }`}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Profile Picture Should be less than 2 Mb"}
            </p>
          </div>
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                FullName
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
            </div>
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Email
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>
          <div className="mt-2 bg-base-300 rounded-xl px-6 py-2">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <span>Member Since</span>
              <span>{authUser.createdAt?.split("T")[0]}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>Account Status</span>
              <span className="text-green-500">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
