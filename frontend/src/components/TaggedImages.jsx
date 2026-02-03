import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function Event_Photos() {
  const { event_slug } = useParams();
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [imageSelected, setImageSelected] = useState(0);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [aperture, setAperture] = useState("");
  const [shutterSpeed, setShutterSpeed] = useState("");
  const [gpsLocation, setGPSLocation] = useState("");
  const [cameraModel, setCameraModel] = useState("Sony");
  const [uploadDate, setUploadDate] = useState("");
    const [showTagSection, setShowTagSection] = useState(false);
    const [taggedBy, setTaggedBy] = useState([]);
    const [taggedUsers, setTaggedUsers] = useState([]);
    const [showTagUserInput, setShowTagUserInput] = useState(false);
    const [tagQuery, setTagQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [tagging, setTagging] = useState(false);
  const handleFavourite = async () => {
  const csrfToken = getCSRFToken();
    try {
      const response = await fetch(
        "http://localhost:8000/api/toggle_favourite/",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({
            photo_id: photos[imageSelected].id,
            is_Favourite: isFavourite,
          }),
        }
      );
      if (response.ok) {
        setIsFavourite(!isFavourite);
      }
    } catch (err) {
      console.error("Error toggling favourite:", err);
    } finally {
      fetchPhotos();
    }
  };




  useEffect(() => {
    if (!isImageOpen || !photos[imageSelected]) {
      return;
    }
    setShowTagSection(false);
    setShowProperties(false);
    const photo_id = photos[imageSelected].id;
    const fetchProperties = async () => {
      const csrfToken = getCSRFToken();
      setLoadingProperties(true);
      try {
        const response = await fetch(
          "http://localhost:8000/api/photo_properties/",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrfToken,
            },
            body: JSON.stringify({
              photo_id: photos[imageSelected].id,
            }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          setLikesCount(data.likes_count);
          setCommentsCount(data.comments_count);
          setIsLiked(data.is_Liked);
          setLoadingProperties(false);
          setIsFavourite(data.isFavourite);
          setAperture(data.aperture);
          setShutterSpeed(data.shutter_speed);
          setGPSLocation(data.gps_location);
          setCameraModel(data.camera_model);
          setUploadDate(data.uploaded_at);
        } else {
          console.error("Failed to fetch photo properties");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProperties(false);
      }
    };
    fetchProperties();
  }, [isImageOpen, imageSelected, isLiked]);

const searchUsers = async (query) => {
  if (!query) {
    setSearchResults([]);
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:8000/api/search_users/?q=${query}`,
      { credentials: "include" }
    );
    const data = await res.json();
    setSearchResults(data);
  } catch (err) {
    console.error(err);
  }
};
const tagUser = async (userId) => {
  const csrf = getCSRFToken();
  setTagging(true);

  try {
    const res = await fetch("http://localhost:8000/api/tagUser/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrf,
      },
      body: JSON.stringify({
        photo_id: photos[imageSelected].id,
        user_id: userId,
      }),
    });

    if (res.ok) {
      await loadTagSection();
      setTagQuery("");
      setSearchResults([]);
      setShowTagUserInput(false);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setTagging(false);
  }
};

const loadTagSection = async () => {
  setShowTagSection(true);
  const csrf = getCSRFToken();
  try {
    const response = await fetch(
      "http://localhost:8000/api/load_tagged_users/",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrf,
        },
        body: JSON.stringify({
          photo_id: photos[imageSelected].id,
        }),
      }
    );
    if (response.ok) {
      const data = await response.json();
      setTaggedBy(data.tagged_by);
      setTaggedUsers(data.tagged_users);
    }
  } catch (err) {
    console.error(err);
  }
};
  const fetchPhotos = async () => {
    try {
      console.log("Fetching favourite photos:");
      const response = await fetch(
        `http://localhost:8000/api/tagged_images/`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.ok) {
        console.log("Photos fetched successfully");

        const data = await response.json();
        console.log(response);
        setPhotos(data);
      } else {
        setError("Failed to fetch photos");
      }
    } catch (err) {
      console.error("Error fetching photos:", err);
      setError("Error fetching photos");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPhotos();
  }, []);
  if (loading) {
    return (
      <div
        className="mx-auto w-full h-full flex items-middle justify-center
                text-2xl font-bold p-5"
      >
        Loading photos...
      </div>
    );
  }
  const handleLike = async () => {
    const csrfToken = getCSRFToken();
    try {
      const response = await fetch("http://localhost:8000/api/toggle_like/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          photo_id: photos[imageSelected].id,
          is_Liked: isLiked,
        }),
      });
      if (response.ok) {
        setIsLiked(!isLiked);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };



  const handleShowProperties = () => {
    setShowProperties(!showProperties);
  };
  const displayEventPhotos =
    photos.length > 0 ? (
      <div className="p-6">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
        >
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => {
                setImageSelected(index);
                setIsImageOpen(true);
              }}
              className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer"
            >
              <img
                src={photo.thumbnail || photo.image}
                alt="Tagged"
                className="w-full h-36 object-cover"
              />

              <div className="p-2 text-xs">
                <p className="font-medium text-gray-800 truncate">
                  {photo.event_name || "Event"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="p-4 text-gray-500">You have not been tagged yet.</div>
    );


     const handleDownload = async () => {
       const imageId = photos[imageSelected]?.id;
       if (!imageId) {
         alert("Image not found");
         return;
       }
       try {
         const response = await fetch(
           `http://localhost:8000/api/download_photo/${imageId}/`,
           { credentials: "include" }
         );
         if (!response.ok) {
           alert("Failed to download image");
           return;
         }
         const blob = await response.blob();
         const url = window.URL.createObjectURL(blob);
         const link = document.createElement("a");
         link.href = url;
         link.download = `photo_${imageId}.jpg`;
         document.body.appendChild(link);
         link.click();
         link.remove();
         window.URL.revokeObjectURL(url);
       } catch (e) {
         alert("Error downloading image");
       }
     };

  const getCSRFToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];
  };

  return (
    <>
      <div className="p-6">
        <div className="max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Tagged Images</h1>
              <p className="text-sm text-gray-500">Photos you've been tagged in across events</p>
            </div>
          </div>
        </div>
      </div>
      {displayEventPhotos && displayEventPhotos ? (
        displayEventPhotos
      ) : (
        <div className="p-4 text-gray-500">You have not been tagged yet.</div>
      )}

      {isImageOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
          <div className="relative w-full max-w-7xl h-[90vh] flex items-stretch gap-6">
            <div className="flex-1 flex items-center justify-center bg-transparent relative">
              <button className="absolute top-4 right-4 text-white text-3xl z-50" onClick={() => setIsImageOpen(false)}>✕</button>

              <button
                className={`absolute left-2 top-1/2 -translate-y-1/2 text-white text-4xl z-50 ${imageSelected === 0 ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}`}
                onClick={() => { if (imageSelected > 0) setImageSelected(imageSelected - 1); }}
                aria-label="Previous"
              >
                ‹
              </button>

              <img src={photos[imageSelected]?.image} alt="Preview" className="max-h-[88vh] max-w-full object-contain rounded" />

              <button
                className={`absolute right-2 top-1/2 -translate-y-1/2 text-white text-4xl z-50 ${imageSelected === photos.length - 1 ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}`}
                onClick={() => { if (imageSelected < photos.length - 1) setImageSelected(imageSelected + 1); }}
                aria-label="Next"
              >
                ›
              </button>
            </div>

            <aside className="w-96 bg-white rounded-lg p-4 overflow-y-auto shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{photos[imageSelected]?.title || 'Photo'}</h3>
                  <p className="text-sm text-gray-500">{uploadDate ? uploadDate.slice(0,10) : ''}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{likesCount} Likes</div>
                  <div className="text-sm text-gray-600">{commentsCount} Comments</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <button onClick={handleLike} className={`w-full py-2 rounded ${isLiked ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800'}`}>{isLiked ? 'Liked' : 'Like'}</button>
                <button onClick={() => { loadTagSection(); setShowTagSection(true); }} className="w-full py-2 rounded bg-blue-50 text-blue-800">Tags</button>
                <button onClick={handleFavourite} className={`w-full py-2 rounded ${isFavourite ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-800'}`}>{isFavourite ? 'Added to Favourites' : 'Add to Favourites'}</button>
                <button onClick={handleDownload} className="w-full py-2 rounded bg-gray-100 text-gray-800">Download</button>
                <button onClick={handleShowProperties} className="w-full py-2 rounded bg-gray-100 text-gray-800">Properties</button>
              </div>

              {showProperties && (
                <div className="bg-gray-50 p-3 rounded mb-3">
                  <p className="text-sm">Shutter speed: <span className="font-medium">{shutterSpeed}</span></p>
                  <p className="text-sm">Camera Model: <span className="font-medium">{cameraModel}</span></p>
                  <p className="text-sm">GPS Location: <span className="font-medium">{gpsLocation}</span></p>
                  <p className="text-sm">Upload Date: <span className="font-medium">{uploadDate ? uploadDate.slice(0,10) : ''}</span></p>
                  <p className="text-sm">Aperture: <span className="font-medium">{aperture}</span></p>
                </div>
              )}
              {showTagSection && (
                <div className="mb-3">
                  <div className="bg-blue-100 p-3 rounded-t flex items-center justify-between">
                    <h4 className="font-semibold text-blue-800">Tags</h4>
                    <button onClick={() => setShowTagSection(false)} className="text-sm text-gray-600">Close</button>
                  </div>
                  <div className="border rounded-b p-3 bg-white">
                    <div className="mb-2">
                      <h5 className="text-sm font-medium text-gray-700">Tagged By</h5>
                      {taggedBy.length > 0 ? taggedBy.map((u) => (<p key={u.id} className="text-sm text-gray-700">@{u.username}</p>)) : (<p className="text-sm text-gray-500">No one has tagged yet</p>)}
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="text-sm font-medium text-gray-700">Tagged Users</h5>
                        <button className="text-sm text-indigo-600" onClick={() => { setShowTagUserInput(!showTagUserInput); setTagQuery(''); setSearchResults([]); }}>{showTagUserInput ? 'Hide' : 'Tag'}</button>
                      </div>
                      {showTagUserInput && (
                        <div className="mb-2">
                          <input type="text" value={tagQuery} onChange={(e) => { setTagQuery(e.target.value); searchUsers(e.target.value); }} placeholder="Search username..." className="w-full p-2 border rounded" />
                          {searchResults.length > 0 && (<div className="mt-2 rounded shadow max-h-32 overflow-y-auto bg-white">{searchResults.map((user) => (<div key={user.id} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => tagUser(user.id)}>@{user.username}</div>))}</div>)}
                        </div>
                      )}
                      {taggedUsers.length === 0 ? (<p className="text-sm text-gray-500">No users tagged</p>) : (<ul className="space-y-1">{taggedUsers.map((user) => (<li key={user.id} className="text-sm text-gray-700">@{user.username}</li>))}</ul>)}
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      )}
    </>
  );
}

export default Event_Photos;
