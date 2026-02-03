import React, { Profiler } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  Heart,
  Image,
  Camera,
  User
} from "lucide-react";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(`${path}/`);

  const navItem = (path, label, Icon) => (
    <button
      onClick={() => navigate(path)}
      className={`group relative flex items-center gap-3 px-5 py-3 text-sm transition w-full text-left
        ${
          isActive(path)
            ? `${getColorClasses(path).bgClass} text-white font-semibold`
            : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }`}
    >
      {isActive(path) && (
        <span className={`absolute left-0 top-0 h-full w-1 ${getColorClasses(path).indicatorClass} rounded-r`} />
      )}

      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  function getColorClasses(path) {
    switch (path) {
      case "/dashboard/events":
        return { bgClass: "bg-indigo-600", indicatorClass: "bg-indigo-400" };
      case "/dashboard/favourite":
        return { bgClass: "bg-pink-600", indicatorClass: "bg-pink-400" };
      case "/dashboard/tagged_images":
        return { bgClass: "bg-green-600", indicatorClass: "bg-green-400" };
      case "/dashboard/photographer_corner":
        return { bgClass: "bg-amber-600", indicatorClass: "bg-amber-400" };
      case "/profile":
        return { bgClass: "bg-purple-600", indicatorClass: "bg-purple-400" };
      default:
        return { bgClass: "bg-gray-800", indicatorClass: "bg-indigo-500" };
    }
  }

  return (
    <aside className="fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-linear-to-b from-indigo-600 via-indigo-700 to-gray-900 border-r border-gray-800 flex flex-col overflow-auto">
      <div className="px-5 py-4 border-b border-gray-800">
        <h1 className="text-lg font-bold text-white tracking-wide">
          Photo Dashboard
        </h1>
        <p className="text-xs text-gray-400">
          Manage your events
        </p>
      </div>
      <nav className="flex-1 py-4 space-y-1">
        {navItem("/dashboard/events", "Events", Calendar)}
        {navItem("/dashboard/favourite", "Favourites", Heart)}
        {navItem("/dashboard/tagged_images", "Tagged Images", Image)}
        {navItem("/dashboard/photographer_corner", "Photographer's Corner", Camera)}
        {navItem("/profile", "Profile", User)}
      </nav>

    </aside>
  );
}

export default Sidebar;
