import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { generateToken, authenticateToken } from './auth-middleware.js';
import DatabaseAdapter from '../db-adapter.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../email-service.js';

const router = express.Router();
const dbAdapter = new DatabaseAdapter();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, businessName } = req.body;

        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({
                error: 'Email, password, and name are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const existingUser = await dbAdapter.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const user = await dbAdapter.createUser({
            id: userId,
            email: email.toLowerCase(),
            password: hashedPassword,
            name,
            businessName: businessName || null,
            createdAt: Date.now(),
            lastLogin: Date.now()
        });

        // Create default settings for user
        await dbAdapter.createUserSettings(userId);

        // Initialize default categories and ingredients for new user
        await dbAdapter.initializeUserDefaults(userId);

        // Generate token
        const token = generateToken(user);

        console.log(`✅ New user registered: ${email}`);

        // Send welcome email asynchronously
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        sendWelcomeEmail(user.email, user.name, baseUrl).catch(err => {
            console.error('Failed to send welcome email:', err);
        });

        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                businessName: user.businessName,
                role: user.role || 'user'
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

/**
 * POST /api/auth/login
 * Login existing user
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        // Find user
        const user = await dbAdapter.getUserByEmail(email.toLowerCase());
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await dbAdapter.updateUserLastLogin(user.id);

        // Generate token
        const token = generateToken(user);

        console.log(`✅ User logged in: ${email}`);

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                businessName: user.businessName,
                role: user.role || 'user'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * GET /api/auth/me
 * Get current user profile (requires authentication)
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const user = await dbAdapter.getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            businessName: user.businessName,
            role: user.role || 'user',
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user data' });
    }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { name, businessName } = req.body;
        const updates = {};

        if (name) updates.name = name;
        if (businessName !== undefined) updates.businessName = businessName;

        const updatedUser = await dbAdapter.updateUser(userId, updates);

        res.json({
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            businessName: updatedUser.businessName
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * POST /api/auth/change-password
 * Change user password (requires authentication)
 */
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { currentPassword, newPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Current password and new password are required'
            });
        }

        // Validate new password strength
        if (newPassword.length < 8) {
            return res.status(400).json({
                error: 'New password must be at least 8 characters long'
            });
        }

        // Get user
        const user = await dbAdapter.getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await dbAdapter.updateUser(userId, { password: hashedPassword });

        console.log(`✅ Password changed for user: ${user.email}`);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await dbAdapter.getUserByEmail(email.toLowerCase());
        if (!user) {
            // Return 200 even if user not found for security
            return res.json({ message: 'Se l\'email è registrata, riceverai un link di reset.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + 3600000; // 1 hour

        await dbAdapter.setUserResetToken(user.email, token, expires);

        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password.html?token=${token}`;
        await sendPasswordResetEmail(user.email, user.name, resetUrl);

        res.json({ message: 'Se l\'email è registrata, riceverai un link di reset.' });
    } catch (error) {
        console.error('❌ Forgot password error:', error);

        if (error.response) {
            console.error('🔴 Resend error response:', await error.response.json());
        }
        res.status(500).json({ error: 'Operazione fallita: ' + error.message });
    }
});

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'La password deve essere di almeno 8 caratteri' });
        }

        const user = await dbAdapter.getUserByResetToken(token);
        if (!user || user.resetExpires < Date.now()) {
            return res.status(400).json({ error: 'Token non valido o scaduto' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await dbAdapter.updateUser(user.id, { password: hashedPassword });
        await dbAdapter.clearUserResetToken(user.id);

        res.json({ message: 'Password aggiornata con successo!' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Reset fallito' });
    }
});

export default router;
