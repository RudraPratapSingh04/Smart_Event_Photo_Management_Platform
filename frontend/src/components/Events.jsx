import Header from './subcomponent/Header.jsx'
import Footer from './subcomponent/Footer.jsx'
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { render } from 'react-dom';
function Events() {
  const navigate = useNavigate();
  const [EventsData, setEventsData] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    event_cc_username: '',
    event_date: '',
    member_only: false,
  });
  const view_event_photos=(event_slug)=>{
    navigate(`/event_photos/${event_slug}`);
  }
  const check_Guest=async()=>{
    try{
      const response = await fetch("http://localhost:8000/api/check_guest/", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data=await response.json();
      return data.is_guest;
    }catch(error){
      console.error("Error checking guest status:", error);
    }
  }
  const getCSRFToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];
  };
  
  const createNewEvent=async()=>{
    setError("");
    let is_guest=await check_Guest();
    if(is_guest){
      setError("You do not have permission to create event")
      return;
    }
  setShowModal(true)

  }
const AddEvent = async (e) => {
  e.preventDefault();
  const csrfToken = getCSRFToken();
  setShowModal(false);
  setError("");
  console.log("Add Event Called");
  try{
    const response=await fetch("http://localhost:8000/api/addnew_event/",{
      method:"POST",
      credentials:"include",
      headers:{
        "Content-Type":"application/json",
        "X-CSRFToken":csrfToken,
      },
      body:JSON.stringify({
        title:formData.title,
        event_cc_username:formData.event_cc_username,
        event_date:formData.event_date,
        member_only:formData.member_only,

      })
    });
    const data=await response.json();
    if(response.ok){
      window.location.reload();

    }    

    else{
      setError(data.error || "Failed to create event");
    }
  }catch(error){
    console.error("Error creating event:",error);
    setError("Error creating event");
  }

};


  const displayEventsData=EventsData && EventsData.map((event)=>(
    <div key={event.id} className="border p-4 mb-4 w-full flex flex-col gap-2 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">{event.title}</h2>
      <p>Coordinator : {event.event_head_username}</p>
      <p>Date : {event.event_date.slice(0, 10)}</p>
      <p>Event Type : {event.member_only ? "Members Only" : "Public"}</p>
      <button 
      onClick={()=>view_event_photos(event.slug)}
      className="bg-blue-600 p-2 text-white justify-center align-middle">View</button>
    </div>
  ));
useEffect(() => {

const loadEvents=async()=>{
  try{
 const response = await fetch("http://localhost:8000/api/view_events/", {
   method: "GET",
   credentials: "include",
   headers: {
     "Content-Type": "application/json",
   },
 });
 const data=await response.json();
 setEventsData(data);
 console.log(data)
}catch(error){
  console.error("Error fetching Events data:", error);
}   
};
loadEvents();
}, []);


  return (
    <>
      <Header />
      <div className="mx-auto justify-center p-4 items-center flex flex-col">
        <div>Events Content</div>
        <button onClick={createNewEvent} className="bg-red-400 p-4 mt-2 mb-2">
          Create New Event
        </button>
        <div>
          {error && <p className="text-red-500 p-2 mt-0">{error}</p>}
          {EventsData ? <>{displayEventsData}</> : <p></p>}
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 max-h-96">
            Fill the event details
            <form onSubmit={AddEvent} type="submit" className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Title"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value,
                  })
                }
                required
                className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />

              <input
                type="date"
                placeholder="Date Of Event"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    event_date: e.target.value,
                  })
                }
                required
                className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <input
                type="text"
                placeholder="Event_cc (if any)"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    event_cc_username: e.target.value,
                  })
                }
                className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <div className="flex items-center gap-2 align-middle justify-center">
                <input
                  type="checkbox"
                  placeholder="MemberOnly"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      member_only: e.target.checked,
                    })
                  }
                />
                <span className="text-sm ">Member Only</span>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <button type="submit" className="w-1/2  mt-2 rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 transition">
                  Create Event
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-1/2  mt-2 rounded-lg bg-red-600 py-2 font-semibold text-white hover:bg-red-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
         
        </div>
      )}
      <Footer />
    </>
  );
}

export default Events