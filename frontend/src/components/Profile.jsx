// import React from 'react'
import Header from './subcomponent/Header.jsx'
import Footer from './subcomponent/Footer.jsx'
import React, { useEffect, useState } from "react";

function Profile() {
  const [profileData, setProfileData] = useState(null);
useEffect(() => {
const loadProfile=async()=>{
  try{
 const response = await fetch("http://localhost:8000/api/view_profile/", {
   method: "GET",
   credentials: "include",
   headers: {
     "Content-Type": "application/json",
   },
 });
 const data=await response.json();
 setProfileData(data);
 console.log(data)
}catch(error){
  console.error("Error fetching profile data:", error);
}   
};
loadProfile();
}, []);
  return (
    <>
      <Header />
      <div>Profile Content</div>
      <div>
        {profileData ? (
          <>
            <p>Username : {profileData.username}</p>
            <p>Email : {profileData.email} </p>
            <p>Department : {profileData.department}</p>
            <p>Batch : {profileData.batch}</p>
            <p>Bio:{profileData.bio}</p>
            <p>No. of Downloads : {profileData.no_of_downloads}</p>
            <p>Joined At : {profileData.joined_at.slice(0, 10)}</p>
          </>
        ) : (
          <p></p>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Profile