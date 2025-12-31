import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "./subcomponent/Header";
function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/check_auth/",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            navigate("/", { replace: true });
            return;
          }
          throw new Error(`Auth check failed: ${response.status}`);
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err.message);
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg">Loading Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-red-500 text-center">
          Error: {error}. Redirecting...
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-4">
            Welcome to Dashboard, {user?.username}!
          </h1>
          <p className="text-gray-600 mb-4">Email: {user?.email}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/events")}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Load Events
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;