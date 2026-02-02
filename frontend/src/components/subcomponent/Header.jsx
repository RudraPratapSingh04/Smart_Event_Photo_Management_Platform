import React from "react";
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

  return (
    <header className="w-full bg-linear-to-r from-indigo-600 to-indigo-500 shadow">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-full p-2 flex items-center justify-center">
            <svg className="w-7 h-7 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 7a5 5 0 100 10 5 5 0 000-10z" fill="currentColor" />
              <path d="M4 7h2l1-2h10l1 2h2v10H4V7z" fill="currentColor" opacity="0.9" />
            </svg>
          </div>
          <Link to="/dashboard" className="text-white text-2xl font-extrabold tracking-tight">PhotoGo</Link>
        </div>

        <div className="flex-1 hidden md:flex justify-center">
          <div className="w-full max-w-xl">
            <input placeholder="Search events, users, photos..." className="w-full rounded-full px-4 py-2 text-sm focus:outline-none" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationCenter />
          <button onClick={viewProfile} className="hidden sm:inline-flex items-center gap-2 bg-white bg-opacity-10 text-white px-3 py-2 rounded-lg hover:bg-opacity-20">View Profile</button>
          <button onClick={logout} className="inline-flex items-center gap-2 bg-white text-indigo-600 px-3 py-2 rounded-lg font-semibold">Logout</button>
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-indigo-600 font-bold">{(localStorage.getItem("username")||"").charAt(0).toUpperCase()}</div>
        </div>
      </div>
    </header>
  );
}

export default Header;
