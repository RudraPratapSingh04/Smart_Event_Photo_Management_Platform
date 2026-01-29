import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./subcomponent/Header.jsx";
import Footer from "./subcomponent/Footer.jsx";

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
          console.log("Fetched photos data:", data);
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
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div>
          <div>
          <h1 className="text-3xl font-bold mb-4">Photographer's Corner</h1>
          <p className="text-gray-600 mb-6">
            Your uploaded photos from all events.
          </p>
</div>
<div>
  <p>Total Likes: {photos.reduce((acc, photo) => acc + (photo.likes_count || 0), 0)}</p>
  <p>Total downloads: {photos.reduce((acc, photo) => acc + (photo.downloads || 0), 0)}</p>
</div>

</div>
          {!loading && photos.length > 0 && (
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by event name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {loading && <p className="text-center text-gray-500">Loading your photos...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && photos.length === 0 && (
            <p className="text-center text-gray-500">No photos uploaded yet.</p>
          )}

          {!loading && filteredPhotos.length === 0 && photos.length > 0 && (
            <p className="text-center text-gray-500">No photos found for "{searchQuery}".</p>
          )}

          {!loading && filteredPhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/photo/${photo.id}`)}
                >
                  <img
                    src={photo.thumbnail || photo.image}
                    alt="Uploaded photo"
                    className="w-full h-32 object-cover"
                  />
                  <div className="bg-gray-50 p-2 text-xs">
                    <p className="font-semibold truncate text-gray-800">{photo.event_name || "Event"}</p>
                    <div className="flex justify-between items-center mt-1 text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                        </svg>
                        {photo.likes_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        {photo.downloads || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default PhotographerCorner;
