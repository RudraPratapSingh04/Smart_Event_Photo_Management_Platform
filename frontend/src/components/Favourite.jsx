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
      }finally{
        setIsImageOpen(false);
        fetchPhotos();
      }
    };
  
  useEffect(() => {
    if (!isImageOpen || !photos[imageSelected]) {
      return;
    }
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

  const fetchPhotos = async () => {
    try {
      console.log("Fetching favourite photos:");
      const response = await fetch(
        `http://localhost:8000/api/favourite_photos/`,
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
  },[]);
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
        No photos marked as favourites
      </div>
    );
  const getCSRFToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];
  };



  return (
    <>
      <Header />
      <div>
        <div></div>

      </div>
      {displayEventPhotos && displayEventPhotos ? (
        displayEventPhotos
      ) : (
        <div>No photos marked as favourites</div>
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

            <button className="border-white p-2 bg-white text-red-400 rounded-xl">
              Comment
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
