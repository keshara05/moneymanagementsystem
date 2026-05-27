require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Income = require('./models/Income');
const Expense = require('./models/Expense');
const auth = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serverless MongoDB Connection Logic
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        const db = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/financeTracker', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000 // Fail fast if no connection
        });
        isConnected = !!db.connections[0].readyState;
        console.log('Connected to MongoDB (Serverless)');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};

// Middleware to ensure DB connection on every request
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// --- AUTHENTICATION ROUTES ---

// Register User
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ name, email, password });
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        // Create JWT
        const payload = { user: { id: user.id } };
        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secretkey123',
            { expiresIn: '30d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { name: user.name, email: user.email, picture: user.picture } });
            }
        );
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Standard login check (must have password)
        if (!user.password) {
            return res.status(400).json({ message: 'This account uses Google Sign-In. Please sign in with Google.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT
        const payload = { user: { id: user.id } };
        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secretkey123',
            { expiresIn: '30d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { name: user.name, email: user.email, picture: user.picture } });
            }
        );
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Google Authentication
app.post('/api/auth/google', async (req, res) => {
    const { credential, email, name, picture, googleId } = req.body;
    
    let userEmail = email;
    let userName = name;
    let userPicture = picture;
    let userGoogleId = googleId;

    if (credential) {
        try {
            // Decode JWT safely (works without external API call)
            const base64Url = credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                Buffer.from(base64, 'base64')
                    .toString()
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            const decoded = JSON.parse(jsonPayload);
            userEmail = decoded.email;
            userName = decoded.name;
            userPicture = decoded.picture;
            userGoogleId = decoded.sub;
        } catch (e) {
            console.error('Error decoding credential JWT:', e);
            if (!userEmail) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
        }
    }

    if (!userEmail) {
        return res.status(400).json({ message: 'Google Sign-In failed: No email provided' });
    }

    try {
        let user = await User.findOne({ email: userEmail });
        if (!user) {
            // Create user
            user = new User({
                name: userName || userEmail.split('@')[0],
                email: userEmail,
                googleId: userGoogleId,
                picture: userPicture || ''
            });
            await user.save();
        } else if (!user.googleId && userGoogleId) {
            // Link Google account to existing email
            user.googleId = userGoogleId;
            if (userPicture) user.picture = userPicture;
            await user.save();
        }

        // Create JWT
        const payload = { user: { id: user.id } };
        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secretkey123',
            { expiresIn: '30d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { name: user.name, email: user.email, picture: user.picture } });
            }
        );
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get User Profile
app.get('/api/auth/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- INCOME ROUTES (PROTECTED) ---

// Get all incomes for authenticated user
app.get('/api/incomes', auth, async (req, res) => {
    try {
        const incomes = await Income.find({ user: req.user.id }).sort({ date: -1, createdAt: -1 });
        res.json(incomes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add new income
app.post('/api/incomes', auth, async (req, res) => {
    const income = new Income({
        user: req.user.id,
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
app.delete('/api/incomes/:id', auth, async (req, res) => {
    try {
        const income = await Income.findOne({ _id: req.params.id, user: req.user.id });
        if (!income) {
            return res.status(404).json({ message: 'Income record not found' });
        }
        await income.deleteOne();
        res.json({ message: 'Income deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- EXPENSE ROUTES (PROTECTED) ---

// Get all expenses for authenticated user
app.get('/api/expenses', auth, async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1, createdAt: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add new expense
app.post('/api/expenses', auth, async (req, res) => {
    const expense = new Expense({
        user: req.user.id,
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
app.delete('/api/expenses/:id', auth, async (req, res) => {
    try {
        const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });
        if (!expense) {
            return res.status(404).json({ message: 'Expense record not found' });
        }
        await expense.deleteOne();
        res.json({ message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete all data for user (reset feature)
app.delete('/api/clear-all', auth, async (req, res) => {
    try {
        await Income.deleteMany({ user: req.user.id });
        await Expense.deleteMany({ user: req.user.id });
        res.json({ message: 'All user data cleared' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Export the Express API for Vercel Serverless Functions
module.exports = app;
