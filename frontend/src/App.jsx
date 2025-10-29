import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TripDetails from "./pages/TripDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Feed from "./pages/Feed";




function App() {
  return (
    <Routes>
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        }
      />


      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/trips/:id"
        element={
          <ProtectedRoute>
            <TripDetails />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<p>404 Not Found</p>} />
    </Routes>
  );
}

export default App;
