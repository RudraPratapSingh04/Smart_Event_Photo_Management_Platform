import React from 'react'
import Header from './subcomponent/Header.jsx'
import Footer from './subcomponent/Footer.jsx'
function Profile() {
const loadProfile=async()=>{
  try{
 const response = await fetch("http://127.0.0.1:8000/api/profile/", {
   method: "GET",
   credentials: "include",
   headers: {
     "Content-Type": "application/json",
   },
 });
 const data=await response.json();
 console.log(data)
}catch(error){
  console.error("Error fetching profile data:", error);
}   
}
  return (
   <>
   <Header />
   <div onLoad={loadProfile()}>Profile Content</div>
   <Footer />
   </>
  )
}

export default Profile