
import { useState, useEffect } from "react";
import "./App.css";

function App() {
    const [expenses, setExpenses] = useState([]);
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Food");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [aiAnalysis, setAiAnalysis] = useState("");
const [aiLoading, setAiLoading] = useState(false);
const [aiError, setAiError] = useState("");

    const [currency, setCurrency] = useState(null);
const [currencyLoading, setCurrencyLoading] = useState(true);
const [currencyError, setCurrencyError] = useState("");

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
    // Get currency rate from external API
const loadCurrency = async () => {
    try {
        setCurrencyLoading(true);

        const response = await fetch(
            "http://localhost:5000/api/currency"
        );

        if (!response.ok) {
            throw new Error("Failed to load currency");
        }

        const data = await response.json();

        setCurrency(data);
        setCurrencyError("");
    } catch (err) {
        setCurrencyError("Could not load exchange rate");
    } finally {
        setCurrencyLoading(false);
    }
};

    useEffect(() => {
        loadExpenses();
        loadCurrency();
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

  
    // AI Expense Analysis
    const analyzeExpenses = async () => {
        try {
            setAiLoading(true);
            setAiError("");
            setAiAnalysis("");

            const response = await fetch(
                "http://localhost:5000/api/expenses/analyze",
                {
                    method: "POST"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "AI analysis failed");
            }

            setAiAnalysis(data.analysis);
        } catch (error) {
            setAiError(
                "Could not get AI analysis. Make sure the backend and Ollama are running."
            );
        } finally {
            setAiLoading(false);
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
            <div className="currency-card">
    <h2>Currency Exchange Rate</h2>

            {currencyLoading ? (
                <p>Loading exchange rate...</p>
            ) : currencyError ? (
                <p className="error">{currencyError}</p>
            ) : currency ? (
                <>
                    <h3>
                        1 USD = {currency.rate.toFixed(2)} KZT
                    </h3>
                    <p>Source: {currency.source}</p>
                    <p>Updated: {currency.lastUpdated}</p>
                </>
            ) : null}
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

                <div className="ai-card">
                <h2>AI Expense Analysis</h2>

                <p>
                    Get smart advice based on your expenses.
                </p>

                <button
                    type="button"
                    onClick={analyzeExpenses}
                    disabled={aiLoading}
                >
                    {aiLoading ? "Analyzing..." : "Analyze my expenses"}
                </button>

                {aiError && (
                    <p className="error">{aiError}</p>
                )}

                {aiAnalysis && (
                    <div className="ai-result">
                        <h3>AI Recommendations</h3>
                        <p>{aiAnalysis}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
