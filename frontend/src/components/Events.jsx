import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { render } from 'react-dom';
function Events() {
  const navigate = useNavigate();
  const [EventsData, setEventsData] = useState(null);
  const [myEventsData,setMyEventsData]=useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPhotographerModal, setShowPhotographerModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [photographersList, setPhotographersList] = useState([]);
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
const openAddPhotographerModal = async (eventId) => {
  setSelectedEventId(eventId);
  try {
    const response = await fetch(`http://localhost:8000/api/get_event_photographers/${eventId}/`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    setPhotographersList(data.users || []);
    setShowPhotographerModal(true);
  } catch (error) {
    console.error("Error fetching photographers:", error);
  }
};

const togglePhotographerAccess = async (userId, currentAccess) => {
  const csrfToken = getCSRFToken();
  try {
    await fetch(`http://localhost:8000/api/toggle_photographer_access/${selectedEventId}/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ user_id: userId, grant_access: !currentAccess }),
    });
    setPhotographersList(photographersList.map(user => 
      user.id === userId ? { ...user, has_access: !currentAccess } : user
    ));
  } catch (error) {
    console.error("Error toggling access:", error);
  }
};

const delete_event=async(event_id)=>{
  setError("");
  const csrfToken = getCSRFToken();
  try{
    const response=await fetch(`http://localhost:8000/api/delete_event/${event_id}/`,{
      method:"DELETE",
      credentials:"include",
      headers:{
        "Content-Type":"application/json",
        "X-CSRFToken":csrfToken,
      },
    });
    if(response.ok){
      window.location.reload();
    }
    else{
      setError("Failed to delete event");
    }
  }catch(error){
    console.error("Error deleting event:",error);
    setError("Error deleting event");
  }
};

const displayEventsData = EventsData && EventsData.map((event) => (
  <div
    key={event.id}
   className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-4 max-w-sm w-full flex flex-col justify-between"


  >
    <div>
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-lg font-semibold text-gray-800">
          {event.title}
        </h2>

        {event.has_upload_access && (
          <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
            Upload Access
          </span>
        )}
      </div>

      <p className="text-sm text-gray-500">
        👤 Coordinator: {event.event_head_username}
      </p>
      <p className="text-sm text-gray-500">
        📅 {event.event_date.slice(0, 10)}
      </p>
      <p className="text-sm text-gray-500">
        🔒 {event.member_only ? "Members Only" : "Public"}
      </p>
    </div>

    <button
      onClick={() => view_event_photos(event.slug)}
      className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
    >
      View Event Photos
    </button>
  </div>
));

const displayMyEventsData = myEventsData && myEventsData.map((event) => (
  <div
    key={event.id}
   className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-4 max-w-sm w-full flex flex-col justify-between"


  >
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">
        {event.title}
      </h2>

      <p className="text-sm text-gray-500">
        📅 {event.event_date.slice(0, 10)}
      </p>
      <p className="text-sm text-gray-500">
        🔒 {event.member_only ? "Members Only" : "Public"}
      </p>
    </div>

   <div className="mt-4 space-y-2">

  {/* Primary Action */}
  <button
    onClick={() => view_event_photos(event.slug)}
    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
  >
    View Event Photos
  </button>

  {/* Secondary Actions */}
  <div className="flex gap-2">
    <button
      onClick={() => openAddPhotographerModal(event.id)}
      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg transition"
    >
      Upload Acc
    </button>

    <button
      onClick={() => delete_event(event.id)}
      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
    >
      Delete
    </button>
  </div>

</div>

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
useEffect(() => {

const loadMyEvents=async()=>{
  try{
 const response = await fetch("http://localhost:8000/api/view_my_events/", {
   method: "GET",
   credentials: "include",
   headers: {
     "Content-Type": "application/json",
   },
 });
 const data=await response.json();
 setMyEventsData(data);
 console.log(data)
}catch(error){
  console.error("Error fetching Events data:", error);
}   
};
loadMyEvents();
}, []);

  return (
    <>
    <div className="p-6">

        <div className="w-full max-w-6xl flex justify-between items-center mb-6">
  <div>
    <h1 className="text-3xl font-bold text-gray-800">Events</h1>
    <p className="text-gray-500 text-sm">
      View, manage and upload event photos
    </p>
  </div>

  <button
    onClick={createNewEvent}
    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow transition"
  >
    + Create Event
  </button>
</div>
        <div>
          {error && <p className="text-red-500 p-2 mt-0">{error}</p>}
         <div className="w-full max-w-6xl space-y-10">
  <section>
    <h2 className="text-xl font-semibold text-gray-800 mb-4">
      My Coordinated Events
    </h2>

    {myEventsData?.length ? (
     <div
  className="grid gap-4"
  style={{
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  }}
>


        {displayMyEventsData}
      </div>
    ) : (
      <p className="text-gray-400">You haven’t created any events yet.</p>
    )}
  </section>
  <section>
    <h2 className="text-xl font-semibold text-gray-800 mb-4">
      All Events
    </h2>

    {EventsData?.length ? (
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {displayEventsData}
      </div>
    ) : (
      <p className="text-gray-400">No events available.</p>
    )}
  </section>

</div>
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
      {showPhotographerModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-2/3 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Manage Upload Access</h2>
            <div className="flex flex-col gap-2">
              {photographersList.map((user) => (
                <div key={user.id} className="flex justify-between items-center p-2 border rounded">
                  <span>{user.username}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={user.has_access}
                      onChange={() => togglePhotographerAccess(user.id, user.has_access)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowPhotographerModal(false)}
              className="w-full mt-4 rounded-lg bg-red-600 py-2 font-semibold text-white hover:bg-red-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Events