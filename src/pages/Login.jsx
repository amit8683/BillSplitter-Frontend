import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth(); 
  const navigate = useNavigate(); 
  
  // State to handle form inputs
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Handle input field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8081/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      
      if (data.token) {
        localStorage.setItem("token", data.token);
        login({
          token: data.token,
          email: data.email,
          userId: data.userId,
          username: data.username,
        });
        navigate("/"); 
      }
    } catch (error) {
      console.error("Login Error:", error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center items-center">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-extrabold text-center">Login</h1>
        <form className="mt-6" onSubmit={handleSubmit}>
          {/* Email Input */}
          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 mt-4"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {/* Password Input */}
          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 mt-4"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-300 ease-in-out mt-5"
          >
            Login
          </button>
        </form>

        {/* Sign-up Link */}
        <p className="text-center text-sm mt-4">
          Don't have an account? {" "}
          <button
            className="text-indigo-500 hover:underline"
            onClick={() => navigate("/register")}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
