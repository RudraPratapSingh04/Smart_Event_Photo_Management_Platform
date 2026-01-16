import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./subcomponent/Header.jsx";
import Footer from "./subcomponent/Footer.jsx";

function PhotographerCorner() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch(
          "http://localhost:8000/api/check_photographer/",
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!res.ok) {
          setAllowed(false);
        } else {
          const data = await res.json();
          setAllowed(Boolean(data.is_photographer));
        }
      } catch (e) {
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };
    checkRole();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!allowed) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-4">Photographer's Corner</h1>
          <p className="text-gray-600">
            Exclusive tools and actions for photographers.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default PhotographerCorner;
