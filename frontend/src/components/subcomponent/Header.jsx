import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationCenter from "../NotificationCenter.jsx";

function Header() {
  const navigate = useNavigate();
  function getCSRFToken() {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];
  }
  const clearClientAuthState = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    sessionStorage.clear();
    document.cookie = "csrftoken=; Max-Age=0; path=/";
    document.cookie = "sessionid=; Max-Age=0; path=/";
  };
  const logout = async () => {
    try {
      const csrfToken = getCSRFToken();
      await fetch("http://localhost:8000/api/logout_session/", {
        method: "POST",
        credentials: "include",
        headers: csrfToken ? { "X-CSRFToken": csrfToken } : undefined,
      });
    } catch (err) {
    } finally {
      clearClientAuthState();
      navigate("/");
    }
  };
  const viewProfile = () => navigate("/profile");
  const [profileImage, setProfileImage] = useState(null);
  useEffect(() => {
    const img = localStorage.getItem("profile_image");
    if (img) setProfileImage(img);

    const handleStorage = (e) => {
      if (e.key === "profile_image") setProfileImage(e.newValue);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-linear-to-r from-indigo-600 via-indigo-500 to-purple-600 shadow-md">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-white/30 blur-md rounded-full"></div>
            <div className="relative bg-white rounded-full p-2 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-indigo-600"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 7a5 5 0 100 10 5 5 0 000-10z"
                  fill="currentColor"
                />
                <path
                  d="M4 7h2l1-2h10l1 2h2v10H4V7z"
                  fill="currentColor"
                  opacity="0.9"
                />
              </svg>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="text-white text-2xl font-extrabold tracking-tight"
          >
            Photo<span className="text-indigo-200">Go</span>
          </Link>
        </div>
        <div className="hidden md:flex flex-1 justify-center">
          <div className="relative w-full max-w-xl">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <NotificationCenter />
          <button
            onClick={logout}
            className="text-white text-sm font-medium hover:text-indigo-200 transition"
          >
            Logout
          </button>
          <div
            onClick={viewProfile}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden cursor-pointer ring-2 ring-white/60 hover:ring-indigo-200 transition"
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="profile"
                className="w-10 h-10 object-cover"
              />
            ) : (
              <div className="text-indigo-600 font-bold">
                {(localStorage.getItem("username") || "")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
