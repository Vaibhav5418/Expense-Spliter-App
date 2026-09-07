const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'finpulse_jwt_secure_secret_key_2026';

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'Unauthorized: No token provided', 
                code: 'NO_TOKEN' 
            });
        }

        const token = authHeader.substring(7).trim();

        if (!token || token === 'undefined' || token === 'null' || token === 'Bearer') {
            return res.status(401).json({ 
                error: 'Unauthorized: Empty or invalid token format', 
                code: 'INVALID_TOKEN_FORMAT' 
            });
        }

        // Verify token with JWT_SECRET
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ 
                error: 'Unauthorized: Token payload is missing user identity', 
                code: 'INVALID_PAYLOAD' 
            });
        }

        req.userId = decoded.userId;
        req.user = decoded;
        next();
    } catch (err) {
        console.error('JWT Auth Error:', err.name, err.message);

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Unauthorized: Token has expired. Please log in again.', 
                code: 'TOKEN_EXPIRED',
                expiredAt: err.expiredAt 
            });
        }

        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Unauthorized: Invalid, malformed, or damaged token.', 
                code: 'INVALID_TOKEN' 
            });
        }

        if (err.name === 'NotBeforeError') {
            return res.status(401).json({ 
                error: 'Unauthorized: Token is not active yet.', 
                code: 'TOKEN_INACTIVE' 
            });
        }

        return res.status(401).json({ 
            error: 'Unauthorized: Authentication failed.', 
            code: 'AUTH_FAILED' 
        });
    }
};

module.exports = auth;
