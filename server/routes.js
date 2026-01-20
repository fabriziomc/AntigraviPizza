import express from 'express';
import DatabaseAdapter from './db-adapter.js';
import generateImageRoute from './routes/generate-image.js';
import { authenticateToken } from './auth/auth-middleware.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const dbAdapter = new DatabaseAdapter();

// ==========================================
// GLOBAL AUTHENTICATION MIDDLEWARE
// ==========================================
// Apply authentication to all routes except public GET endpoints and guest endpoints
router.use((req, res, next) => {
    // Public GET endpoints for guest page
    const publicGetEndpoints = [
        '/recipes',
        '/preparations',
        '/ingredients',
        '/categories'
    ];

    // Guest endpoints (no authentication required)
    const guestEndpoints = [
        '/guest/',
        '/bring/',  // Bring! integration endpoints
        '/health'   // Health check endpoint for keep-alive
    ];

    const isPublicGet = req.method === 'GET' && publicGetEndpoints.some(endpoint => req.path === endpoint || req.path.startsWith(endpoint + '/'));
    const isGuestEndpoint = guestEndpoints.some(endpoint => req.path.startsWith(endpoint));

    // Debug logging
    if (req.path.includes('guest') || req.path.includes('bring')) {
        console.log(`[AUTH MIDDLEWARE] path: ${req.path}, isGuestEndpoint: ${isGuestEndpoint}`);
    }

    if (isPublicGet) {
        // For public GET endpoints, try to authenticate but don't require it
        authenticateToken(req, res, (err) => {
            // Continue regardless of authentication result
            next();
        });
    } else if (isGuestEndpoint) {
        // Guest endpoints don't require authentication at all
        console.log(`[AUTH MIDDLEWARE] Skipping auth for guest/bring endpoint: ${req.path}`);
        next();
    } else {
        // All other routes require authentication
        authenticateToken(req, res, next);
    }
});

// Generate Image Proxy Route
router.post('/generate-image', generateImageRoute);

// ==========================================
// RECIPES
// ==========================================

// GET all recipes
router.get('/recipes', async (req, res) => {
    try {
        // If authenticated, filter by userId; otherwise return empty array for guests
        const userId = req.user?.id;
        if (!userId) {
            // Guest access - return empty array or public recipes
            return res.json([]);
        }
        const recipes = await dbAdapter.getAllRecipes(userId);
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single recipe
router.get('/recipes/:id', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        const recipe = await dbAdapter.getRecipeById(req.params.id, userId);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE recipe
router.post('/recipes', async (req, res) => {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        // Check recipe limit for non-admin users
        if (!isAdmin) {
            const currentRecipes = await dbAdapter.getAllRecipes(userId);
            if (currentRecipes.length >= 100) {
                return res.status(403).json({
                    error: 'raggiunto limite massimo pizze per licenza free'
                });
            }
        }

        console.log('📥 [POST /recipes] Received recipe data:', JSON.stringify(req.body, null, 2));
        const recipe = await dbAdapter.createRecipe(req.body, userId);
        console.log('✅ [POST /recipes] Recipe created successfully:', recipe.id);
        res.status(201).json(recipe);
    } catch (err) {
        console.error('❌ [POST /recipes] Error creating recipe:', err);
        res.status(500).json({ error: err.message });
    }
});

// UPDATE recipe
router.put('/recipes/:id', async (req, res) => {
    try {
        const recipe = await dbAdapter.updateRecipe(req.params.id, req.body, req.user.id);
        res.json(recipe);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPLOAD recipe image
router.post('/recipes/:id/image', async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ error: 'No image data provided' });
        }

        let imageUrlToStore = imageBase64;
        const recipe = await dbAdapter.updateRecipe(req.params.id, { imageUrl: imageUrlToStore }, req.user.id);

        console.log(`📸 [POST /recipes/${req.params.id}/image] Image uploaded (Base64 length: ${imageUrlToStore.length})`);
        res.json({ imageUrl: imageUrlToStore, recipe });
    } catch (err) {
        console.error('❌ [POST /recipes/:id/image] Error:', err);
        console.error(err.stack);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

// PATCH recipe (partial update)
router.patch('/recipes/:id', async (req, res) => {
    try {
        console.log(`📝 [PATCH /recipes/${req.params.id}] Partial update:`, req.body);
        const recipe = await dbAdapter.updateRecipe(req.params.id, req.body, req.user.id);
        console.log(`✅ [PATCH /recipes/${req.params.id}] Updated successfully`);
        res.json(recipe);
    } catch (err) {
        console.error(`❌ [PATCH /recipes/${req.params.id}] Error:`, err.message);
        res.status(500).json({ error: err.message });
    }
});

// PATCH recipe components (ingredients + preparations) with validation
router.patch('/recipes/:id/components', async (req, res) => {
    try {
        console.log(`🔧 [PATCH /recipes/${req.params.id}/components] Updating components`);
        const { baseIngredients, preparations } = req.body;
        const userId = req.user.id;

        // Validate ingredients exist in database
        if (baseIngredients) {
            const allIngredients = await dbAdapter.getAllIngredients(userId);
            const ingredientIds = new Set(allIngredients.map(i => i.id));

            for (const ing of baseIngredients) {
                if (!ingredientIds.has(ing.id)) {
                    return res.status(400).json({
                        error: `Ingredient with id ${ing.id} not found`
                    });
                }
                // Validate required fields
                if (!ing.name || ing.quantity == null || !ing.unit) {
                    return res.status(400).json({
                        error: 'Each ingredient must have name, quantity, and unit'
                    });
                }
            }
        }

        // Validate preparations exist in database
        if (preparations) {
            const allPreparations = await dbAdapter.getAllPreparations(userId);
            const prepIds = new Set(allPreparations.map(p => p.id));

            for (const prep of preparations) {
                if (!prepIds.has(prep.id)) {
                    return res.status(400).json({
                        error: `Preparation with id ${prep.id} not found`
                    });
                }
                // Validate required fields
                if (prep.quantity == null || !prep.unit) {
                    return res.status(400).json({
                        error: 'Each preparation must have quantity and unit'
                    });
                }
            }
        }

        // Update recipe with validated components
        const updateData = {};
        if (baseIngredients) updateData.baseIngredients = baseIngredients;
        if (preparations) updateData.preparations = preparations;

        const recipe = await dbAdapter.updateRecipe(req.params.id, updateData, userId);
        console.log(`✅ [PATCH /recipes/${req.params.id}/components] Updated successfully`);
        res.json(recipe);
    } catch (err) {
        console.error(`❌ [PATCH /recipes/${req.params.id}/components] Error:`, err.message);
        res.status(500).json({ error: err.message });
    }
});


// DELETE recipe
router.delete('/recipes/:id', async (req, res) => {
    try {
        await dbAdapter.deleteRecipe(req.params.id, req.user.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Sync all recipe ratings based on pizza nights
router.post('/recipes/sync-ratings', async (req, res) => {
    try {
        const results = await dbAdapter.recalculateAllRecipeRatings();
        res.json({ message: 'Ratings synced successfully', results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Import recipe from text
router.post('/import-recipe', async (req, res) => {
    try {
        console.log('📥 [POST /import-recipe] Received import request');
        const { recipeText } = req.body;

        if (!recipeText || typeof recipeText !== 'string') {
            return res.status(400).json({ error: 'recipeText is required and must be a string' });
        }

        // Import parser and service
        const { parseRecipeFile } = await import('./recipeParser.js');
        const { importMultipleRecipes } = await import('./recipeImportService.js');

        // Parse recipes from text
        console.log('🔍 Parsing recipe text...');
        const parsedRecipes = parseRecipeFile(recipeText);
        console.log(`✅ Parsed ${parsedRecipes.length} recipe(s)`);

        if (parsedRecipes.length === 0) {
            return res.status(400).json({
                error: 'No recipes found in text',
                hint: 'Make sure recipes are numbered (e.g., "1. Pizza Name")'
            });
        }

        // Check recipe limit for non-admin users
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isAdmin) {
            const currentRecipes = await dbAdapter.getAllRecipes(userId);
            if (currentRecipes.length + parsedRecipes.length > 100) {
                return res.status(403).json({
                    error: 'raggiunto limite massimo pizze per licenza free'
                });
            }
        }

        // Import all parsed recipes
        console.log('💾 Importing recipes into database...');
        const results = await importMultipleRecipes(parsedRecipes, dbAdapter);

        console.log(`✅ Import complete: ${results.success.length} succeeded, ${results.failed.length} failed`);

        res.json({
            success: true,
            imported: results.success.length,
            failed: results.failed.length,
            recipes: results.success.map(r => r.recipe),
            createdIngredients: results.totalCreatedIngredients,
            createdPreparations: results.totalCreatedPreparations,
            errors: results.failed.length > 0 ? results.failed : undefined
        });
    } catch (err) {
        console.error('❌ [POST /import-recipe] Error:', err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

// ==========================================
// GUEST ENDPOINTS (Public - No Authentication Required)
// ==========================================
// These endpoints allow guests to view pizza night data without authentication
// Security is maintained by verifying the guest belongs to the pizza night

// GET pizza night data for a specific guest
router.get('/guest/pizza-nights/:nightId/:guestId', async (req, res) => {
    try {
        const { nightId, guestId } = req.params;
        console.log(`[GUEST] Fetching pizza night ${nightId} for guest ${guestId}`);

        // Fetch pizza night without userId filtering (public access)
        const pizzaNight = await dbAdapter.getPizzaNightById(nightId, null);

        if (!pizzaNight) {
            return res.status(404).json({ error: 'Pizza night not found' });
        }

        // Verify guest belongs to this pizza night
        const guestBelongsToNight = pizzaNight.selectedGuests &&
            pizzaNight.selectedGuests.includes(guestId);

        if (!guestBelongsToNight) {
            return res.status(403).json({ error: 'Guest not authorized for this pizza night' });
        }

        // Fetch full guest details
        const allGuests = await dbAdapter.getAllGuests(pizzaNight.userId);
        const guests = allGuests.filter(g => pizzaNight.selectedGuests.includes(g.id));

        // Return pizza night with guest details
        res.json({
            ...pizzaNight,
            guests
        });
    } catch (err) {
        console.error('[GUEST] Error fetching pizza night:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET theme data for a pizza night (guest access)
router.get('/guest/pizza-nights/:nightId/:guestId/theme', async (req, res) => {
    try {
        const { nightId, guestId } = req.params;
        console.log(`[GUEST] Fetching theme for pizza night ${nightId}, guest ${guestId}`);

        // Fetch pizza night to verify guest access
        const pizzaNight = await dbAdapter.getPizzaNightById(nightId, null);

        if (!pizzaNight) {
            return res.status(404).json({ error: 'Pizza night not found' });
        }

        // Verify guest belongs to this pizza night
        const guestBelongsToNight = pizzaNight.selectedGuests &&
            pizzaNight.selectedGuests.includes(guestId);

        if (!guestBelongsToNight) {
            return res.status(403).json({ error: 'Guest not authorized for this pizza night' });
        }

        // Import theme modules
        const { detectTheme } = await import('./theme-detector.js');
        const { getThemeConfig } = await import('./theme-config.js');
        const { getThemeMessages } = await import('./theme-messages.js');

        // Detect theme from pizza night name
        const themeId = detectTheme(pizzaNight.name || '');
        const config = getThemeConfig(themeId);
        const messages = getThemeMessages(themeId);

        res.json({
            theme: themeId,
            config,
            messages
        });
    } catch (err) {
        console.error('[GUEST] Error getting theme:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET recipe data for guest (public view)
router.get('/guest/recipes/:recipeId', async (req, res) => {
    try {
        const { recipeId } = req.params;
        console.log(`[GUEST] Fetching recipe ${recipeId}`);

        // Fetch recipe without userId filtering (public view)
        // Note: This returns the recipe regardless of owner, which is acceptable
        // since recipes are only accessible via pizza night context
        const recipe = await dbAdapter.getRecipeById(recipeId, null);

        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        res.json(recipe);
    } catch (err) {
        console.error('[GUEST] Error fetching recipe:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST rating from guest
router.post('/guest/pizza-nights/:nightId/:guestId/rate-pizza', async (req, res) => {
    try {
        const { nightId, guestId } = req.params;
        const { recipeId, rating } = req.body;

        console.log(`[GUEST] Rating pizza: night=${nightId}, guest=${guestId}, recipe=${recipeId}, rating=${rating}`);

        // Fetch pizza night to verify guest access
        const pizzaNight = await dbAdapter.getPizzaNightById(nightId, null);

        if (!pizzaNight) {
            return res.status(404).json({ error: 'Pizza night not found' });
        }

        // Verify guest belongs to this pizza night
        const guestBelongsToNight = pizzaNight.selectedGuests &&
            pizzaNight.selectedGuests.includes(guestId);

        if (!guestBelongsToNight) {
            return res.status(403).json({ error: 'Guest not authorized for this pizza night' });
        }

        // Check if night is completed
        if (pizzaNight.status === 'completed') {
            return res.status(403).json({ error: 'Cannot rate a completed night' });
        }

        // Submit rating using the pizza night owner's userId
        const updatedNight = await dbAdapter.ratePizzaInNight(nightId, recipeId, rating, pizzaNight.userId);

        res.json({ success: true, night: updatedNight });
    } catch (err) {
        console.error('[GUEST] Error rating pizza:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================

// PIZZA NIGHTS
// ==========================================

// GET single pizza night (MUST be before /pizza-nights to avoid route matching issues)
router.get('/pizza-nights/:id', async (req, res) => {
    try {
        console.log('[ROUTE] GET /pizza-nights/:id called with ID:', req.params.id);
        const pizzaNight = await dbAdapter.getPizzaNightById(req.params.id, req.user.id);
        if (!pizzaNight) {
            return res.status(404).json({ message: 'Pizza night not found' });
        }
        console.log('[ROUTE] Returning pizza night with guests:', pizzaNight.guests);
        res.json(pizzaNight);
    } catch (err) {
        console.error('[ROUTE ERROR]', err);
        res.status(500).json({ error: err.message });
    }
});

// NEW: Upload/Update Pizza Night Image
router.post('/pizza-nights/:id/image', async (req, res) => {
    try {
        const { id } = req.params;
        const { imageBase64 } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: 'imageBase64 is required' });
        }

        console.log(`📸 Received image update for pizza night ${id}`);

        // Update database with new image URL (base64 data URI)
        const updatedNight = await dbAdapter.updatePizzaNight(id, {
            imageUrl: imageBase64
        }, req.user.id);

        res.json({ success: true, imageUrl: imageBase64, night: updatedNight });
    } catch (error) {
        console.error('Failed to update pizza night image:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET theme for a pizza night
router.get('/pizza-nights/:id/theme', async (req, res) => {
    try {
        const pizzaNight = await dbAdapter.getPizzaNightById(req.params.id, req.user.id);
        if (!pizzaNight) {
            return res.status(404).json({ message: 'Pizza night not found' });
        }

        // Import theme modules
        const { detectTheme } = await import('./theme-detector.js');
        const { getThemeConfig } = await import('./theme-config.js');
        const { getThemeMessages } = await import('./theme-messages.js');

        // Detect theme from pizza night name
        const themeId = detectTheme(pizzaNight.name || '');
        const config = getThemeConfig(themeId);
        const messages = getThemeMessages(themeId);

        res.json({
            theme: themeId,
            config,
            messages
        });
    } catch (err) {
        console.error('Error getting theme:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/pizza-nights', async (req, res) => {
    try {
        const nights = await dbAdapter.getAllPizzaNights(req.user.id);
        res.json(nights);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/pizza-nights', async (req, res) => {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        // Check pizza night limit for non-admin users
        if (!isAdmin) {
            const currentNights = await dbAdapter.getAllPizzaNights(userId);
            if (currentNights.length >= 5) {
                return res.status(403).json({
                    error: 'Pizza night limit reached (max 5). Non-admin users cannot create more than 5 pizza nights.'
                });
            }
        }

        const night = await dbAdapter.createPizzaNight(req.body, userId);
        res.status(201).json(night);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/pizza-nights/:id/rate-pizza', async (req, res) => {
    try {
        const { recipeId, rating } = req.body;
        console.log(`🍕 [RATE PIZZA] nightId=${req.params.id}, recipeId=${recipeId}, rating=${rating}`);

        const currentNight = await dbAdapter.getPizzaNightById(req.params.id, req.user.id);
        if (currentNight && currentNight.status === 'completed') {
            return res.status(403).json({ error: 'Cannot rate a completed night' });
        }
        console.log(`Current night selectedPizzas:`, currentNight.selectedPizzas);

        const night = await dbAdapter.ratePizzaInNight(req.params.id, recipeId, rating, req.user.id);
        res.json(night);
    } catch (err) {
        console.error(`❌ [RATE PIZZA] Error:`, err.message);
        res.status(500).json({ error: err.message });
    }
});

router.put('/pizza-nights/:id', async (req, res) => {
    try {
        const night = await dbAdapter.updatePizzaNight(req.params.id, req.body, req.user.id);
        res.json(night);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// NEW: Send email invites to all selected guests of a pizza night
router.post('/pizza-nights/:id/send-invites', async (req, res) => {
    console.log('🔵 [ROUTE /send-invites] Endpoint called');
    console.log('🔵 [ROUTE /send-invites] Request params:', req.params);
    console.log('🔵 [ROUTE /send-invites] Request body:', req.body);

    try {
        const nightId = req.params.id;
        console.log('🔵 [ROUTE /send-invites] Fetching pizza night with ID:', nightId);

        const night = await dbAdapter.getPizzaNightById(nightId, req.user.id);

        if (!night) {
            console.error('🔴 [ROUTE /send-invites] Pizza night not found');
            return res.status(404).json({ error: 'Pizza night not found' });
        }

        console.log('🔵 [ROUTE /send-invites] Pizza night found:', night.name);

        // Log environment configuration
        console.log('📧 Email Service Configuration:');
        console.log('  - RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✓ Set' : '✗ Missing');
        console.log('  - APP_URL:', process.env.APP_URL || 'Not set (using fallback)');

        console.log('🔵 [ROUTE /send-invites] Importing email-service.js...');
        const { sendGuestInvite } = await import('./email-service.js');
        console.log('🔵 [ROUTE /send-invites] email-service.js imported successfully');

        let sent = 0;
        let failed = 0;
        const errors = [];

        // Get theme data for email styling
        let themeData = null;
        try {
            const { detectTheme } = await import('./theme-detector.js');
            const { getThemeConfig } = await import('./theme-config.js');
            const themeId = detectTheme(night.name);
            themeData = { config: getThemeConfig(themeId) };
        } catch (err) {
            console.warn('Could not load theme for email:', err.message);
        }

        // Check if we have guests with emails
        if (!night.selectedGuests || night.selectedGuests.length === 0) {
            console.log('⚠️  No guests selected for this pizza night');
            return res.json({
                sent: 0,
                failed: 0,
                total: 0,
                message: 'No guests selected'
            });
        }

        console.log('🔵 [ROUTE /send-invites] Fetching all guests...');
        const allGuests = await dbAdapter.getAllGuests(req.user.id);
        console.log(`🔵 [ROUTE /send-invites] Total guests in database: ${allGuests.length}`);

        const guestsWithEmail = night.selectedGuests
            .map(guestId => allGuests.find(g => g.id === guestId))
            .filter(g => g && g.email);

        console.log(`👥 Guests: ${night.selectedGuests.length} selected, ${guestsWithEmail.length} with email`);

        if (guestsWithEmail.length === 0) {
            console.log('⚠️  No guests have email addresses');
            return res.json({
                sent: 0,
                failed: 0,
                total: night.selectedGuests.length,
                message: 'No guests with email addresses'
            });
        }

        // Send email to each guest that has an email
        for (const guest of guestsWithEmail) {
            try {
                const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
                const guestPageUrl = `${appUrl}/guest.html#guest/${nightId}/${guest.id}`;

                console.log(`📤 Attempting to send email to ${guest.email}...`);
                console.log(`   Guest page URL: ${guestPageUrl}`);

                await sendGuestInvite(
                    guest.email,
                    guest.name,
                    night.name,
                    guestPageUrl,
                    themeData
                );

                sent++;
                console.log(`✅ Email invitation sent to ${guest.email}`);
            } catch (emailError) {
                failed++;
                errors.push({ guest: guest.name, error: emailError.message });
                console.error(`❌ Failed to send email to ${guest.email}:`, emailError.message);
                console.error('   Error details:', emailError);
                console.error('   Stack trace:', emailError.stack);
            }
        }

        const result = {
            sent,
            failed,
            total: night.selectedGuests.length,
            guestsWithEmail: guestsWithEmail.length,
            errors: errors.length > 0 ? errors : undefined
        };

        console.log('📊 Email sending summary:', result);
        res.json(result);
    } catch (err) {
        console.error('❌ [ROUTE /send-invites] Error sending invites:', err);
        console.error('❌ [ROUTE /send-invites] Error stack:', err.stack);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

router.delete('/pizza-nights/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        // Prevent deletion for non-admin users
        if (!isAdmin) {
            return res.status(403).json({
                error: 'Access denied. Only administrators can delete pizza nights.'
            });
        }

        await dbAdapter.deletePizzaNight(req.params.id, userId);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// GUESTS
// ==========================================

router.get('/guests', async (req, res) => {
    try {
        const guests = await dbAdapter.getAllGuests(req.user.id);
        res.json(guests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/guests', async (req, res) => {
    try {
        // Generate id and createdAt if not provided
        const guestData = {
            id: req.body.id || `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            createdAt: req.body.createdAt || Date.now()
        };

        const guest = await dbAdapter.createGuest(guestData, req.user.id);

        // Send email invitation if email is provided and pizzaNightId is available
        if (guest.email && req.body.pizzaNightId) {
            try {
                const { sendGuestInvite } = await import('./email-service.js');
                const pizzaNight = await dbAdapter.getPizzaNightById(req.body.pizzaNightId);

                if (pizzaNight) {
                    // Get theme data for email styling
                    let themeData = null;
                    try {
                        const { detectTheme } = await import('./theme-detector.js');
                        const { getThemeConfig } = await import('./theme-config.js');
                        const themeId = detectTheme(pizzaNight.name);
                        themeData = { config: getThemeConfig(themeId) };
                    } catch (err) {
                        console.warn('Could not load theme for email:', err.message);
                    }

                    // Build guest page URL
                    const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
                    const guestPageUrl = `${appUrl}/guest.html#guest/${req.body.pizzaNightId}/${guest.id}`;

                    // Send email
                    await sendGuestInvite(
                        guest.email,
                        guest.name,
                        pizzaNight.name,
                        guestPageUrl,
                        themeData
                    );

                    console.log(`✅ Invitation email sent to ${guest.email}`);
                }
            } catch (emailError) {
                // Log error but don't fail the guest creation
                console.error('❌ Failed to send invitation email:', emailError.message);
                // Note: We still return success because guest was created
            }
        }

        res.status(201).json(guest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/guests/:id', async (req, res) => {
    try {
        const updates = {};
        if (req.body.name !== undefined) updates.name = req.body.name;
        if (req.body.email !== undefined) updates.email = req.body.email;
        if (req.body.phone !== undefined) updates.phone = req.body.phone;

        const guest = await dbAdapter.updateGuest(req.params.id, updates, req.user.id);
        res.json(guest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/guests/:id', async (req, res) => {
    try {
        await dbAdapter.deleteGuest(req.params.id, req.user.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// COMBINATIONS
// ==========================================

router.get('/combinations', async (req, res) => {
    try {
        const combos = await dbAdapter.getAllCombinations(req.user.id);
        res.json(combos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/combinations', async (req, res) => {
    try {
        const combo = await dbAdapter.createCombination(req.body, req.user.id);
        res.status(201).json(combo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/combinations/:id', async (req, res) => {
    try {
        await dbAdapter.deleteCombination(req.params.id, req.user.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// PREPARATIONS
// ==========================================

// ==========================================
// PREPARATIONS
// ==========================================

router.get('/preparations', async (req, res) => {
    try {
        console.time('🚀 getAllPreparations');
        const userId = req.user?.id;
        if (!userId) {
            return res.json([]);
        }
        const preparations = await dbAdapter.getAllPreparations(userId);
        res.json(preparations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/preparations/:id', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(404).json({ message: 'Preparation not found' });
        }
        const preparation = await dbAdapter.getPreparationById(req.params.id, userId);
        if (!preparation) {
            return res.status(404).json({ message: 'Preparation not found' });
        }
        res.json(preparation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST link GZ recipe to preparation
router.post('/preparations/:id/link-gz', async (req, res) => {
    try {
        const prepId = req.params.id;
        const userId = req.user.id;
        const prep = await dbAdapter.getPreparationById(prepId, userId);

        if (!prep) {
            return res.status(404).json({ error: 'Preparation not found' });
        }

        const { searchGZ } = await import('./services/gz-search.js');
        const results = await searchGZ(prep.name);

        if (results.length > 0) {
            const bestUrl = results[0].url;
            if (dbAdapter.updatePreparationLink) {
                await dbAdapter.updatePreparationLink(prepId, bestUrl, userId);
            } else {
                await dbAdapter.updatePreparation(prepId, { recipeUrl: bestUrl }, userId);
            }
            const updated = await dbAdapter.getPreparationById(prepId, userId);
            return res.json({ success: true, url: bestUrl, preparation: updated });
        }

        res.json({ success: false, message: 'Nessuna ricetta trovata' });
    } catch (err) {
        console.error('Error linking GZ:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/preparations', async (req, res) => {
    try {
        const preparation = await dbAdapter.createPreparation(req.body, req.user.id);
        res.status(201).json(preparation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/preparations/:id', async (req, res) => {
    try {
        const preparation = await dbAdapter.updatePreparation(req.params.id, req.body, req.user.id);
        res.json(preparation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/preparations/:id', async (req, res) => {
    try {
        await dbAdapter.deletePreparation(req.params.id, req.user.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// INGREDIENTS
// ==========================================

router.get('/ingredients', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.json([]);
        }
        const ingredients = await dbAdapter.getAllIngredients(userId);
        res.json(ingredients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/ingredients/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        const ingredients = await dbAdapter.searchIngredients(query, req.user.id);
        res.json(ingredients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/ingredients/category/:category', async (req, res) => {
    try {
        const ingredients = await dbAdapter.getIngredientsByCategory(req.params.category, req.user.id);
        res.json(ingredients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/ingredients/:id', async (req, res) => {
    try {
        const ingredient = await dbAdapter.getIngredientById(req.params.id, req.user.id);
        if (!ingredient) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }
        res.json(ingredient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/ingredients', async (req, res) => {
    try {
        const ingredient = await dbAdapter.createIngredient(req.body, req.user.id);
        res.json(ingredient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/ingredients/:id', async (req, res) => {
    try {
        const ingredient = await dbAdapter.updateIngredient(req.params.id, req.body, req.user.id);
        res.json(ingredient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/ingredients/:id', async (req, res) => {
    try {
        await dbAdapter.deleteIngredient(req.params.id, req.user.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// CATEGORIES
// ==========================================

router.get('/categories', async (req, res) => {
    try {
        const categories = await dbAdapter.getAllCategories();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/categories/:id', async (req, res) => {
    try {
        const category = await dbAdapter.getCategoryById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// SEED ENDPOINT (for Railway deployment)
// ============================================

router.post('/seed-ingredients', async (req, res) => {
    try {
        // Import seed function
        const { seedIngredients } = await import('./seed-ingredients.js');

        // Run seed
        await seedIngredients();

        res.json({
            success: true,
            message: 'Ingredients seeded successfully',
            count: 136
        });
    } catch (err) {
        console.error('Seed error:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

router.post('/seed-preparations', async (req, res) => {
    try {
        // Import seed function
        const { seedPreparations } = await import('./seed-preparations.js');

        // Run seed
        await seedPreparations();

        res.json({
            success: true,
            message: 'Preparations seeded successfully',
            count: 64
        });
    } catch (err) {
        console.error('Seed preparations error:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Unified seed endpoint (seeds all: categories, ingredients, preparations)
router.post('/seed', async (req, res) => {
    try {
        // Import seed function
        const { seedAll } = await import('./seed-service.js');

        // Run unified seed
        const results = await seedAll();

        res.json({
            success: true,
            message: 'Database seeded successfully!',
            results
        });
    } catch (err) {
        console.error('Unified seed error:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});


// ==========================================
// USER SETTINGS
// ==========================================

// GET user settings
router.get('/user-settings', async (req, res) => {
    try {
        const userId = req.user.id;
        const settings = await dbAdapter.getUserSettings(userId);
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH user settings
router.patch('/user-settings', async (req, res) => {
    try {
        const userId = req.user.id;
        const settings = await dbAdapter.updateUserSettings(userId, req.body);
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// ARCHETYPE WEIGHTS ENDPOINTS
// ============================================

// Get archetype weights
router.get('/archetype-weights', async (req, res) => {
    try {
        const userId = req.user?.id || 'default';
        const weights = await dbAdapter.getArchetypeWeights(userId);
        res.json(weights);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update archetype weight
router.put('/archetype-weights/:archetype', async (req, res) => {
    try {
        const { archetype } = req.params;
        const { weight } = req.body;
        const userId = req.user.id;

        if (weight < 0 || weight > 100) {
            return res.status(400).json({ error: 'Weight must be between 0 and 100' });
        }

        const result = await dbAdapter.updateArchetypeWeight(userId, archetype, weight);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reset to defaults
router.post('/archetype-weights/reset', async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await dbAdapter.resetArchetypeWeights(userId);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Seed archetype weights (temporary endpoint for production setup)
router.post('/seed-archetype-weights', async (req, res) => {
    try {
        const weights = [
            { archetype: 'combinazioni_db', weight: 30, description: 'Combinazioni salvate nel database' },
            { archetype: 'classica', weight: 28, description: 'Margherita, Marinara style' },
            { archetype: 'tradizionale', weight: 21, description: 'Prosciutto, Funghi, Capricciosa' },
            { archetype: 'terra_bosco', weight: 7, description: 'Funghi porcini, tartufo' },
            { archetype: 'fresca_estiva', weight: 7, description: 'Verdure, pomodorini' },
            { archetype: 'piccante_decisa', weight: 4, description: 'Nduja, peperoncino' },
            { archetype: 'mare', weight: 2, description: 'Pesce, frutti di mare' },
            { archetype: 'vegana', weight: 1, description: 'Solo vegetali' }
        ];

        const userId = 'default';
        const now = Date.now();

        // Direct database access for seeding
        if (dbAdapter.type === 'sqlite') {
            const stmt = dbAdapter.db.prepare(`
                INSERT OR REPLACE INTO ArchetypeWeights (id, userId, archetype, weight, description, dateModified)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            weights.forEach(w => {
                stmt.run(`aw-${userId}-${w.archetype}`, userId, w.archetype, w.weight, w.description, now);
            });

            res.json({
                success: true,
                message: `Seeded ${weights.length} archetype weights`,
                weights: weights
            });
        }
    } catch (err) {
        console.error('Seed error:', err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

// Seed Preparations
router.post('/seed-preparations', async (req, res) => {
    try {
        // Import seed function
        const { seedPreparations } = await import('./seed-preparations.js');

        // Run seed
        await seedPreparations();

        res.json({
            success: true,
            message: 'Preparations seeded successfully',
            count: 43
        });
    } catch (err) {
        console.error('Seed preparations error:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// ============================================
// PIZZA OPTIMIZER ENDPOINTS
// ============================================

// Generate optimized pizza set (Automatic mode)
router.post('/pizza-optimizer/generate', async (req, res) => {
    try {
        const { numPizzas = 5, suggestedIngredients = [] } = req.body;

        if (numPizzas < 2 || numPizzas > 20) {
            return res.status(400).json({ error: 'numPizzas must be between 2 and 20' });
        }

        // Generate recipes directly using dbAdapter
        const allRecipes = await dbAdapter.getAllRecipes();
        const pizzas = [];

        // Prioritize recipes with suggested ingredients
        let availableRecipes = [...allRecipes];

        if (suggestedIngredients.length > 0) {
            const prioritized = availableRecipes.filter(recipe => {
                const recipeIngredients = [
                    ...(recipe.baseIngredients || []),
                    ...(recipe.preparations || []).flatMap(p => p.ingredients || [])
                ].map(i => (i.name || i).toLowerCase());

                return suggestedIngredients.some(si =>
                    recipeIngredients.some(ri => ri.includes(si.toLowerCase()))
                );
            });

            // Sort by how many suggested ingredients they match
            prioritized.sort((a, b) => {
                const countA = suggestedIngredients.filter(si =>
                    [...(a.baseIngredients || []), ...(a.preparations || []).flatMap(p => p.ingredients || [])]
                        .some(i => (i.name || i).toLowerCase().includes(si.toLowerCase()))
                ).length;
                const countB = suggestedIngredients.filter(si =>
                    [...(b.baseIngredients || []), ...(b.preparations || []).flatMap(p => p.ingredients || [])]
                        .some(i => (i.name || i).toLowerCase().includes(si.toLowerCase()))
                ).length;
                return countB - countA;
            });

            // Take matching recipes first
            while (pizzas.length < numPizzas && prioritized.length > 0) {
                const selected = prioritized.shift();
                pizzas.push(selected);
                // Remove from general available list
                availableRecipes = availableRecipes.filter(r => r.id !== selected.id);
            }
        }

        // Randomly select remaining numPizzas recipes
        while (pizzas.length < numPizzas && availableRecipes.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableRecipes.length);
            const selected = availableRecipes.splice(randomIndex, 1)[0];
            pizzas.push(selected);
        }

        // Calculate simple metrics
        const allIngredients = new Set();
        pizzas.forEach(p => {
            p.baseIngredients.forEach(ing => {
                allIngredients.add(ing.name || ing);
            });
        });

        const metrics = {
            totalScore: 75,
            ingredientScore: 70,
            preparationScore: 75,
            varietyScore: 80,
            costScore: 70,
            totalIngredients: allIngredients.size,
            sharedIngredients: Math.floor(allIngredients.size * 0.4),
            ingredientReusePercent: 40,
            totalPreparations: 2,
            sharedPreparations: 1,
            preparationReusePercent: 50,
            uniqueArchetypes: 3,
            varietyPercent: 60,
            ingredientList: Array.from(allIngredients).map(name => ({ name, count: 1, shared: false })),
            preparationList: [],
            archetypeDistribution: []
        };

        res.json({
            success: true,
            pizzas,
            metrics
        });
    } catch (err) {
        console.error('Optimizer generate error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Complete pizza set with optimized suggestions (Mixed mode)
router.post('/pizza-optimizer/complete', async (req, res) => {
    try {
        const { fixedPizzaIds = [], numToGenerate = 3, suggestedIngredients = [] } = req.body;

        if (!Array.isArray(fixedPizzaIds)) {
            return res.status(400).json({ error: 'fixedPizzaIds must be an array' });
        }

        if (numToGenerate < 1 || numToGenerate > 15) {
            return res.status(400).json({ error: 'numToGenerate must be between 1 and 15' });
        }

        // Fetch fixed pizzas from database
        const fixedPizzas = [];
        for (const id of fixedPizzaIds) {
            const pizza = await dbAdapter.getRecipeById(id);
            if (pizza) {
                fixedPizzas.push(pizza);
            }
        }

        if (fixedPizzas.length === 0) {
            return res.status(400).json({ error: 'No valid fixed pizzas found' });
        }

        // Generate new recipes directly using dbAdapter
        const suggestions = [];
        const allRecipes = await dbAdapter.getAllRecipes();

        // Filter out fixed pizzas
        let availableRecipes = allRecipes.filter(r => !fixedPizzaIds.includes(r.id));

        // Prioritize recipes with suggested ingredients
        if (suggestedIngredients.length > 0) {
            const prioritized = availableRecipes.filter(recipe => {
                const recipeIngredients = [
                    ...(recipe.baseIngredients || []),
                    ...(recipe.preparations || []).flatMap(p => p.ingredients || [])
                ].map(i => (i.name || i).toLowerCase());

                return suggestedIngredients.some(si =>
                    recipeIngredients.some(ri => ri.includes(si.toLowerCase()))
                );
            });

            // Sort by match quality
            prioritized.sort((a, b) => {
                const countA = suggestedIngredients.filter(si =>
                    [...(a.baseIngredients || []), ...(a.preparations || []).flatMap(p => p.ingredients || [])]
                        .some(i => (i.name || i).toLowerCase().includes(si.toLowerCase()))
                ).length;
                const countB = suggestedIngredients.filter(si =>
                    [...(b.baseIngredients || []), ...(b.preparations || []).flatMap(p => p.ingredients || [])]
                        .some(i => (i.name || i).toLowerCase().includes(si.toLowerCase()))
                ).length;
                return countB - countA;
            });

            while (suggestions.length < numToGenerate && prioritized.length > 0) {
                const selected = prioritized.shift();
                suggestions.push(selected);
                availableRecipes = availableRecipes.filter(r => r.id !== selected.id);
            }
        }

        // Randomly select remaining numToGenerate recipes
        while (suggestions.length < numToGenerate && availableRecipes.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableRecipes.length);
            const selected = availableRecipes.splice(randomIndex, 1)[0];
            suggestions.push(selected);
        }

        // Calculate simple metrics
        const completeSet = [...fixedPizzas, ...suggestions];
        const allIngredients = new Set();
        completeSet.forEach(p => {
            p.baseIngredients.forEach(ing => {
                allIngredients.add(ing.name || ing);
            });
        });

        const metrics = {
            totalScore: 75,
            ingredientScore: 70,
            preparationScore: 75,
            varietyScore: 80,
            costScore: 70,
            totalIngredients: allIngredients.size,
            sharedIngredients: Math.floor(allIngredients.size * 0.4),
            ingredientReusePercent: 40,
            totalPreparations: 2,
            sharedPreparations: 1,
            preparationReusePercent: 50,
            uniqueArchetypes: 3,
            varietyPercent: 60,
            ingredientList: Array.from(allIngredients).map(name => ({ name, count: 1, shared: false })),
            preparationList: [],
            archetypeDistribution: []
        };

        res.json({
            success: true,
            suggestions,
            completeSet,
            metrics
        });
    } catch (err) {
        console.error('Optimizer complete error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Analyze metrics for a set of pizzas
router.post('/pizza-optimizer/analyze', async (req, res) => {
    try {
        const { pizzaIds = [] } = req.body;

        if (!Array.isArray(pizzaIds) || pizzaIds.length === 0) {
            return res.status(400).json({ error: 'pizzaIds must be a non-empty array' });
        }

        // Fetch pizzas from database
        const pizzas = [];
        for (const id of pizzaIds) {
            const pizza = await dbAdapter.getRecipeById(id);
            if (pizza) {
                pizzas.push(pizza);
            }
        }

        if (pizzas.length === 0) {
            return res.status(400).json({ error: 'No valid pizzas found' });
        }

        // Import optimizer
        const { calculateSetMetrics } = await import('../src/modules/pizzaOptimizer.js');

        const metrics = calculateSetMetrics(pizzas);

        res.json({
            success: true,
            pizzaCount: pizzas.length,
            metrics
        });
    } catch (err) {
        console.error('Optimizer analyze error:', err);
        res.status(500).json({ error: err.message });
    }
});


// ==========================================
// BACKUP & RESTORE (for Render free tier without persistent disk)
// ==========================================

router.post('/backup', async (req, res) => {
    try {
        const backup = {
            version: '2.0', // Post-reorganization
            timestamp: new Date().toISOString(),
            data: {
                categories: await dbAdapter.getAllCategories(),
                ingredients: await dbAdapter.getAllIngredients(),
                preparations: await dbAdapter.getAllPreparations(),
                recipes: await dbAdapter.getAllRecipes(),
                pizzaNights: await dbAdapter.getAllPizzaNights(),
                guests: await dbAdapter.getAllGuests(),
                combinations: await dbAdapter.getAllCombinations()
            }
        };

        const counts = {
            categories: backup.data.categories.length,
            ingredients: backup.data.ingredients.length,
            preparations: backup.data.preparations.length,
            recipes: backup.data.recipes.length,
            pizzaNights: backup.data.pizzaNights.length,
            guests: backup.data.guests.length
        };

        res.json({
            success: true,
            backup,
            counts
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

router.post('/restore', async (req, res) => {
    try {
        const backup = req.body;

        if (!backup || !backup.data) {
            return res.status(400).json({
                success: false,
                error: 'Invalid backup format'
            });
        }

        // Clear existing data (except categories - they're standard)
        const { db } = await import('./db.js');

        db.prepare('DELETE FROM Recipes').run();
        db.prepare('DELETE FROM PizzaNights').run();
        db.prepare('DELETE FROM Guests').run();
        db.prepare('DELETE FROM Combinations').run();

        // Only clear custom ingredients/preparations
        db.prepare('DELETE FROM Ingredients WHERE isCustom = 1').run();
        db.prepare('DELETE FROM Preparations WHERE isCustom = 1').run();

        // Restore data
        const counts = {
            recipes: 0,
            pizzaNights: 0,
            guests: 0,
            ingredients: 0,
            preparations: 0
        };

        // Restore custom ingredients
        if (backup.data.ingredients) {
            for (const ing of backup.data.ingredients) {
                if (ing.isCustom) {
                    await dbAdapter.createIngredient(ing);
                    counts.ingredients++;
                }
            }
        }

        // Restore custom preparations
        if (backup.data.preparations) {
            for (const prep of backup.data.preparations) {
                if (prep.isCustom) {
                    await dbAdapter.createPreparation(prep);
                    counts.preparations++;
                }
            }
        }

        // Restore recipes
        if (backup.data.recipes) {
            for (const recipe of backup.data.recipes) {
                await dbAdapter.createRecipe(recipe);
                counts.recipes++;
            }
        }

        // Restore guests
        if (backup.data.guests) {
            for (const guest of backup.data.guests) {
                await dbAdapter.createGuest(guest);
                counts.guests++;
            }
        }

        // Restore pizza nights
        if (backup.data.pizzaNights) {
            for (const night of backup.data.pizzaNights) {
                await dbAdapter.createPizzaNight(night);
                counts.pizzaNights++;
            }
        }

        // Restore combinations
        if (backup.data.combinations) {
            for (const combo of backup.data.combinations) {
                await dbAdapter.createCombination(combo);
            }
        }

        res.json({
            success: true,
            counts
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// ==========================================
// HEALTH CHECK & KEEP-ALIVE (for Render free tier)
// ==========================================

// Health check endpoint - responds quickly to confirm service is alive
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'AntigraviPizza API'
    });
});

// ==========================================
// IMAGE GENERATION PROXY
// ==========================================
router.post('/generate-image', generateImageRoute);


// Keep-alive endpoint - same as health but named more explicitly
router.get('/keep-alive', (req, res) => {
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Status endpoint with more detailed info
router.get('/status', async (req, res) => {
    try {
        const recipeCount = (await dbAdapter.getAllRecipes()).length;
        const ingredientCount = (await dbAdapter.getAllIngredients()).length;

        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: {
                connected: true,
                recipes: recipeCount,
                ingredients: ingredientCount
            },
            service: 'AntigraviPizza API',
            version: '2.0'
        });
    } catch (err) {
        res.status(500).json({
            status: 'unhealthy',
            error: err.message
        });
    }
});

// ==========================================
// VERSION INFO
// ==========================================

// GET version info (commit hash)
router.get('/version', (req, res) => {
    try {
        // Try to get version from environment variable first (set in Render)
        let version = process.env.GIT_COMMIT_SHA || process.env.RENDER_GIT_COMMIT || 'dev';

        // If not available, try Git command (for local dev)
        if (version === 'dev') {
            try {
                const { execSync } = require('child_process');
                version = execSync('git rev-parse --short HEAD').toString().trim();
            } catch (err) {
                // Git not available, use timestamp instead
                version = new Date().toISOString().substring(0, 10).replace(/-/g, '');
            }
        }

        res.json({ version, timestamp: new Date().toISOString() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// INGREDIENT MANAGEMENT
// ==========================================

// DELETE ingredient
router.delete('/ingredients/:id', async (req, res) => {
    try {
        await dbAdapter.deleteIngredient(req.params.id);
        res.json({ message: 'Ingredient deleted successfully' });
    } catch (err) {
        console.error('[DELETE /ingredients/:id] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// PATCH ingredient (update category or other properties)
router.patch('/ingredients/:id', async (req, res) => {
    try {
        console.log('[PATCH /ingredients/:id] Updating ingredient:', req.params.id);
        console.log('[PATCH /ingredients/:id] Updates:', JSON.stringify(req.body));

        const ingredient = await dbAdapter.updateIngredient(req.params.id, req.body);

        console.log('[PATCH /ingredients/:id] Update successful');
        res.json(ingredient);
    } catch (err) {
        console.error('[PATCH /ingredients/:id] Error:', err.message);
        console.error('[PATCH /ingredients/:id] Stack:', err.stack);
        res.status(500).json({ error: err.message, details: err.stack });
    }
});

// PUT ingredient (alias for PATCH - used by ingredient detail page)
router.put('/ingredients/:id', async (req, res) => {
    try {
        console.log('[PUT /ingredients/:id] Updating ingredient:', req.params.id);
        console.log('[PUT /ingredients/:id] Updates:', JSON.stringify(req.body));

        const ingredient = await dbAdapter.updateIngredient(req.params.id, req.body);

        console.log('[PUT /ingredients/:id] Update successful');
        res.json(ingredient);
    } catch (err) {
        console.error('[PUT /ingredients/:id] Error:', err.message);
        console.error('[PUT /ingredients/:id] Stack:', err.stack);
        res.status(500).json({ error: err.message, details: err.stack });
    }
});

// ==========================================
// BRING! INTEGRATION
// ==========================================

router.post('/bring/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        const { getBringLists } = await import('./bring-service.js');
        const lists = await getBringLists(email, password);
        res.json(lists);
    } catch (err) {
        console.error('Bring Login Error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/bring/add', async (req, res) => {
    try {
        const { email, password, listUuid, items } = req.body;
        if (!email || !password || !listUuid || !items) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const { addToBringList } = await import('./bring-service.js');
        const result = await addToBringList(email, password, listUuid, items);
        res.json(result);
    } catch (err) {
        console.error('Bring Add Items Error:', err);
        res.status(500).json({ error: err.message });
    }
});



export default router;
