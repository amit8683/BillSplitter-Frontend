import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import ExpenseSettel from "./pages/ExpenseSettel";
import ExpenseTracker from "./pages/ExpenseTracker";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/expenses/:teamId" element={<ExpenseTracker/>}/>
          <Route path="/expense/:expenseId" element={<ExpenseSettel />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
