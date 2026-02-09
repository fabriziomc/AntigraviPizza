import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import recipeRoutes from './routes.js';
import authRoutes from './auth/auth-routes.js';
import { authenticateToken } from './auth/auth-middleware.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1); // For Render/Proxies
const PORT = process.env.PORT || 3000;

console.log('🔍 DEBUG INFO:');
console.log('  - PORT env var:', process.env.PORT);
console.log('  - Using PORT:', PORT);
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - DB_TYPE:', process.env.DB_TYPE);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// IMPORTANT: Auth routes MUST come before protected routes
// Public authentication routes (no auth required)
app.use('/api/auth', authRoutes);

// Admin routes
import adminRoutes from './admin-routes.js';
app.use('/api/admin', adminRoutes);

// Protected API routes (auth required) - skip /api/auth/* and guest-accessible routes
app.use('/api', (req, res, next) => {
    // Skip authentication for /api/auth routes
    if (req.path.startsWith('/auth')) {
        return next();
    }

    // Skip authentication for Bring! integration endpoints
    if (req.path.startsWith('/bring/')) {
        console.log(`[INDEX.JS] Skipping auth for Bring! endpoint: ${req.path}`);
        return next();
    }

    // Skip authentication for health endpoint
    if (req.path === '/health') {
        return next();
    }

    // Skip authentication for guest endpoints
    if (req.path.startsWith('/guest/')) {
        console.log(`[INDEX.JS] Skipping auth for guest endpoint: ${req.path}`);
        return next();
    }

    // Skip authentication for GET requests to pizza-nights (needed for guest view)
    // Guests need to view pizza night details and themes without logging in
    if (req.method === 'GET') {
        // Allow public access to pizza nights, themes, recipes, preparations, ingredients, and categories
        if (req.path.match(/^\/pizza-nights(\/[^\/]+)?(\/theme)?$/) ||
            req.path.match(/^\/recipes(\/.+)?$/) ||
            req.path.match(/^\/preparations(\/.+)?$/) ||
            req.path.match(/^\/ingredients(\/.+)?$/) ||
            req.path.match(/^\/categories(\/.+)?$/)) {
            return next();
        }
    }

    // Apply authentication for all other /api routes
    authenticateToken(req, res, next);
}, recipeRoutes);

const setNoCache = (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
};

// Serve static files from public directory (for guest.html, login.html, register.html, and theme images)
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath, { setHeaders: setNoCache }));
console.log('Public path:', publicPath);

// Serve static files from dist directory
const distPath = path.join(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');

console.log('Dist path:', distPath);
console.log('Index.html exists:', existsSync(indexPath));

app.use(express.static(distPath, { setHeaders: setNoCache }));

// Handle SPA routing - serve index.html for all non-API, non-static routes
app.use((req, res, next) => {
    // Don't handle API routes
    if (req.path.startsWith('/api')) {
        return next();
    }

    // Public routes that don't require authentication
    const publicRoutes = ['/login.html', '/register.html', '/guest.html', '/forgot-password.html', '/reset-password.html'];
    if (publicRoutes.some(route => req.path.startsWith(route))) {
        return next();
    }

    // Serve index.html for all other routes
    if (existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Application not built');
    }
});


// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('🔍 [INDEX.JS] app.listen callback fired!');
    console.log(`✅ Server is running on http://0.0.0.0:${PORT}`);
    console.log(`🚀 SERVER VERSION: v3 (Multi-User Auth)`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`💾 Database: ${process.env.DB_TYPE}`);
    console.log(`🔐 Authentication: Enabled`);
});

// Keep process alive check
setInterval(() => { }, 1000); // Dummy interval to keep process alive if somehow event loop empties
