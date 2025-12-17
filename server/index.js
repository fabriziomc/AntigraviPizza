import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import recipeRoutes from './routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API routes MUST come before static file serving
app.use('/api', recipeRoutes);

// Serve static files from dist directory
const distPath = path.join(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');

console.log('Dist path:', distPath);
console.log('Index.html exists:', existsSync(indexPath));

app.use(express.static(distPath));

// Handle SPA routing - serve index.html for all non-API, non-static routes
app.use((req, res, next) => {
    // Don't handle API routes
    if (req.path.startsWith('/api')) {
        return next();
    }

    // Serve index.html for all other routes
    if (existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Application not built');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on http://0.0.0.0:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`💾 Database: ${process.env.DB_TYPE}`);
});
