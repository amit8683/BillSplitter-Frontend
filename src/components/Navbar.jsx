import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMenu, FiX } from "react-icons/fi"; // Import menu icons
import { useParams } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { teamId } = useParams();

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  // Hide login/signup buttons on the login & register pages
  const hideAuthButtons =
    location.pathname === "/login" || location.pathname === "/register";

  const shouldShowLink = ["/expenses/", "/expense/", "/team/"].some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-white text-2xl font-bold">
          Bill Splitter
        </Link>

        {/*  menu for mobile */}
        <button
          className="text-white text-2xl md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Desktop & Mobile Menu */}
        <div
          className={`absolute md:relative top-16 md:top-0 left-0 w-full md:w-auto bg-blue-600 md:bg-transparent shadow-md md:shadow-none md:flex md:items-center md:space-x-6 ${
            menuOpen ? "block" : "hidden"
          } md:block`}
        >
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 p-4 md:p-0">
            {/* Show Team Members button only on ExpenseTracker page */}
            {shouldShowLink && (
              <Link
                to={`/team/members`}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-200"
                onClick={() => setMenuOpen(false)}
              >
                Team Members
              </Link>
            )}
            {user ? (
              <>
                <span className="text-white font-semibold">
                  Welcome, {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-white hover:underline"
                >
                  Logout
                </button>
              </>
            ) : (
              !hideAuthButtons && (
                <Link
                  to="/login"
                  className="text-white hover:underline"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
