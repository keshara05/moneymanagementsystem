require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Income = require('./models/Income');
const Expense = require('./models/Expense');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/financeTracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// --- INCOME ROUTES ---

// Get all incomes
app.get('/api/incomes', async (req, res) => {
    try {
        const incomes = await Income.find().sort({ date: -1, createdAt: -1 });
        res.json(incomes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add new income
app.post('/api/incomes', async (req, res) => {
    const income = new Income({
        date: req.body.date,
        description: req.body.description,
        amount: req.body.amount
    });

    try {
        const newIncome = await income.save();
        res.status(201).json(newIncome);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete income
app.delete('/api/incomes/:id', async (req, res) => {
    try {
        await Income.findByIdAndDelete(req.params.id);
        res.json({ message: 'Income deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- EXPENSE ROUTES ---

// Get all expenses
app.get('/api/expenses', async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1, createdAt: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add new expense
app.post('/api/expenses', async (req, res) => {
    const expense = new Expense({
        date: req.body.date,
        description: req.body.description,
        category: req.body.category,
        amount: req.body.amount
    });

    try {
        const newExpense = await expense.save();
        res.status(201).json(newExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete all data (for reset feature)
app.delete('/api/clear-all', async (req, res) => {
    try {
        await Income.deleteMany({});
        await Expense.deleteMany({});
        res.json({ message: 'All data cleared' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
