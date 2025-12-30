import React from 'react'
import { Link } from 'react-router-dom';

function Header() {
  const logout=async()=>{
    try{
      console.log("logout rewuested");
      const response=await fetch("http://localhost:8000/api/logout_session/",{
        method:"POST",
        credentials:"include",
      });
    }catch(err){
      console.error("Logout failed:",err);
    }
  }
  return (
    <>
      <header>
        <div className="bg-indigo-600 w-full h-auto p-4 flex items-center justify-between">
          {/* <img src="" alt="" /> */}
          <Link to="/dashboard" className="text-white text-5xl font-bold ml-10">
            PhotoGo
          </Link>
          <div>
            <button className="text-white text-xl bg-red-400 p-2 rounded-xl gap-2">View Profile</button>
            <button onClick={logout} className="text-white text-xl bg-red-400 p-2 rounded-xl gap-2 ml-4">
              Logout
            </button>
            
          </div>
        </div>
      </header>
    </>
  );
}

export default Header