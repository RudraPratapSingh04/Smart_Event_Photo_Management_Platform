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
  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-600">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Photo Management App 📸
        </h1>

        {checkingSession && (
          <p className="text-center text-gray-500 mb-4">Checking session...</p>
        )}

        <form className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />

          <button
            onClick={verifyLogin}
            className="mt-2 rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 transition"
          >
            Login
          </button>
        </form>
        {error && (
          <p
            className="text-red-500 text-center mt-4
        "
          >
            {error}
          </p>
        )}
        <p className="mt-6 text-center text-sm text-gray-600">
          New to the app?{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:underline"
          >
            Register here
          </Link>
        </p>
        <p className="mt-6 text-center text-sm text-gray-600">
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:underline"
          >
            AUTH LOGIN
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Welcome;
