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
import PendingApproval from "./pages/PendingApproval";
import BrowseJobs from "./pages/BrowseJobs";
import JobDetail from "./pages/JobDetail";
import ProtectedRoute from "./routes/ProtectedRoute";
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
            <Route path="/seeker" element={
              <ProtectedRoute allowedRoles={["seeker"]}>
                <SeekerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/recruiter" element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <RecruiterDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/pending" element={
              <ProtectedRoute allowedRoles={["recruiter"]} allowedStatuses={["Pending"]}>
                <PendingApproval />
              </ProtectedRoute>
            } />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <BrowseJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/:id"
              element={
                <ProtectedRoute>
                  <JobDetail />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;