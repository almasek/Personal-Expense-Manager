# Personal Expense Manager

A web application for managing daily expenses, tracking spending, checking currency exchange rates, and receiving AI-powered financial recommendations.

## Features

- Add new expenses with a name, amount, and category.
- View all expenses.
- Delete expenses.
- Update expenses using the REST API.
- Automatically calculate total expenses.
- Get the current USD to KZT exchange rate from an external API.
- Receive AI-powered recommendations based on expense categories using Ollama.

## Technologies Used

### Frontend
- React
- Vite
- CSS
- JavaScript

### Backend
- Node.js
- Express.js
- REST API
- CORS

### External API
- ExchangeRate-API

### AI Integration
- Ollama
- Qwen 2.5 (3B)

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/expenses` | Get all expenses |
| POST | `/api/expenses` | Add a new expense |
| PATCH | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |
| GET | `/api/currency` | Get USD to KZT exchange rate |
| POST | `/api/expenses/analyze` | Generate AI recommendations |

The API includes input validation and appropriate HTTP status codes.

## External API Integration

The application uses ExchangeRate-API to get the latest USD to KZT exchange rate.

API endpoint:

https://open.er-api.com/v6/latest/USD

The received exchange rate is displayed in the frontend. The backend caches currency data until the next scheduled update.

## AI Integration

The project uses Ollama with the `qwen2.5:3b` model.

The AI analyzes expense names and categories and provides three practical recommendations to help users save money.

The AI runs locally through the Ollama API:

http://localhost:11434/api/generate

The total expense amount is calculated by JavaScript, not by the AI model.

## Installation and Setup

### 1. Install dependencies

Open the project folder in the terminal and run:

```bash
npm install
```

### 2. Install and prepare Ollama

Download Ollama:

https://ollama.com/

Download the AI model:

```bash
ollama pull qwen2.5:3b
```

Make sure Ollama is running before using the AI feature.

### 3. Start the backend

Open a terminal in the project folder and run:

```bash
node ./server/index.js
```

The backend runs at:

http://localhost:5000

### 4. Start the frontend

Open another terminal in the project folder and run:

```bash
npm run dev
```

Open the application in your browser:

http://localhost:5173

## Project Structure

```text
Personal-Expense-Manager/
│
├── server/
│   └── index.js
│
├── src/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
│
├── public/
├── index.html
├── package.json
├── README.md
└── .gitignore
```

## Notes

- Expenses are stored in server memory and reset when the backend restarts.
- Ollama must be running to use AI recommendations.
- An internet connection is required to retrieve the currency exchange rate.

## Author

Personal Expense Manager — Lab 6 Project.