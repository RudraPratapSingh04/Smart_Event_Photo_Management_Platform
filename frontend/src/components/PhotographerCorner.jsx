import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function PhotographerCorner() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/user_uploaded_photos/", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPhotos(data);
        } else if (response.status === 401) {
          navigate("/login");
        } else {
          setError("Failed to load photos");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [navigate]);

  const filteredPhotos = photos.filter((photo) =>
    photo.event_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

 return (
  <div className="p-6">
    <div className="max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Photographer’s Corner
          </h1>
          <p className="text-sm text-gray-500">
            Your uploaded photos across all events
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Photos Uploaded</p>
          <p className="text-2xl font-semibold text-gray-800">
            {photos.length}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Likes</p>
          <p className="text-2xl font-semibold text-gray-800">
            {photos.reduce((acc, photo) => acc + (photo.likes_count || 0), 0)}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Downloads</p>
          <p className="text-2xl font-semibold text-gray-800">
            {photos.reduce((acc, photo) => acc + (photo.downloads || 0), 0)}
          </p>
        </div>
      </div>

     
      {!loading && photos.length > 0 && (
        <div className="w-full">
          <input
            type="text"
            placeholder="Search by event name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      
      {loading && (
        <p className="text-center text-gray-500">Loading your photos…</p>
      )}

      {error && (
        <p className="text-center text-red-500">{error}</p>
      )}

      {!loading && photos.length === 0 && (
        <p className="text-center text-gray-500">
          No photos uploaded yet.
        </p>
      )}

      {!loading && filteredPhotos.length === 0 && photos.length > 0 && (
        <p className="text-center text-gray-500">
          No photos found for “{searchQuery}”.
        </p>
      )}

      
      {!loading && filteredPhotos.length > 0 && (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          }}
        >
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => navigate(`/photo/${photo.id}`)}
              className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer"
            >
              <img
                src={photo.thumbnail || photo.image}
                alt="Uploaded"
                className="w-full h-36 object-cover"
              />

              <div className="p-2 text-xs space-y-1">
                <p className="font-medium text-gray-800 truncate">
                  {photo.event_name || "Event"}
                </p>

                <div className="flex justify-between text-gray-500">
                  <span>❤️ {photo.likes_count || 0}</span>
                  <span>⬇ {photo.downloads || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  </div>
);

}

export default PhotographerCorner;
