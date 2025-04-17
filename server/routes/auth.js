const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
require('dotenv').config();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check for JWT_SECRET
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not configured');
        }

        // Log the incoming request
        console.log('Registration attempt:', { name, email });

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create new user
        const user = new User({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password
        });

        console.log('Attempting to save user:', user);

        await user.save();
        console.log('User saved successfully');

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('Token generated for user:', user._id);

        // Set token in cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Error creating user: ' + error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('Setting auth_token cookie for user:', user._id);

        //Set token in cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days


        });

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// In auth.js routes (add this if you don't have it)
router.post('/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ success: true, message: 'Logged out successfully' });
});

// Verify token and get user
router.get('/verify', auth, async (req, res) => {
    try {
        console.log('Verify endpoint hit, userId:', req.userId);

        // Get user info but exclude password
        const user = await User.findById(req.userId)
            .select('-password');

        if (!user) {
            console.log('User not found for ID:', req.userId);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('User verified successfully:', user.email);

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ error: 'Error verifying user' });
    }
});

module.exports = router;