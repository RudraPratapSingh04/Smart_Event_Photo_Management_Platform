import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "./subcomponent/Header.jsx";
import Footer from "./subcomponent/Footer.jsx";

function Event_Photos() {
  const { event_slug } = useParams();
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploadPhotoError, setUploadPhotoError] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
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
      console.log("Fetching photos for event:", event_slug);
      const response = await fetch(
        `http://localhost:8000/api/event_photos/${event_slug}/`,
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
  }, [event_slug]);
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
    }
  };

  const handleShowProperties = () => {
    setShowProperties(!showProperties);
  };
  const displayEventPhotos =
    photos.length > 0 ? (
      <div className="p-4 overflow-x-auto">
        <div className=" grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border gap-4 border-gray-300">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => {
                setImageSelected(index);

                setIsImageOpen(true);
              }}
              //   className="border border-gray-300 flex items-center justify-center p-2"
            >
              <img
                src={photo.image}
                alt="Event"
                className="w-full h-40 object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="p-4 text-gray-500">
        No photos available for this event.
      </div>
    );
  const getCSRFToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];
  };
  const handleUpload = async () => {
    setShowModal(false);

    const csrfToken = getCSRFToken();
    if (!selectedPhotos || selectedPhotos.length === 0) {
      setUploadPhotoError("No photos selected for upload.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < selectedPhotos.length; i++) {
      formData.append("photos", selectedPhotos[i]);
    }
    formData.append("event_slug", event_slug);
    try {
      const response = await fetch("http://localhost:8000/api/upload_photos/", {
        method: "POST",
        credentials: "include",
        body: formData,
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });
      if (response.ok) {
        setShowModal(false);
        setSelectedPhotos([]);
        await fetchPhotos();
      } else {
        setUploading(false);
        setUploadPhotoError("Failed to upload photos.");
      }
    } catch (err) {
      setUploadPhotoError("Error uploading photos.");
      console.error("Error uploading photos:", err);
    } finally {
      setUploading(false);
    }
  };
  const check_photographer = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/check_photographer/",
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      return data.is_photographer;
    } catch (error) {
      console.error("Error checking photographer status:", error);
    }
  };

  const uploadPhoto = async () => {
    setUploadPhotoError("");
    let is_photographer = await check_photographer();
    if (!is_photographer) {
      setUploadPhotoError("You do not have permission to upload photos.");
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <Header />
      <div>
        <div>Event_Photos</div>
        <button
          onClick={uploadPhoto}
          className="bg-green-400 p-2 bold text-xl text-white"
        >
          Upload Photos
        </button>

        {uploadPhotoError && (
          <div className="text-red-500 mt-2">{uploadPhotoError}</div>
        )}
      </div>
      {displayEventPhotos && displayEventPhotos ? (
        displayEventPhotos
      ) : (
        <div>No photos available for this event.</div>
      )}
      {uploading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold">Uploading photos...</p>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
          {/* <div className="bg-amber-300">Upload here</div> */}
          <div className="bg-yellow-50 flex items-center justify-center w-3/4 p-5 rounded-xl h-1/2">
            Drag and Drop area for photo upload
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            id="photoInput"
            className="hidden"
            onChange={(e) => setSelectedPhotos(e.target.files)}
          />
          <div className="text-white">
            {selectedPhotos.length} photos selected
          </div>
          <button
            onClick={() => document.getElementById("photoInput").click()}
            className="text-white bg-green-400 p-3 mt-2 rounded-2xl"
          >
            Browse
          </button>
          <button
            className="text-white bg-blue-500 p-3 mt-2 rounded-2xl"
            onClick={handleUpload}
          >
            Upload Selected Photos
          </button>
          <button
            className="text-white bg-red-500 p-3 mt-2 rounded-2xl"
            onClick={() => {
              setShowModal(false);
              setSelectedPhotos([]);
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {isImageOpen && (
        <div className="overflow-x-auto fixed inset-0 z-50 bg-black-800 bg-black bg-opacity-80 flex flex-col items-center justify-center">
          <div className="relative max-w-6xl w-full flex items-center justify-center">
            <button
              className="absolute top-4 right-4 text-white text-3xl"
              onClick={() => setIsImageOpen(false)}
            >
              ✕
            </button>

            {showTagSection && (
              <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <div className="bg-yellow-100 w-full max-w-md rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h1 className="text-gray-600 font-semibold">Tag Section</h1>
                    <button
                      onClick={() => {
                        setShowTagSection(false);
                        setShowTagUserInput(false);
                        setTagQuery("");
                        setSearchResults([]);
                      }}
                      className="text-xl font-bold text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="bg-pink-200 p-3 rounded-lg">
                    <h2 className="font-semibold mb-2">Tagged By</h2>

                    {taggedBy.length > 0 ? (
                      taggedBy.map((user) => (
                        <p key={user.id} className="text-gray-700">
                          @{user.username}
                        </p>
                      ))
                    ) : (
                      <p className="text-gray-500">No one has tagged yet</p>
                    )}
                  </div>
                  <div className="bg-pink-200 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="font-semibold">Tagged Users</h2>
                      <button
                        className="bg-amber-700 text-white p-2 rounded-xl"
                        onClick={() => {
                          setShowTagUserInput(!showTagUserInput);
                          setTagQuery("");
                          setSearchResults([]);
                        }}
                      >
                        {showTagUserInput ? "Hide search" : "Tag a friend"}
                      </button>
                    </div>
                    {showTagUserInput && (
                      <div className="mb-3">
                        <input
                          type="text"
                          value={tagQuery}
                          onChange={(e) => {
                            setTagQuery(e.target.value);
                            searchUsers(e.target.value);
                          }}
                          placeholder="Search username..."
                          className="w-full p-2 rounded border"
                        />
                        {tagging && (
                          <p className="text-xs text-gray-600 mt-1">
                            Tagging...
                          </p>
                        )}
                        {searchResults.length > 0 && (
                          <div className="bg-white mt-1 rounded shadow max-h-40 overflow-y-auto">
                            {searchResults.map((user) => (
                              <div
                                key={user.id}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => tagUser(user.id)}
                              >
                                @{user.username}
                              </div>
                            ))}
                          </div>
                        )}
                        {!tagging && tagQuery && searchResults.length === 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            No users found
                          </p>
                        )}
                      </div>
                    )}
                    {taggedUsers.length === 0 ? (
                      <p className="text-gray-500">No users tagged</p>
                    ) : (
                      <ul className="space-y-1">
                        {taggedUsers.map((user) => (
                          <li key={user.id} className="text-gray-700">
                            @{user.username}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {imageSelected > 0 && (
              <button
                className="absolute left-4 text-white text-4xl"
                onClick={() => setImageSelected(imageSelected - 1)}
              >
                ‹
              </button>
            )}
            <img
              src={photos[imageSelected]?.image}
              alt="Preview"
              className="max-h-screen max-w-full object-contain"
            />

            {imageSelected < photos.length - 1 && (
              <button
                className="absolute right-4 text-white text-4xl"
                onClick={() => setImageSelected(imageSelected + 1)}
              >
                ›
              </button>
            )}
          </div>
          <div className="text-white">
            {likesCount} Likes {commentsCount} Comments{" "}
          </div>
          <div className=" gap-5 flex text-white mt-5 w-full justify-center max-w-6xl">
            {isLiked ? (
              <button
                onClick={handleLike}
                className="border-white p-2 bg-red-600 text-white rounded-xl"
              >
                Liked
              </button>
            ) : (
              <button
                onClick={handleLike}
                className="border-white p-2 bg-white text-red-400 rounded-xl"
              >
                Like
              </button>
            )}

            <button
          
            className="border-white p-2 bg-white text-red-400 rounded-xl">
              Comment
            </button>
            <button
              onClick={loadTagSection}
              className="border-white p-2 bg-white text-red-400 rounded-xl"
            >
              Tag
            </button>
            {isFavourite ? (
              <button
                onClick={handleFavourite}
                className="border-white p-2 bg-red-600 text-white rounded-xl"
              >
                Added to Favourites
              </button>
            ) : (
              <button
                onClick={handleFavourite}
                className="border-white p-2 bg-white text-red-400 rounded-xl"
              >
                Add to Favourites
              </button>
            )}
            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = photos[imageSelected]?.image;
                link.download = `photo_${photos[imageSelected]?.id}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="border-white p-2 bg-white text-red-400 rounded-xl"
            >
              Download
            </button>
            <button
              onClick={handleShowProperties}
              className="border-white p-2 bg-white text-red-400 rounded-xl"
            >
              Properties
            </button>
          </div>
          {showProperties && (
            <div className="text-white mt-5 ">
              <p>Shutter_speed:{shutterSpeed}</p>
              <p>Camera Model:{cameraModel}</p>
              <p>GPS Location : {gpsLocation}</p>
              <p>Upload Date : {uploadDate.slice(0, 10)}</p>
              <p>Aperture:{aperture}</p>
            </div>
          )}
        </div>
      )}

      <Footer />
    </>
  );
}

export default Event_Photos;
