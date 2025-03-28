import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
const TeamMembers = () => {
  const { teamsId } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Parse the stored user data
  const user = JSON.parse(localStorage.getItem("user")) || {}; // Ensure user is an object

  useEffect(() => {
    fetchTeamMembers();
  }, [teamsId]);

  const fetchTeamMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/teamMembers/team/${teamsId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching team members:", error);
      setError("Failed to fetch team members. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">Team Members</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading members...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : members.length > 0 ? (
        <ul className="divide-y divide-gray-300">
          {members.map((member) => (
            <li key={member.userId} className="py-4 flex justify-between items-center">
              <div>
                <span className="text-lg font-medium">{member.username}</span>
                <span className="text-sm text-gray-600 ml-2">{member.email}</span>
              </div>

              {/* Leave button - only enabled for the logged-in user */}
              <button
                
                disabled={member.userId !== user.userId} // Disable for other users
                className={`px-3 py-1 rounded-lg transition duration-300 ${
                  member.userId === user.userId
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Leave
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">No members in this team.</p>
      )}
    </div>
  );
};

export default TeamMembers;
