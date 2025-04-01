import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
const Dashboard = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [creators, setCreators] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchTeams();
  }, []);

  // Fetch teams created by the logged-in user
  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/teams/user/${user.userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTeams(response.data);

      // Extract creator IDs
      const creatorIds = [
        ...new Set(response.data.map((team) => team.createdBy)),
      ];

      // Fetch creator names
      if (creatorIds.length > 0) {
        fetchCreators(creatorIds);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  // Fetch usernames of team creators
  const fetchCreators = async (creatorIds) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8080/api/teams/creators`, // Endpoint for getting usernames
        creatorIds,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Convert array to object { userId: username }
      const creatorMap = {};
      response.data.forEach((user) => {
        creatorMap[user.userId] = user.username;
      });
      setCreators(creatorMap);
    } catch (error) {
      console.error("Error fetching creator names:", error);
    }
  };

  // Handle opening the create team popup
  const handleCreateTeam = () => {
    const token = localStorage.getItem("token");
    if (token) {
      setShowPopup(true);
    } else {
      navigate("/login");
    }
  };

  // Add a new member input field
  const handleAddMember = () => {
    setMembers([...members, { name: "", email: "" }]);
  };

  // Remove a member input field`
  const handleRemoveMember = (index) => {
    setMembers(members.filter((_, removingIndex) => removingIndex !== index));
  };

  // Handle input change for team members
  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  };

  // Handle team creation form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:8080/api/teams/create",
        {
          teamName,
          createdBy: user.userId,
          memberEmails: members.map((member) => member.email),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Team created successfully!");
      setShowPopup(false);
      setTeamName("");
      setMembers([{ name: "", email: "" }]);
      fetchTeams();
    } catch (error) {
      console.error("Error creating team:", error);
      alert("Failed to create team.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gray-100 p-6">
      {/* Left Section - Main Content */}
      <div className="w-full lg:w-2/3 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Bill Splitter</h1>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl">
          Bill Splitter is a simple and efficient way to manage shared expenses
          with friends, family, or colleagues. Easily create teams, add members,
          and track expenses to ensure fair and transparent cost sharing.
        </p>
        <button
          onClick={handleCreateTeam}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow"
        >
          Create Team
        </button>

        {/* Pop Up Form  */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4">Create a Team</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Enter team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full p-2 border rounded mb-4"
                  required
                />

                <label className="block text-gray-700 font-semibold mb-2">
                  Add Members:
                </label>

                {/* Show member inputs only if at least one member is added */}
                {members.length > 0 &&
                  members.map((member, index) => (
                    <div key={index} className="flex items-center gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Member Name"
                        value={member.name}
                        onChange={(e) =>
                          handleMemberChange(index, "name", e.target.value)
                        }
                        className="p-2 border rounded w-1/2"
                      />
                      <input
                        type="email"
                        placeholder="Member Email"
                        value={member.email}
                        onChange={(e) =>
                          handleMemberChange(index, "email", e.target.value)
                        }
                        className="p-2 border rounded w-1/2"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                      >
                        X
                      </button>
                    </div>
                  ))}

                {/* Show "Add Member" button even if no members are added */}
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mb-4"
                >
                  Add Member
                </button>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowPopup(false)}
                    className="mr-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      {/* Right Section - List of Teams */}
      <div className="w-full lg:w-1/3 p-6">
        <h2 className="text-2xl font-bold mb-4">Your Teams</h2>

        {teams.length > 0 ? (
          <div className="max-h-80 overflow-y-auto border border-gray-300 rounded-lg p-2">
            <ul className="space-y-4">
              {teams.map((team) => (
                <li
                  key={team.teamId}
                  className="bg-white p-4 rounded shadow hover:bg-gray-200 transition"
                >
                  <Link to={`/expenses/${team.teamId}`}>
                    <h3 className="text-lg font-semibold">{team.teamName}</h3>
                    <p className="text-gray-600">
                      Created by:{" "}
                      {team.createdBy === user.userId
                        ? "You"
                        : creators[team.createdBy] || "Loading..."}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500">You haven't joined any teams yet.</p>
        )}
      </div>
      ;
    </div>
  );
};

export default Dashboard;
