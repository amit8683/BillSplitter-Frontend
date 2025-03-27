import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom"; // ✅ Import useNavigate

const ExpenseTracker = () => {
  const { teamId } = useParams();
  const navigate = useNavigate(); // ✅ Initialize navigation
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseName, setExpenseName] = useState("");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchTeamMembers();
    fetchExpenses();
  }, [teamId]);

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:8080/teamMembers/team/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:8080/expense/team/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const handleExpenseClick = (expenseId) => {
    navigate(`/expense/${expenseId}`); // ✅ Navigate to ExpenseSettel page
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amount || !description || !expenseName || selectedMembers.length === 0) {
      alert("Please enter an expense name, amount, description, and select at least one member.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const involvedMembersEmails = members
        .filter((member) => selectedMembers.includes(member.user_id))
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
        { headers: { Authorization: `Bearer ${token}` } }
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

  const handleMemberSelection = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-100 p-6">
      <div className="w-1/2 p-4">
        <h2 className="text-2xl font-semibold mb-3">Team Expenses</h2>
        {expenses.length > 0 ? (
          <ul className="space-y-2">
            {expenses.map((expense) => (
              <li
                key={expense.expenseId}
                className="bg-white p-3 shadow rounded-lg flex justify-between cursor-pointer hover:bg-gray-200 transition"
                onClick={() => handleExpenseClick(expense.expenseId)} // ✅ Click handler
                
              >
                <span>{expense.expenseName} - {expense.description}</span>
                <span className="font-bold">₹{expense.amount}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No expenses recorded.</p>
        )}
      </div>

      <div className="w-1/2 p-4">
        <h1 className="text-3xl font-bold mb-4">Add Expense</h1>
        <form onSubmit={handleAddExpense} className="bg-white p-4 shadow rounded-lg">
          <input
            type="text"
            placeholder="Expense Name"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="text"
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            required
          />
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Members Involved:</h3>
            {members.map((member) => (
              <label key={member.user_id} className="block">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(member.user_id)}
                  onChange={() => handleMemberSelection(member.user_id)}
                  className="mr-2"
                />
                {member.username} ({member.email})
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
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
