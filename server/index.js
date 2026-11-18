
import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

// Expenses data
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

app.use(cors());
app.use(express.json());

// Test server
app.get("/", (req, res) => {
    res.send("My Lab 6 server is working!");
});

// GET: Get all expenses
app.get("/api/expenses", (req, res) => {
    res.status(200).json(expenses);
});

// POST: Add expense
app.post("/api/expenses", (req, res) => {
    const { name, amount, category } = req.body;

    if (
        !name ||
        typeof name !== "string" ||
        typeof amount !== "number" ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !category ||
        typeof category !== "string"
    ) {
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

// DELETE: Delete expense
app.delete("/api/expenses/:id", (req, res) => {
    const id = Number(req.params.id);

    const exists = expenses.some(
        expense => expense.id === id
    );

    if (!exists) {
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

// PATCH: Update expense
app.patch("/api/expenses/:id", (req, res) => {
    const id = Number(req.params.id);
    const expense = expenses.find(item => item.id === id);

    if (!expense) {
        return res.status(404).json({
            message: "Expense not found"
        });
    }

    const { name, amount, category } = req.body;

    if (
        (name !== undefined &&
            (typeof name !== "string" || !name.trim())) ||
        (amount !== undefined &&
            (typeof amount !== "number" ||
             !Number.isFinite(amount) || amount <= 0)) ||
        (category !== undefined &&
            (typeof category !== "string" || !category.trim()))
    ) {
        return res.status(400).json({
            message: "Invalid update data"
        });
    }

    if (name !== undefined) expense.name = name;
    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category;

    res.status(200).json(expense);
});

// External API: Currency exchange rate
let currencyCache = null;

app.get("/api/currency", async (req, res) => {
    try {
        if (
            currencyCache &&
            Date.now() < currencyCache.expiresAt
        ) {
            return res.status(200).json(currencyCache.data);
        }

        const response = await fetch(
            "https://open.er-api.com/v6/latest/USD"
        );

        if (!response.ok) {
            throw new Error("Currency API request failed");
        }

        const result = await response.json();

        if (
            result.result !== "success" ||
            typeof result.rates?.KZT !== "number"
        ) {
            throw new Error("Invalid currency API response");
        }

        const currencyData = {
            base: "USD",
            target: "KZT",
            rate: result.rates.KZT,
            lastUpdated: result.time_last_update_utc,
            source: "ExchangeRate-API"
        };

        currencyCache = {
            data: currencyData,
            expiresAt: result.time_next_update_unix * 1000
        };

        res.status(200).json(currencyData);

    } catch (error) {
        console.error("Currency API error:", error.message);

        res.status(502).json({
            message: "Could not get currency exchange rate"
        });
    }
});

// AI Expense Analysis using Ollama
app.post("/api/expenses/analyze", async (req, res) => {
    try {
        if (expenses.length === 0) {
            return res.status(400).json({
                message: "There are no expenses to analyze"
            });
        }

        // Calculate total using JavaScript
        const totalExpenses = expenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );

        // Prepare expense list
     const expenseList = expenses.map(expense =>
    `Name: ${expense.name}, category: ${expense.category}`
).join("\n");

        // AI prompt
    const prompt = `
You are a personal finance assistant.

Analyze the expense categories listed below.

Do not calculate anything.
Do not mention numbers or money.
Do not correct or rewrite expense names.
Do not invent information.

Expenses:
${expenseList}

Give exactly 3 short and practical recommendations
to help the user save money.

Answer in simple Russian.
`;

        const response = await fetch(
            "http://localhost:11434/api/generate",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "qwen2.5:3b",
                    prompt: prompt,
                    stream: false
                })
            }
        );

        if (!response.ok) {
            throw new Error("Ollama request failed");
        }

        const result = await response.json();

        res.status(200).json({
            totalExpenses,
            analysis: result.response
        });

    } catch (error) {
        console.error("AI analysis error:", error.message);

        res.status(502).json({
            message: "Could not generate AI expense analysis"
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
