import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "./subcomponent/Header.jsx";

import SideBar from "./subcomponent/Sidebar.jsx";
function Event_Photos() {
  const { event_slug } = useParams();
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploadPhotoError, setUploadPhotoError] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);
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
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [commentsData, setCommentsData] = useState([]);
  const [comment, setComment] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [photoForDeletion, setPhotoForDeletion] = useState([]);
  const [deletePhotoError, setDeletePhotoError] = useState("");
  const [aiTags, setAiTags] = useState([])
  const [showAiTags, setShowAiTags] = useState(false);
  const [photoSearchQuery, setPhotoSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); 
  useEffect(() => {
    if (!isImageOpen || !photos[imageSelected]) {
      return;
    }
    setShowCommentSection(false);
    setShowTagSection(false);
    setShowProperties(false);
    setShowAiTags(false);
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
          },
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
          setAiTags(data.ai_tags);
          setRefresh(false);
          
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
  }, [isImageOpen, imageSelected, isLiked,refresh]);

  const searchUsers = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/api/search_users/?q=${query}`,
        { credentials: "include" },
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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedPhotos(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  const loadCommentSection = async () => {
    setShowCommentSection(true);
    const csrf = getCSRFToken();
    try {
      const response = await fetch("http://localhost:8000/api/load_comments/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrf,
        },
        body: JSON.stringify({
          photo_id: photos[imageSelected].id,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setCommentsData(data.comments);
      }
    } catch (err) {
      console.error(err);
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
        },
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
        },
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
  const handleDownload = async () => {
    const imageId = photos[imageSelected]?.id;
    if (!imageId) {
      alert("Image not found");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8000/api/download_photo/${imageId}/`,
        { credentials: "include" },
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
        },
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
        {viewMode === "grid" && (
          <div className=" grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border gap-4 border-gray-300">
            {photos.map((photo, index) => {
              const isSelected = selectedPhotoIds.includes(photo.id);
              return (
                <div
                  key={photo.id}
                  className="relative"
                  onClick={() => {
                    if (selectMode) {
                      setSelectedPhotoIds((prev) =>
                        prev.includes(photo.id)
                          ? prev.filter((id) => id !== photo.id)
                          : [...prev, photo.id]
                      );
                    } else {
                      setImageSelected(index);
                      setIsImageOpen(true);
                    }
                  }}
                >
                  <img
                    src={photo.image}
                    alt="Event"
                    className={`w-full h-40 object-cover ${isSelected ? "opacity-80" : ""}`}
                  />
                  {selectMode && (
                    <span className={`absolute top-2 right-2 px-2 py-1 square rounded text-white text-sm ${isSelected ? "bg-green-400" : "bg-gray-600"}`}>
                      {isSelected ? "" : ""}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {viewMode === "masonry" && (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
            {photos.map((photo, index) => {
              const isSelected = selectedPhotoIds.includes(photo.id);
              return (
                <div
                  key={photo.id}
                  className={`mb-4 break-inside-avoid relative ${isSelected ? "opacity-80" : ""}`}
                  onClick={() => {
                    if (selectMode) {
                      setSelectedPhotoIds((prev) =>
                        prev.includes(photo.id)
                          ? prev.filter((id) => id !== photo.id)
                          : [...prev, photo.id]
                      );
                    } else {
                      setImageSelected(index);
                      setIsImageOpen(true);
                    }
                  }}
                >
                  <img src={photo.image} alt="Event" className="w-full object-cover rounded-lg mb-2" />
                </div>
              );
            })}
          </div>
        )}
        {viewMode === "date" && (
          <div className="space-y-6">
            {Object.entries(
              photos.reduce((acc, photo) => {
                const date = photo.uploaded_at ? photo.uploaded_at.slice(0, 10) : "Unknown";
                if (!acc[date]) acc[date] = [];
                acc[date].push(photo);
                return acc;
              }, {}),
            ).map(([date, list]) => (
              <div key={date}>
                <h3 className="font-semibold mb-2">{date}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {list.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="relative"
                      onClick={() => {
                        const globalIndex = photos.findIndex((p) => p.id === photo.id);
                        if (selectMode) {
                          setSelectedPhotoIds((prev) =>
                            prev.includes(photo.id)
                              ? prev.filter((id) => id !== photo.id)
                              : [...prev, photo.id]
                          );
                        } else {
                          setImageSelected(globalIndex);
                          setIsImageOpen(true);
                        }
                      }}
                    >
                      <img src={photo.image} alt="Event" className="w-full h-40 object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
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
        `http://localhost:8000/api/check_photographer/${event_slug}/`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      return data.is_photographer;
    } catch (error) {
      console.error("Error checking photographer status:", error);
    }
  };
  const handlePhotoSearch=async(query)=>{
    if (!query || query.trim() === "") {
      fetchPhotos();
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8000/api/search_event_photos/${event_slug}/?q=${query}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error("Error searching photos:", error);
    }
  }


  const handleAddComment = async () => {
    if (comment.trim() === "") return;
    const csrf = getCSRFToken();
    try {
      const response = await fetch("http://localhost:8000/api/add_comment/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrf,
        },
        body: JSON.stringify({
          photo_id: photos[imageSelected].id,
          content: comment,
        }),
      });
      if (response.ok) {
        setComment("");
        await loadCommentSection();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };
  const deletePhoto = async()=>{
    setUploadPhotoError("");
    if(selectedPhotoIds.length===0){
      setDeletePhotoError("No photos selected for deletion")
      return;
  }
  
    const csrfToken = getCSRFToken();
    try{
      const response = await fetch(`http://localhost:8000/api/delete_photos/${event_slug}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          photo_ids: selectedPhotoIds,
          event_slug: event_slug,
        }),
      });

      if (response.ok) {
        setSelectedPhotoIds([]);
        setSelectMode(false);
        await fetchPhotos();
        return;
      }

    
      const text = await response.text();
      console.error("Delete response not OK", response.status, text);
      if (response.status === 405) {
        console.log("DELETE not allowed, attempting POST fallback");
        const postResp = await fetch(`http://localhost:8000/api/delete_photos/${event_slug}/`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({ photo_ids: selectedPhotoIds, event_slug }),
        });
        const postText = await postResp.text();
        if (postResp.ok) {
          setSelectedPhotoIds([]);
          setSelectMode(false);
          await fetchPhotos();
          return;
        }
        console.error("POST fallback failed", postResp.status, postText);
        setDeletePhotoError(`Delete failed: ${postResp.status} ${postText}`);
        return;
      }

      setDeletePhotoError(`Delete failed: ${response.status} ${text}`);
    } catch (error) {
      setDeletePhotoError("Error deleting photos.");
      console.error("Error deleting photos:", error);
    } finally {
      setSelectMode(false);
      setSelectedPhotoIds([]);
    }
}
  const uploadPhoto = async () => {
    setUploadPhotoError("");
    let is_photographer = await check_photographer({event_slug});
    if (!is_photographer) {
      setUploadPhotoError("You do not have permission to upload photos.");
      return;
    }
    setShowModal(true);
  };

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setDeletePhotoError("");
    setSelectedPhotoIds([]);
  };

  return (
    <>
      <Header />
      <div className="flex">
        <SideBar />
        <main className="ml-64 flex-1 min-h-screen bg-gray-100 p-6">
          <div className="mb-4 w-full">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={uploadPhoto}
                  className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm"
                >
                  Upload
                </button>

                <button
                  onClick={toggleSelectMode}
                  className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm"
                >
                  {selectMode ? "Exit Select" : "Select"}
                </button>

                <button
                  onClick={deletePhoto}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                >
                  Delete
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-2 py-1 rounded text-sm ${viewMode === "grid" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800"}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("masonry")}
                  className={`px-2 py-1 rounded text-sm ${viewMode === "masonry" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800"}`}
                >
                  Masonry
                </button>
                <button
                  onClick={() => setViewMode("date")}
                  className={`px-2 py-1 rounded text-sm ${viewMode === "date" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800"}`}
                >
                  By Date
                </button>
              </div>
            </div>
            {uploadPhotoError && (
              <div className="text-sm text-red-500 mb-2">{uploadPhotoError}</div>
            )}
            {deletePhotoError && (
              <div className="text-sm text-red-500 mb-2">{deletePhotoError}</div>
            )}

            <input
              onChange={(e) => {
                setPhotoSearchQuery(e.target.value);
                handlePhotoSearch(e.target.value);
              }}
              type="search"
              className="w-full rounded px-3 py-2 border border-gray-300"
              placeholder="Search photos with upload date or AI tags"
            />
          </div>

          {loading ? (
            <div className="mx-auto w-full h-48 flex items-center justify-center text-2xl font-bold p-5">
              Loading photos...
            </div>
          ) : displayEventPhotos ? (
            displayEventPhotos
          ) : (
            <div>No photos available for this event.</div>
          )}
        </main>
      {uploading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold">Uploading photos...</p>
          </div>
        </div>
      )}
  
      {showModal && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50">
        
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`flex items-center justify-center w-3/4 h-1/2 p-5 rounded-xl border-2 border-dashed transition
    ${
      dragActive
        ? "bg-yellow-100 border-green-500"
        : "bg-yellow-50 border-gray-300"
    }
  `}
          >
            <p className="text-gray-700 text-lg">Drag & Drop photos here</p>
          </div>

          <input
            type="file"
            multiple
            accept="image/*"
            id="photoInput"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setSelectedPhotos((prev) => [
                  ...prev,
                  ...Array.from(e.target.files),
                ]);
              }
            }}
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
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
          <div className="relative w-full max-w-7xl h-[90vh] flex items-stretch gap-6">
            <div className="flex-1 flex items-center justify-center bg-transparent relative">
              <button className="absolute top-4 right-4 text-white text-3xl z-50" onClick={() => setIsImageOpen(false)}>✕</button>
              <button
                className={`absolute left-2 top-1/2 -translate-y-1/2 text-white text-4xl z-50 ${imageSelected === 0 ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}`}
                onClick={() => {
                  if (imageSelected > 0) setImageSelected(imageSelected - 1);
                }}
                aria-label="Previous"
              >
                ‹
              </button>

              <img src={photos[imageSelected]?.image} alt="Preview" className="max-h-[88vh] max-w-full object-contain rounded" />

              <button
                className={`absolute right-2 top-1/2 -translate-y-1/2 text-white text-4xl z-50 ${imageSelected === photos.length - 1 ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}`}
                onClick={() => {
                  if (imageSelected < photos.length - 1) setImageSelected(imageSelected + 1);
                }}
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
                <button onClick={() => { loadCommentSection(); setShowCommentSection(true); }} className="w-full py-2 rounded bg-green-50 text-green-800">Comments</button>
                <button onClick={() => { loadTagSection(); setShowTagSection(true); }} className="w-full py-2 rounded bg-blue-50 text-blue-800">Tags</button>
                <button onClick={handleFavourite} className={`w-full py-2 rounded ${isFavourite ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-800'}`}>{isFavourite ? 'Added to Favourites' : 'Add to Favourites'}</button>
                <button onClick={handleDownload} className="w-full py-2 rounded bg-gray-100 text-gray-800">Download</button>
                <button onClick={() => setShowAiTags(!showAiTags)} className="w-full py-2 rounded bg-white text-indigo-600 border">AI Tags</button>
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
              {showAiTags && (
                <div className="bg-indigo-50 p-3 rounded mb-3">
                  <h4 className="text-sm font-semibold text-indigo-700 mb-2">AI Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {(aiTags && aiTags.length > 0) ? aiTags.map((t, i) => (
                      <span key={i} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">{t}</span>
                    )) : (
                      <p className="text-sm text-gray-500">No AI tags available</p>
                    )}
                  </div>
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

              {showCommentSection && (
                <div className="mb-3">
                  <div className="bg-green-100 p-3 rounded-t flex items-center justify-between">
                    <h4 className="font-semibold text-green-800">Comments</h4>
                    <button onClick={() => setShowCommentSection(false)} className="text-sm text-gray-600">Close</button>
                  </div>
                  <div className="border rounded-b p-3 bg-white">
                    <div className="mb-2">
                      <input type="text" id="commentInput" placeholder="Type a comment here" className="w-full p-2 border rounded" onChange={(e) => setComment(e.target.value)} />
                      <button className="mt-2 w-full bg-green-600 text-white py-2 rounded" onClick={() => { handleAddComment(); document.getElementById('commentInput').value = ''; }}>Add Comment</button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {commentsData.length === 0 ? (<p className="text-sm text-gray-500">No comments yet</p>) : (commentsData.map((c) => (<div key={c.id} className="border-b pb-2 mb-2"><div className="flex justify-between"><p className="font-semibold text-gray-700">@{c.commented_by}</p><p className="text-sm text-gray-500">{c.commented_at.slice(11,16)}</p></div><p className="text-gray-700">{c.content}</p></div>)))}
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      )}
    
</div>
      
    </>
  );
}


export default Event_Photos;

