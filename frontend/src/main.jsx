import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Welcome from "./components/Welcome.jsx";
import Register from "./components/Register.jsx";
import Dashboard from "./components/Dashboard.jsx"
// import ProtectedRoute from "./components/ProtectedRoute.jsx";
import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Welcome />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </>
  )
);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
