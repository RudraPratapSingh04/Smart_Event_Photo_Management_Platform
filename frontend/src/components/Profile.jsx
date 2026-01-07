// import React from 'react'
import Header from './subcomponent/Header.jsx'
import Footer from './subcomponent/Footer.jsx'
import React, { useEffect, useState } from "react";

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
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            My Profile
          </h2>

          {profileData && (
            <>
              {/* Profile Image Section */}
              <div className="flex flex-col items-center gap-3 mb-6">
                <div className="relative">
                  <img
                    src={profileData.profile_picture || "/default-avatar.png"}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                </div>

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
                  className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
                >
                  {uploading ? "Uploading..." : "Change profile picture"}
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="w-28 text-gray-500">Username</label>
                  <input
                    className="flex-1 border rounded-lg p-2 bg-gray-100"
                    type="text"
                    disabled
                    value={profileData.username}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="w-28 text-gray-500">Email</label>
                  <input
                    className="flex-1 border rounded-lg p-2 bg-gray-100"
                    type="text"
                    disabled
                    value={profileData.email}
                  />
                </div>
                <div className="flex justify-between items-center border rounded-lg p-3">
                  <span className="text-gray-500">Department</span>
                  <span className="font-medium">{profileData.department}</span>
                </div>
                <div className="flex justify-between items-center border rounded-lg p-3">
                  <span className="text-gray-500">Batch</span>
                  <span className="font-medium">{profileData.batch}</span>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-500">Bio</span>

                    {!isEditingBio && (
                      <button
                        className="text-sm text-blue-600 hover:underline"
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
                        className="w-full border rounded-lg p-2 mt-1"
                        rows={3}
                        value={bioDraft}
                        onChange={(e) => setBioDraft(e.target.value)}
                      />

                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={handleSaveBio}
                          className="px-3 py-1 bg-green-500 text-white rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelBio}
                          className="px-3 py-1 bg-gray-300 rounded"
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
      </div>

      <Footer />
    </>
  );
}

export default Profile;
