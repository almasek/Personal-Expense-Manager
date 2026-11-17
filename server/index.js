
import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

// List of expenses
let expenses = [
    {
        id: 1,
        name: "Food",
        amount: 2500,
        category: "Food"
    },
    {
        id: 2,
        name: "Transport",
        amount: 800,
        category: "Transport"
    }
];

// Allow requests from React
app.use(cors());

// Allow the server to receive JSON data
app.use(express.json());

// First API endpoint
app.get("/", (req, res) => {
    res.send("My Lab 6 server is working!");
});

// Get all expenses
app.get("/api/expenses", (req, res) => {
    res.status(200).json(expenses);
});

// Add a new expense
app.post("/api/expenses", (req, res) => {
    const { name, amount, category } = req.body;

    if (!name || typeof name !== "string" ||
        typeof amount !== "number" || amount <= 0 ||
        !category || typeof category !== "string") {
        return res.status(400).json({
            message: "Invalid expense data"
        });
    }

    const newExpense = {
        id: Date.now(),
        name,
        amount,
        category
    };

    expenses.push(newExpense);

    res.status(201).json(newExpense);
});

// Delete an expense
app.delete("/api/expenses/:id", (req, res) => {
    const id = Number(req.params.id);

    const expenseExists = expenses.some(
        expense => expense.id === id
    );

    if (!expenseExists) {
        return res.status(404).json({
            message: "Expense not found"
        });
    }

    expenses = expenses.filter(
        expense => expense.id !== id
    );

    res.status(200).json({
        message: "Expense deleted successfully"
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
