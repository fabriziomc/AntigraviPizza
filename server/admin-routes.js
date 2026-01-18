
import express from 'express';
import { authenticateToken, requireAdmin } from './auth/auth-middleware.js';
import { getDb } from './db.js';
import DatabaseAdapter from './db-adapter.js';

const router = express.Router();
const adapter = new DatabaseAdapter();
const isTurso = adapter.isTurso;

/**
 * GET /api/admin/stats
 * Get system statistics
 */
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDb();
        const stats = {};

        if (isTurso) {
            // Turso / LibSQL
            const userCount = await db.execute("SELECT COUNT(*) as count FROM Users");
            const pizzaNightCount = await db.execute("SELECT COUNT(*) as count FROM PizzaNights");
            const recipeCount = await db.execute("SELECT COUNT(*) as count FROM Recipes");
            // Assuming Reviews table or rating logic? Recipes has rating.
            // Let's just count basic entities for now.

            stats.users = userCount.rows[0].count;
            stats.pizzaNights = pizzaNightCount.rows[0].count;
            stats.recipes = recipeCount.rows[0].count;
        } else {
            // SQLite
            const userCount = db.prepare("SELECT COUNT(*) as count FROM Users").get();
            const pizzaNightCount = db.prepare("SELECT COUNT(*) as count FROM PizzaNights").get();
            const recipeCount = db.prepare("SELECT COUNT(*) as count FROM Recipes").get();

            stats.users = userCount.count;
            stats.pizzaNights = pizzaNightCount.count;
            stats.recipes = recipeCount.count;
        }

        res.json(stats);
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

/**
 * GET /api/admin/users
 * Get all users
 */
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDb();
        let users = [];

        if (isTurso) {
            const result = await db.execute("SELECT id, email, name, role, createdAt, lastLogin FROM Users ORDER BY createdAt DESC");
            users = result.rows;
        } else {
            users = db.prepare("SELECT id, email, name, role, createdAt, lastLogin FROM Users ORDER BY createdAt DESC").all();
        }

        res.json(users);
    } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * PUT /api/admin/users/:id/role
 * Update user role
 */
router.put('/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    console.log(`🔐 [ADMIN ROUTE] PUT /users/${id}/role called by ${req.user?.email} (ID: ${req.user?.id})`);
    try {
        console.log(`   Requested Role: ${role}`);

        if (!role || !['admin', 'user'].includes(role)) {
            console.warn(`   Invalid role: ${role}`);
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Prevent self-demotion
        if (req.user.id === id) {
            console.warn(`   Self-demotion attempt by ${req.user.email} (ID: ${req.user.id} matches target ID: ${id})`);
            return res.status(403).json({ error: 'Cannot change your own role' });
        }

        const success = await adapter.updateUserRoleById(id, role);
        console.log(`   Update result for user ${id}: ${success}`);

        if (success) {
            res.json({ success: true, message: `User role updated to ${role}` });
        } else {
            console.warn(`   User with ID ${id} not found for update`);
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('❌ Update role error:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

export default router;
