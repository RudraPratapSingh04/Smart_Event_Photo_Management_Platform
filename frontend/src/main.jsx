import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Navigate } from "react-router-dom";
import Welcome from "./components/Welcome.jsx";
import Register from "./components/Register.jsx";
import Dashboard from "./components/Dashboard.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
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
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="events" element={<Events />} />
        <Route path="favourite" element={<Favourite />} />
        <Route path="tagged_images" element={<TaggedImages />} />
        <Route path="photographer_corner" element={<PhotographerCorner />} />
      </Route>
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
            <Navigate to="/dashboard/events" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/favourite"
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard/favourite" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tagged_images"
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard/tagged_images" replace />
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
            <Navigate to="/dashboard/photographer_corner" replace />
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
