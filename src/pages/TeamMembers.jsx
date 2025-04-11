import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const TeamMembers = () => {
  const { teamsId } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeamMembers();
  }, [teamsId]);

  const fetchTeamMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8081/api/team-members/${teamsId}/members`,
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
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-xl mt-10">
    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Team Members</h2>
  
    {loading ? (
      <p className="text-center text-gray-500">Loading members...</p>
    ) : error ? (
      <p className="text-center text-red-500">{error}</p>
    ) : members.length > 0 ? (
      <div className="max-h-80 overflow-y-auto space-y-4 px-2">
        <ul className="space-y-4">
          {members.map((member) => (
            <li
              key={member.userId}
              className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition duration-300"
            >
              {/* Making first letter Capital as logo */}
              <div className="w-12 h-12 bg-blue-500 text-white flex items-center justify-center rounded-full text-lg font-semibold">
                {member.username ? member.username.charAt(0).toUpperCase() : "U"}
              </div>
  
              {/* Member details */}
              <div>
                <p className="text-lg font-medium text-gray-800">
                  {member.username || "Unknown User"}
                </p>
                <p className="text-sm text-gray-600">{member.email}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    ) : (
      <p className="text-center text-gray-500">No members in this team.</p>
    )}
  </div>
  
  );
};

export default TeamMembers;
