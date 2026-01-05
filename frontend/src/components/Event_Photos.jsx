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
  const [imageSelected, setImageSelected] = useState(0);
  const [uploading,setUploading]=useState(false);
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
  
  const displayEventPhotos =
    photos.length > 0 ? (
      <div className="p-4 overflow-x-auto">
        <div className=" grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border gap-4 border-gray-300">
          {photos.map((photo) => (
            <div
              key={photo.id}
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
    const handleUpload=async()=>{
        setShowModal(false);
       
        const csrfToken = getCSRFToken();
        if(!selectedPhotos || selectedPhotos.length===0){
            setUploadPhotoError("No photos selected for upload.");
            return;
        }
         setUploading(true);
        const formData=new FormData();
        for(let i=0;i<selectedPhotos.length;i++){
            formData.append('photos',selectedPhotos[i]);
        }
        formData.append("event_slug",event_slug);
        try{
            const response = await fetch(
              "http://localhost:8000/api/upload_photos/",
              {
                method: "POST",
                credentials: "include",
                body: formData,
                headers: {
                  "X-CSRFToken": csrfToken,
                },
              }
            );
        if(response.ok){
            setShowModal(false);
            setSelectedPhotos([]);
            await fetchPhotos();

        }
        else{
            setUploading(false)
            setUploadPhotoError("Failed to upload photos.");
        }
        }
        catch(err){
            setUploadPhotoError("Error uploading photos.");
            console.error("Error uploading photos:",err);
        }finally{
            setUploading(false);
        }
           
    }
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
      <Footer />
    </>
  );
}

export default Event_Photos;
