import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./subcomponent/Header.jsx";
import Sidebar from "./subcomponent/Sidebar.jsx";
import Footer from "./subcomponent/Footer.jsx";

function DashboardLayout() {

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100">
        <div className="w-full h-full bg-white flex">
          <Sidebar />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default DashboardLayout;
