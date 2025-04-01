import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

const ExpenseTracker = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user, setTeamsId } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseName, setExpenseName] = useState("");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [team, setTeam] = useState(null);

  useEffect(() => {
    setTeamsId(teamId);
  }, [teamId, setTeamsId]); // Ensure it runs only when teamId changes

  // Fetch team members and expenses when teamId avilable
  useEffect(() => {
    fetchTeamMembers();
    fetchExpenses();
  }, [teamId]);

  /*
    Fetches the list of members in the selected team.
    Updates the members state with the response.
   */
  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/team-members/${teamId}/members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  /*
    Fetches the list of expenses for the current team.
    Updates the `expenses` state with the fetched data.
   */
  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/expense/team/${teamId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  useEffect(() => {
    const fetchTeam = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `http://localhost:8080/api/teams/${teamId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTeam(response.data);
      } catch (err) {
        console.error("Failed to fetch team details.", err);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchTeam();
    }
  }, []);

  /*
    Handles adding a new expense to the team.
    Validates form input, submits the request, and updates the expense list.
   */
  const handleAddExpense = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const involvedMembersEmails = members
        .filter(
          (member) =>
            selectedMembers.includes(member.userId) ||
            (team && member.userId === team.createdBy) // Check if team is not null
        )
        .map((member) => member.email);

      await axios.post(
        "http://localhost:8080/expense/add",
        {
          teamId,
          expenseName,
          amount: parseFloat(amount),
          description,
          paidBy: user.userId,
          involvedMembers: involvedMembersEmails,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setExpenseName("");
      setAmount("");
      setDescription("");
      setSelectedMembers([]);
      fetchExpenses();
    } catch (error) {
      console.error("Error adding expense:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total expense amount
  const totalExpense = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col lg:flex-row gap-6">
      {/* Expenses List */}
      <div className="lg:w-1/2 w-full bg-white shadow-lg rounded-lg p-6 flex flex-col h-full max-h-[calc(100vh-6rem)] pb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Team Expenses</h2>

        {/* Scrollable Expenses List */}
        <div className="overflow-y-auto flex-1 max-h-80 pr-2">
          {expenses.length > 0 ? (
            <ul className="space-y-3">
              {expenses.map((expense) => (
                <li
                  key={expense.expenseId}
                  className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-200 transition"
                  onClick={() => navigate(`/expense/${expense.expenseId}`)}
                >
                  <span className="truncate max-w-[70%]">
                    {expense.expenseName}
                  </span>
                  <span className="font-bold text-blue-600">
                    ₹{expense.amount}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center">No expenses recorded.</p>
          )}
        </div>

        {/* Total Expense (Fixed at the Bottom) */}
        <div className="text-xl font-bold text-blue-600 mt-4 text-center">
          Total Expense: ₹{totalExpense}
        </div>
      </div>

      {/* Add Expense Form */}
      <div className="lg:w-1/2 w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Add Expense</h1>
        <form onSubmit={handleAddExpense} className="space-y-4">
          <input
            type="text"
            placeholder="Expense Name"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          />

          {/* Members Involved - Only show if there are other members */}
          {members.length > 1 && (
            <div>
              <h3 className="font-semibold mb-2">Members Involved:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {members
                  .filter((member) => member.userId !== team.createdBy) // Exclude the creator
                  .map((member) => (
                    <label
                      key={member.userId}
                      className="flex items-center bg-gray-100 p-3 rounded-lg shadow-md cursor-pointer break-words"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.userId)}
                        onChange={() =>
                          setSelectedMembers((prev) =>
                            prev.includes(member.userId)
                              ? prev.filter((id) => id !== member.userId)
                              : [...prev, member.userId]
                          )
                        }
                        className="mr-2"
                      />
                      <span className="truncate">{member.username}</span>
                    </label>
                  ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Expense"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExpenseTracker;
