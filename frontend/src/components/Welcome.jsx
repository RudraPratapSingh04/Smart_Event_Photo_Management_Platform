import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
// import { useNavigate } from 'react-router-dom';

function Welcome() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkExistingSession = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/check_auth/", {
          method: "GET",
          credentials: "include",
        });

        if (!cancelled && res.ok) {
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("Session check failed:", err);
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    };

    checkExistingSession();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const verifyLogin = async (e) => {
    console.log("Verifying login");
    e.preventDefault();
    if (!username || !password) {
      setError("Username or Password missing");

      return;
    }
    try {
      const response = await fetch("http://localhost:8000/api/verify-login/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", username);

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
    console.log("Login successful");
  };
  const handleOAuthLogin = async () => {
    try {
      const response = await fetch("http://localhost:8000/omniport/login/", {
        method: "GET",
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authorization_url;
      } else {
        setError("OAuth login is not configured");
      }
    } catch (err) {
      setError("Failed to initiate OAuth login");
      console.error("OAuth error:", err);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-indigo-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {checkingSession && (
          <div className="flex items-center justify-center gap-2 mb-6 text-indigo-600">
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm">Checking session...</p>
          </div>
        )}

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={verifyLogin}
            className="w-full py-3 rounded-lg bg-indigo-600 font-semibold text-white hover:bg-indigo-700 transition"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">Or</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleOAuthLogin}
          className="mt-6 w-full py-3 rounded-lg border-2 border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Login with Omniport
        </button>

        <p className="mt-6 text-center text-gray-600">
          New here?{" "}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Welcome;
