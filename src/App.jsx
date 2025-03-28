import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import ExpenseSettel from "./pages/ExpenseSettel";
import ExpenseTracker from "./pages/ExpenseTracker";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PublicRoute from "./protection/PublicRoute";
import ProtectedRoutes from "./protection/ProtectedRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TeamMembers from "./pages/TeamMembers";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Protect Dashboard using ProtectedRoutes */}
          <Route path="/" element={<ProtectedRoutes><Dashboard /></ProtectedRoutes>} />
          
          {/* Public Routes for login & signup */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* Protect expense-related routes */}
          <Route path="/expenses/:teamId" element={<ProtectedRoutes><ExpenseTracker/></ProtectedRoutes>}/>
          <Route path="/expense/:expenseId" element={<ProtectedRoutes><ExpenseSettel /></ProtectedRoutes>} />

          <Route path="/team/:teamId/members" element={<ProtectedRoutes><TeamMembers /></ProtectedRoutes>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
