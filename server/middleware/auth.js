// auth.js middleware
const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = async (req, res, next) => {
    try {
        // Debug logging
        console.log('\n=== Auth Middleware Debug ===');
        console.log('Cookies:', req.cookies);
        console.log('Cookie auth_token specifically:', req.cookies?.auth_token);
        console.log('Authorization Header:', req.headers.authorization);

        // Get token from cookie first
        let token = req.cookies?.auth_token;

        // If no cookie token, try Authorization header as fallback
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            } else {
                token = authHeader;
            }
            console.log('Using token from Authorization header');
        }

        if (!token) {
            console.log('❌ No authentication token found');
            return res.status(401).json({ error: 'No authentication token' });
        }

        console.log('Token found, verifying...');

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('✅ Token successfully decoded:', decoded);

            // Add user info to request
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
            error: 'Authentication error',
            details: error.message
        });
    }
};

module.exports = auth;