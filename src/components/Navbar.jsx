import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import AuthContext

const Navbar = () => {
  const { user, logout } = useAuth(); // Get user data from context
  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">Bill Splitter</h1>
        <div className="space-x-6 flex items-center">
          {user ? (
            <>
              <span className="text-white font-semibold">Welcome, {user.username}</span>
              <button onClick={logout} className="text-white hover:underline">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="text-white hover:underline">
              Login
            </Link>
          )}
          
        </div>
      </div>
    </nav> 
  );
};

export default Navbar;
