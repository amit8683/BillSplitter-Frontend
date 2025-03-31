import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const ExpenseSettle = () => {
  const { expenseId } = useParams();
  const { user } = useAuth();
  const [expense, setExpense] = useState([]);
  const [singleExpense, setSingleExpense] = useState(null);
  const [creators, setCreators] = useState({});
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState(null);

  // Fetch expense details when component mounts or expenseId changes
  useEffect(() => {
    fetchExpenseDetails();
    fetchSingleExpenseDetails();
  }, [expenseId]);

  // Fetch details of a single expense
  const fetchSingleExpenseDetails = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:8080/expense/${expenseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data;
      if (data) {
        setSingleExpense(data);
        setTeamId(data.teamId);
      } else {
        setSingleExpense(null);
      }
    } catch (error) {
      console.error("Error fetching expense:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch details of expense splits and involved members
  const fetchExpenseDetails = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:8080/api/expense-splits/${expenseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data;
      console.log("Settel Status"+JSON.stringify(data))
      setExpense(data.length > 0 ? data : []);

      // Extract unique userIds from expense splits
      const userIds = [...new Set(data.map((split) => split.userId))];

      // Fetch usernames
      fetchCreators(userIds);
    } catch (error) {
      console.error("Error fetching expense details:", error);
    }
  };

  // Fetch usernames for given user IDs
  const fetchCreators = async (creatorIds) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8080/api/teams/creators`,
        creatorIds,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Convert response to { userId: username }
      const creatorMap = response.data.reduce((acc, user) => {
        acc[user.userId] = user.username;
        return acc;
      }, {});
      setCreators(creatorMap);
    } catch (error) {
      console.error("Error fetching creator names:", error);
    }
  };

  // Handle request to mark a split as "Requested"
  const handleRequestToMarkRequest = async (splitId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:8080/api/expense-splits/request-payment/${splitId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchExpenseDetails();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Handle request to mark a split as "Settled"
  const handleRequestToMarkSettled = async (splitId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:8080/api/expense-splits/verify-payment/${splitId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchExpenseDetails();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) return <p>Loading expense details...</p>;
  if (!singleExpense) return <p>No expense found.</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 shadow-lg rounded-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Expense Details</h2>
        <p className="text-gray-600">
          Expense Name: {singleExpense.expenseName}
        </p>
        <p className="text-gray-600">
          Description: {singleExpense.description}
        </p>
        <p className="text-gray-600">Amount: ${singleExpense.amount}</p>
        <p className="text-gray-600">
          Paid By:{" "}
          {user.userId === singleExpense.paidBy
            ? "You"
            : creators[singleExpense.paidBy] ||
              `User ID: ${singleExpense.paidBy}`}
        </p>

        {Object.keys(creators).length  > 1 && (
          <>
            <h3 className="text-lg font-bold mt-4">Members Involved:</h3>
            <ul>
              {expense.length > 0 ? (
                expense
                  .filter((split) => split.userId !== singleExpense.paidBy)
                  .map((split) => (
                    <li
                      key={split.splitId}
                      className="flex justify-between items-center py-2 border-b"
                    >
                      <span>
                        {user.userId === split.userId
                          ? "You"
                          : creators[split.userId] ||
                            `User ID: ${split.userId}`}
                      </span>
                      <span>Amount: ${split.amount}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleRequestToMarkRequest(split.splitId)
                          }
                          className={`text-white px-3 py-1 rounded ${
                            split.status === "Pending"
                              ? "bg-yellow-500"
                              : split.status === "Requested"
                              ? "bg-blue-500"
                              : "bg-green-500"
                          } ${
                            split.userId !== user.userId
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
                          disabled={split.userId !== user.userId}
                        >
                          {split.status}
                        </button>
                        {user.userId === singleExpense.paidBy &&
                          split.status !== "Settled" && (
                            <button
                              onClick={() =>
                                handleRequestToMarkSettled(split.splitId)
                              }
                              className={`px-3 py-1 rounded ${
                                split.status === "Settled"
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-green-500"
                              } text-white`}
                            >
                              Verify
                            </button>
                          )}
                      </div>
                    </li>
                  ))
              ) : (
                <p>No members found.</p>
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default ExpenseSettle;
