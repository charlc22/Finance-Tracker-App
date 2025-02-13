const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Request Headers:', req.headers);
    next();
});

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5002', 'http://localhost:55000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Pre-flight requests
app.options('*', cors());

app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running' });
});


// MongoDB Connection with better error handling and options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://192.168.105.23:27017/financetracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Reduce timeout for faster feedback
    heartbeatFrequencyMS: 2000,     // More frequent heartbeats
})
    .then(() => {
        console.log('MongoDB Connected Successfully');
        console.log('Connection URL:', mongoose.connection.host);
        console.log('Database Name:', mongoose.connection.name);
    })
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        console.log('Could not connect to MongoDB. Please check:');
        console.log('1. Is MongoDB running at 192.168.105.23:27017?');
        console.log('2. Is the MongoDB server accessible from this machine?');
        console.log('3. Are there any firewall rules blocking the connection?');

        // Don't exit the process, just log the error
        console.log('Server will continue running without MongoDB connection...');
    });

// Routes
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', err);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

const PORT = process.env.PORT || 55000;

// More detailed server startup
const server = app.listen(PORT, '0.0.0.0', (error) => {
    if (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }

    const serverInfo = server.address();
    console.log(`Server is running on port ${serverInfo.port}`);
    console.log(`Server is bound to ${serverInfo.address}`);
    console.log(`Full URL: http://localhost:${serverInfo.port}`);
    console.log(`Test URL: http://localhost:${serverInfo.port}/api/test`);
    console.log('JWT_SECRET is:', process.env.JWT_SECRET ? 'configured' : 'missing');
    console.log(`MongoDB URI: ${process.env.MONGODB_URI || 'Using default connection string'}`);
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Try these commands to find and kill the process:`);
        console.error(`lsof -i :${PORT}`);
        console.error(`kill -9 PID`);
    } else {
        console.error('Server error:', error);
    }
    process.exit(1);
});