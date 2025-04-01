import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState(""); 
  const navigate = useNavigate();

    //  Handle input changes and update state
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //  Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Signup failed: ${response.status}`);
      }

      navigate("/login"); 
    } catch (error) {
      console.error("Signup Error:", error);
      setError("Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 sm:p-12">
        <h1 className="text-2xl xl:text-3xl font-extrabold text-center">
          Sign up
        </h1>

        {/*  Login Form */}
        <form className="mt-6" onSubmit={handleSubmit}>
          {error && (
            <p className="text-red-500 text-center text-sm">{error}</p>
          )}

          <input
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 mt-4"
            type="text"
            name="username"
            placeholder="Full Name"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <input
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 mt-4"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 mt-4"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button
            className="mt-6 w-full bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-300"
            type="submit"
          >
            Sign Up
          </button>
        </form>

        {/*  Login Link */}
        <p className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <button
            className="text-indigo-500 hover:underline"
            onClick={() => navigate("/login")}
          >
            Log in here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
