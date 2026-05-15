import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home.jsx";
import VenueDetails from "../pages/VenueDetails.jsx";
import Register from "../pages/Register.jsx";
import Login from "../pages/Login.jsx";
import Profile from "../pages/Profile.jsx";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/venue/:id" element={<VenueDetails />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile/:name" element={<Profile />} />
    </Routes>
  );
}
