import React from 'react'
import {useParams} from 'react-router-dom'
import { useEffect,useState } from 'react'
import Header from './subcomponent/Header.jsx'
import Footer from './subcomponent/Footer.jsx'
function Event_Photos() {
   const {event_slug}=useParams();
   const [photos,setPhotos]=useState([]);
   const [error, setError] = useState("");
   const [loading, setLoading] = useState(true);

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


 
 


useEffect(()=>{
    const fetchPhotos=async()=>{
        try{
            console.log("Fetching photos for event:",event_slug);
            const response=await fetch(`http://localhost:8000/api/event_photos/${event_slug}/`,{
                method:"GET",
                credentials:"include",
        }
    );
    if(response.ok){
        console.log("Photos fetched successfully");
        
        const data=await response.json();
        console.log(response);
        setPhotos(data)
    }
    else{
        setError("Failed to fetch photos")
    }
    }
    catch(err){
        console.error("Error fetching photos:",err);
        setError("Error fetching photos");
    }
    finally {
        setLoading(false);
    }

};
fetchPhotos();
},[event_slug]);
if(loading){
    return (
      <div
        className="mx-auto w-full h-full flex items-middle justify-center
                text-2xl font-bold p-5"
      >
        Loading photos...
      </div>

    );

}
  
  
    return (
      <>
        <Header />
        <div>
          <div>Event_Photos</div>
          <button 
        //   onClick={uploadPhoto}
          className="bg-green-400 p-2 bold text-xl text-white">
            Upload Photos
          </button>
        </div>
        {displayEventPhotos && displayEventPhotos ? (
          displayEventPhotos
        ) : (
          <div>No photos available for this event.</div>
        )}
        <Footer />
      </>
    );
}

export default Event_Photos