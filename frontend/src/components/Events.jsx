import Header from './subcomponent/Header.jsx'
import Footer from './subcomponent/Footer.jsx'
import React, { useEffect, useState } from "react";

function Events() {
  const [EventsData, setEventsData] = useState(null);
  const displayEventsData=EventsData && EventsData.map((event)=>(
    <div key={event.id} className="border p-4 mb-4 w-full">
      <h2 className="text-xl font-bold mb-2">{event.title}</h2>
      <p>Coordinator : {event.event_head_username}</p>
      <p>Cc : {event.event_cc_username}</p>
      <p>Date : {event.created_at.slice(0, 10)}</p>
      <p>Event Type : {event.member_only ? "Members Only" : "Public"}</p>
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
        <button className="bg-red-400 p-4 mt-2 mb-2">Create New Event</button>
        <div>
          {EventsData ? <>{displayEventsData}</> : <p></p>}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Events