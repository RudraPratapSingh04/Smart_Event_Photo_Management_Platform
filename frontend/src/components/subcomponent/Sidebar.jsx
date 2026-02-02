import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  Heart,
  Image,
  Camera
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
      className={`group relative flex items-center gap-3 px-5 py-3 text-sm transition
        ${
          isActive(path)
            ? "bg-gray-800 text-white font-semibold"
            : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }`}
    >
      {isActive(path) && (
        <span className="absolute left-0 top-0 h-full w-1 bg-indigo-500 rounded-r" />
      )}

      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <aside className="h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
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
      </nav>

    </aside>
  );
}

export default Sidebar;
