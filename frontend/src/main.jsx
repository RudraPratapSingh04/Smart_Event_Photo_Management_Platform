import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Navigate } from "react-router-dom";
import Welcome from "./components/Welcome.jsx";
import Register from "./components/Register.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Profile from "./components/Profile.jsx";
import Events from "./components/Events.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Event_Photos from "./components/Event_Photos.jsx";
import Favourite from "./components/Favourite.jsx";
import TaggedImages from "./components/TaggedImages.jsx";
import PhotographerCorner from "./components/PhotographerCorner.jsx";
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
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        }
      />
      <Route
        path="/favourite"
        element={
          <ProtectedRoute>
            <Favourite />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tagged_images"
        element={
          <ProtectedRoute>
            <TaggedImages />
          </ProtectedRoute>
        }
      />
      <Route
        path="event_photos/:event_slug"
        element={
          <ProtectedRoute>
            <Event_Photos />
          </ProtectedRoute>
        }
      ></Route>
      <Route
        path="/photographer_corner"
        element={
          <ProtectedRoute>
            <PhotographerCorner />
          </ProtectedRoute>
        }
      />
    </>
  )
);
export default router;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
