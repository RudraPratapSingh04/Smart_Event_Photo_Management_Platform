import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/check_auth/", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

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
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
      <h1 className="text-3xl font-bold mb-2">Welcome, {user?.username}!</h1>
      <p className="text-gray-600 mb-4">{user?.email}</p>
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-gray-700">Use the tabs on the left to navigate through Events, Favourites, Tagged Images and Photographer's Corner.</p>
      </div>
    </div>
  );
}

export default Dashboard;
