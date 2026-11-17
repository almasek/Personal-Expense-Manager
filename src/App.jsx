
import { useState, useEffect } from "react";
import "./App.css";

function App() {
    const [expenses, setExpenses] = useState([]);
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Food");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Get expenses from backend
    const loadExpenses = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:5000/api/expenses"
            );

            if (!response.ok) {
                throw new Error("Failed to load expenses");
            }

            const data = await response.json();
            setExpenses(data);
            setError("");
        } catch (err) {
            setError("Cannot connect to server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExpenses();
    }, []);

    // Add new expense
    const addExpense = async (e) => {
        e.preventDefault();

        if (!name.trim() || !amount || Number(amount) <= 0) {
            setError("Please enter valid expense data");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/expenses",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        amount: Number(amount),
                        category: category
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Could not add expense");
            }

            setName("");
            setAmount("");
            setError("");

            loadExpenses();
        } catch (err) {
            setError("Error adding expense");
        }
    };

    // Delete expense
    const deleteExpense = async (id) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/expenses/${id}`,
                {
                    method: "DELETE"
                }
            );

            if (!response.ok) {
                throw new Error("Could not delete expense");
            }

            loadExpenses();
        } catch (err) {
            setError("Error deleting expense");
        }
    };

    const total = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );

    return (
        <div className="container">
            <h1>Personal Expense Manager</h1>
            <p className="subtitle">
                Manage your daily expenses
            </p>

            <div className="total-card">
                <p>Total expenses</p>
                <h2>{total.toLocaleString()} KZT</h2>
            </div>

            <form onSubmit={addExpense} className="expense-form">
                <h2>Add new expense</h2>

                <input
                    type="text"
                    placeholder="Expense name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Amount in KZT"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                </select>

                <button type="submit">Add expense</button>
            </form>

            {error && <p className="error">{error}</p>}

            <div className="expense-list">
                <h2>My expenses</h2>

                {loading ? (
                    <p>Loading expenses...</p>
                ) : expenses.length === 0 ? (
                    <p>No expenses yet</p>
                ) : (
                    expenses.map((expense) => (
                        <div className="expense-item" key={expense.id}>
                            <div>
                                <strong>{expense.name}</strong>
                                <p>{expense.category}</p>
                            </div>

                            <div className="expense-actions">
                                <strong>
                                    {expense.amount.toLocaleString()} KZT
                                </strong>

                                <button
                                    type="button"
                                    className="delete-button"
                                    onClick={() => deleteExpense(expense.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default App;
