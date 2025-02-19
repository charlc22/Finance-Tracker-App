// auth.js middleware
const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = async (req, res, next) => {
    try {
        // Debug logging
        console.log('\n=== Auth Middleware Debug ===');
        console.log('Full Headers:', req.headers);
        console.log('Auth Header:', req.header('Authorization'));

        // Get token from header and clean it
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            console.log('❌ No Authorization header found');
            return res.status(401).json({ error: 'No authentication token' });
        }

        // Clean and extract the token
        let token = authHeader;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.slice(7);
        }

        if (!token) {
            console.log('❌ No token found after cleaning');
            return res.status(401).json({ error: 'No authentication token' });
        }

        console.log('Token being verified:', token.substring(0, 20) + '...');
        console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('✅ Token decoded:', decoded);

            // Add both userId and user to request
            req.userId = decoded.userId;
            req.user = { userId: decoded.userId };

            next();
        } catch (jwtError) {
            console.log('❌ JWT Verification failed:', jwtError.message);
            return res.status(401).json({
                error: 'Invalid token',
                details: jwtError.message
            });
        }
    } catch (error) {
        console.error('❌ Auth middleware error:', error);
        res.status(401).json({
            error: 'Please authenticate',
            details: error.message
        });
    }
};

module.exports = auth;