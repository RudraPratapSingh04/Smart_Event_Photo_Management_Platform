import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Navigate } from "react-router-dom";
import Welcome from "./components/Welcome.jsx";
import Register from "./components/Register.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Profile from "./components/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";

// function ProtectedRoute({ children }) {
//   const [loading, setLoading] = useState(true);
//   const [auth, setAuth] = useState(false);

//  useEffect(() => {
//     fetch("http://127.0.0.1:8000/api/dashboard/", {
//       credentials: "include",
//     }).then((res) => {
//       if (res.ok) setAuth(true);
//       else setAuth(false);
//       setLoading(false);
//     });
//   }, []);

//   if (loading) return <div>Loading...</div>;
//   return auth ? children : <Navigate to="/dashboard" />;
// }

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
    </>
  )
);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
