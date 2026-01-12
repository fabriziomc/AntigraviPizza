import jwt from 'jsonwebtoken';

// JWT Secret - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'antigravipizza-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

/**
 * Middleware to authenticate JWT token
 * Adds req.user with user data if token is valid
 */
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT verification failed:', err.message);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        req.user = user;
        console.log('🛡️ AUTH DEBUG: Valid token for user:', user.email, 'Role:', user.role);
        next();
    });
}

/**
 * Middleware to require Admin role
 */
export function requireAdmin(req, res, next) {
    console.log('👑 ADMIN DEBUG: Checking admin access for:', req.user?.email, 'Role:', req.user?.role);
    if (!req.user || req.user.role !== 'admin') {
        console.warn('⛔ ADMIN DEBUG: Access denied. User role is:', req.user?.role);
        return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    next();
}

/**
 * Optional authentication - doesn't fail if no token
 * Useful for routes that can work with or without authentication
 */
export function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (!err) {
                req.user = user;
            }
        });
    }

    next();
}

/**
 * Generate JWT token for a user
 */
export function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'user'
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}
