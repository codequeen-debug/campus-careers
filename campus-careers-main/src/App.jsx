import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Navbar from "./components/Navbar"; // If you have one
import Login from "./pages/Login";
import Register from "./pages/Register";
import SeekerDashboard from "./pages/seeker/SeekerDashboard";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import './App.css';

// ... existing imports

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar /> 
          
          <Routes>
            {/* CHANGE THIS LINE: Set the home page to Home instead of Login */}
            <Route path="/" element={<Home />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/seeker" element={<SeekerDashboard />} />
            <Route path="/recruiter" element={<RecruiterDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;