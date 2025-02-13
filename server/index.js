const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const cors = require('cors');
require('dotenv').config();
console.log('JWT_SECRET is:', process.env.JWT_SECRET ? 'configured' : 'missing');

const app = express();

// Set CORS headers for all routes
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5002', 'http://localhost:55000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Regular middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://192.168.105.23:27017/financetracker')
    .then(() => {
        console.log('MongoDB Connected Successfully');
        console.log('Connection URL:', mongoose.connection.host);
        console.log('Database Name:', mongoose.connection.name);

        // Test the connection by listing collections
        mongoose.connection.db.listCollections().toArray((err, collections) => {
            if (err) {
                console.log('Error listing collections:', err);
            } else {
                console.log('Available collections:', collections.map(c => c.name));
            }
        });
    })
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

// Routes
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 55000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`MongoDB URI: ${process.env.MONGODB_URI || 'Using default connection string'}`);
});