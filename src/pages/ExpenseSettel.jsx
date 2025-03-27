import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:8080/api";

const ExpenseSettle = () => {
  const { expenseId } = useParams();
  const { user } = useAuth();
  const [expense, setExpense] = useState([]);
  const [singleExpense, setSingleExpense] = useState(null);
  const [creators, setCreators] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenseDetails();
    fetchSingleExpenseDetails();
  }, [expenseId]);

  const fetchSingleExpenseDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8080/expense/${expenseId}`);
      const data = await response.json();
      if (data) {
        setSingleExpense(data);
      } else {
        setSingleExpense(null);
      }
    } catch (error) {
      console.error("Error fetching expense:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenseDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/expense-splits/${expenseId}`);
      const data = await response.json();
      setExpense(data.length > 0 ? data : []);

      // Extract unique userIds from expense splits
      const userIds = [...new Set(data.map((split) => split.userId))];

      // Fetch usernames
      fetchCreators(userIds);
    } catch (error) {
      console.error("Error fetching expense details:", error);
    }
  };

  const fetchCreators = async (creatorIds) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8080/teams/creators`, // API to get usernames
        creatorIds,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Convert response to { userId: username }
      const creatorMap = {};
      response.data.forEach((user) => {
        creatorMap[user.userId] = user.username;
      });
      setCreators(creatorMap);
    } catch (error) {
      console.error("Error fetching creator names:", error);
    }
  };

  const handleRequestToMarkPaid = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/expense-splits/${userId}/status?status=Request`, {
        method: "PUT",
      });

      if (response.ok) {
        setExpense((prev) =>
          prev.map((split) =>
            split.userId === userId ? { ...split, status: "Request" } : split
          )
        );
      } else {
        console.error("Failed to request payment status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleVerifyAndSettle = async () => {
    if (user.userId !== singleExpense?.paidBy) {
      alert("Only the person who paid can settle the expense.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}/settle`, {
        method: "PUT",
      });

      if (response.ok) {
        setSingleExpense((prev) => ({ ...prev, status: "Settled" }));
      } else {
        alert("Failed to settle the expense.");
      }
    } catch (error) {
      console.error("Error settling expense:", error);
    }
  };

  if (loading) return <p>Loading expense details...</p>;
  if (!singleExpense) return <p>No expense found.</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 shadow-lg rounded-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Expense Details</h2>
        <p className="text-gray-600">Expense Name: {singleExpense.expenseName}</p>
        <p className="text-gray-600">Description: {singleExpense.description}</p>
        <p className="text-gray-600">Amount: ${singleExpense.amount}</p>
        <p className="text-gray-600">
          Paid By: {user.userId === singleExpense.paidBy ? "You" : creators[singleExpense.paidBy] || `User ID: ${singleExpense.paidBy}`}
        </p>

        <h3 className="text-lg font-bold mt-4">Members Involved:</h3>
        <ul>
          {expense.length > 0 ? (
            expense.map((split) => (
              <li key={split.splitId} className="flex justify-between items-center py-2 border-b">
                <span>{user.userId === split.userId ? "You" : creators[split.userId] || `User ID: ${split.userId}`}</span>
                <span>Amount: ${split.amount}</span>
                <button
                  className="ml-4 bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => handleRequestToMarkPaid(split.userId)}
                >
                  Request to Mark as Paid
                </button>
              </li>
            ))
          ) : (
            <p>No members found.</p>
          )}
        </ul>

        {user.userId === singleExpense.paidBy && singleExpense.status !== "Settled" && (
          <button className="mt-4 w-full bg-green-500 text-white py-2 rounded" onClick={handleVerifyAndSettle}>
            Verify & Settle
          </button>
        )}
      </div>
    </div>
  );
};

export default ExpenseSettle;
