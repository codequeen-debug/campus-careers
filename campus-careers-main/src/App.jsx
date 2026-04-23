import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SeekerDashboard from "./pages/seeker/SeekerDashboard";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import BrowseJobs from "./pages/BrowseJobs";
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/seeker" element={<SeekerDashboard />} />
            <Route path="/recruiter" element={<RecruiterDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/jobs" element={<BrowseJobs />} />   {/* ← add this */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;