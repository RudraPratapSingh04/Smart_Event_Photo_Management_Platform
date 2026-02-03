// import React from 'react'
import Header from './subcomponent/Header.jsx'
import React, { useEffect, useState } from "react";
import SideBar from './subcomponent/Sidebar.jsx';
function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const loadProfile = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/view_profile/", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleEditBio=()=>{
    setBioDraft(profileData.bio || "");
    setIsEditingBio(true);
  }
  const handleSaveBio = async () => {
    const csrfToken = getCSRFToken();

    try {
      const response = await fetch("http://localhost:8000/api/update_bio/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ bio: bioDraft }),
      });

      if (response.ok) {
        setProfileData((prev) => ({
          ...prev,
          bio: bioDraft,
        }));
        setIsEditingBio(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getCSRFToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];
  };

  const updateProfilePicture = async (file) => {
    if (!file) return;

    const csrfToken = getCSRFToken();
    const formData = new FormData();
    formData.append("profile_picture", file);

    try {
      setUploading(true);
      const response = await fetch(
        "http://localhost:8000/api/update_profile_picture/",
        {
          method: "POST",
          credentials: "include",
          body: formData,
          headers: {
            "X-CSRFToken": csrfToken,
          },
        }
      );
     
      if (response.ok) {
        await loadProfile(); // refresh image
      } else {
        console.error("Upload failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };
 const handleCancelBio = () => {
   setIsEditingBio(false);
   setBioDraft(profileData.bio || "");
 };
return (
  <>
    <Header />

    <div className="flex">
      <SideBar />
     <main className="ml-64 flex-1 min-h-screen bg-gray-100 px-8 py-6">

       <div className="max-w-4xl bg-white rounded-xl shadow-sm border p-6">

          <h2 className="text-2xl font-semibold mb-6">
            My Profile
          </h2>

          {profileData && (
            <>
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="relative">
                  <img
                    src={profileData.profile_picture || "/default-avatar.png"}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border"
                  />
                </div>

                <div>
                  <input
                    type="file"
                    accept="image/*"
                    id="photoInput"
                    className="hidden"
                    onChange={(e) => updateProfilePicture(e.target.files[0])}
                  />

                  <button
                    onClick={() => document.getElementById("photoInput").click()}
                    disabled={uploading}
                    className="text-sm text-indigo-600 hover:underline disabled:text-gray-400"
                  >
                    {uploading ? "Uploading..." : "Change profile picture"}
                  </button>
                </div>
              </div>

              <div className="space-y-4">

                <div className="flex items-center gap-4">
                  <label className="w-28 text-gray-500">
                    Username
                  </label>
                  <div className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg text-gray-800">
  {profileData.username}
</div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="w-28 text-gray-500">Email</label>
                  <div className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg text-gray-800">
                    {profileData.email}
                  </div>
                </div>


                <div className="flex justify-between items-center border rounded-lg p-3">
                  <span className="text-gray-500">Department</span>
                  <span className="font-medium">
                    {profileData.department}
                  </span>
                </div>

                <div className="flex justify-between items-center border rounded-lg p-3">
                  <span className="text-gray-500">Batch / Year</span>
                  <span className="font-medium">
                    {profileData.batch}
                  </span>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500">Bio</span>

                    {!isEditingBio && (
                      <button
                        className="text-sm text-indigo-600 hover:underline"
                        onClick={handleEditBio}
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {!isEditingBio ? (
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {profileData.bio || "No bio added yet."}
                    </p>
                  ) : (
                    <>
                      <textarea
                        className="w-full border rounded-lg p-2"
                        rows={3}
                        value={bioDraft}
                        onChange={(e) =>
                          setBioDraft(e.target.value)
                        }
                      />

                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={handleSaveBio}
                          className="px-4 py-1.5 bg-green-600 text-white rounded-lg"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelBio}
                          className="px-4 py-1.5 bg-gray-300 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-between items-center border rounded-lg p-3">
                  <span className="text-gray-500">Joined</span>
                  <span className="font-medium">
                    {profileData.joined_at.slice(0, 10)}
                  </span>
                </div>

              </div>
            </>
          )}
        </div>
      </main>
    </div>

    
  </>
);
}

export default Profile;
