// ============================================

import { getUserSettings } from '../modules/database.js';

/**
 * Provider configuration
 * Priority order: Segmind > DeepAI > AI Horde > Pollinations
 */
const PROVIDERS = {
    GEMINI: 'gemini',           // Google Gemini - 50 free images/day
    AI_HORDE: 'ai_horde',        // Community-powered - free but slow
    SEGMIND: 'segmind',          // Not free anymore
    DEEPAI: 'deepai',            // Not free
    POLLINATIONS: 'pollinations'  // Not free anymore
};

const PROVIDER_CONFIG = {
    timeout: 60000, // 60 seconds for Pollinations
    maxRetries: 3,
    retryDelay: 2000 // 2 seconds between retries
};

/**
 * Provider status tracking
 */
const providerStatus = {
    [PROVIDERS.GEMINI]: { available: true, lastError: null, failCount: 0 },
    [PROVIDERS.AI_HORDE]: { available: true, lastError: null, failCount: 0 },
    [PROVIDERS.SEGMIND]: { available: true, lastError: null, failCount: 0 },
    [PROVIDERS.DEEPAI]: { available: true, lastError: null, failCount: 0 },
    [PROVIDERS.POLLINATIONS]: { available: true, lastError: null, failCount: 0 }
};

/**
 * Sleep utility for retry delays
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate image using Google Gemini API (50 free images/day)
 */
async function generateWithGemini(prompt, options = {}) {
    // Get API key from options or localStorage (fallback)
    const apiKey = options.geminiApiKey || localStorage.getItem('geminiApiKey');
    if (!apiKey) {
        throw new Error('Google Gemini API key not configured. Please add it in Settings.');
    }

    // Using Gemini 2.5 Flash Image: 100 free images/day, 2-5 requests/min
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'x-goog-api-key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                responseModalities: ["IMAGE"]  // Required for image generation
            }
        }),
        signal: AbortSignal.timeout(PROVIDER_CONFIG.timeout)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Extract base64 image from response
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        const imagePart = data.candidates[0].content.parts.find(part => part.inlineData);
        if (imagePart && imagePart.inlineData) {
            const mimeType = imagePart.inlineData.mimeType || 'image/png';
            const base64Data = imagePart.inlineData.data;
            return `data:${mimeType};base64,${base64Data}`;
        }
    }

    throw new Error('No image data in Gemini response');
}

/**
 * Generate image using Segmind API (100 free calls/day)
 */
async function generateWithSegmind(prompt, options = {}) {
    const seed = options.seed || Date.now();
    const apiUrl = 'https://api.segmind.com/v1/fast-flux-schnell';

    // Get API key from options or localStorage (fallback)
    const apiKey = options.segmindApiKey || localStorage.getItem('segmindApiKey');
    if (!apiKey) {
        throw new Error('Segmind API key not configured. Please add it in Settings.');
    }

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey  // Segmind requires x-api-key header
        },
        body: JSON.stringify({
            prompt,
            steps: 4,  // Fast model uses fewer steps
            seed,
            aspect_ratio: '4:3',  // Good for food photos
            base64: false  // Get URL instead of base64
        }),
        signal: AbortSignal.timeout(PROVIDER_CONFIG.timeout)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Segmind API error: ${response.status} - ${errorText}`);
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Generate image using DeepAI (500 free calls/month)
 */
async function generateWithDeepAI(prompt, options = {}) {
    const apiUrl = 'https://api.deepai.org/api/text2img';

    const formData = new FormData();
    formData.append('text', prompt);
    formData.append('grid_size', '1');

    const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(PROVIDER_CONFIG.timeout)
    });

    if (!response.ok) {
        throw new Error(`DeepAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.output_url; // Returns direct URL
}

/**
 * Generate image using AI Horde (free, community-powered)
 * No API key required
 */
async function generateWithAIHorde(prompt, options = {}) {
    const seed = options.seed || Date.now();

    // Step 1: Submit generation request
    const submitResponse = await fetch('https://stablehorde.net/api/v2/generate/async', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': '0000000000' // Anonymous key
        },
        body: JSON.stringify({
            prompt: prompt,
            params: {
                cfg_scale: 7.5,
                denoising_strength: 1.0,
                seed: seed.toString(),
                height: 576,  // Must be multiple of 64 for AI Horde
                width: 768,   // Must be multiple of 64 for AI Horde
                steps: 30,
                n: 1
            },
            nsfw: false,
            trusted_workers: false,
            models: ['stable_diffusion']
        }),
        signal: AbortSignal.timeout(PROVIDER_CONFIG.timeout)
    });

    if (!submitResponse.ok) {
        throw new Error(`AI Horde submit failed: ${submitResponse.status}`);
    }

    const submitData = await submitResponse.json();
    const requestId = submitData.id;

    // Step 2: Poll for completion (max 90 seconds for community queue)
    const maxPolls = 90;  // Increased timeout for community-powered generation
    const pollInterval = 1000; // 1 second

    for (let i = 0; i < maxPolls; i++) {
        await sleep(pollInterval);

        const checkResponse = await fetch(`https://stablehorde.net/api/v2/generate/check/${requestId}`, {
            signal: AbortSignal.timeout(5000)
        });

        if (!checkResponse.ok) continue;

        const checkData = await checkResponse.json();

        if (checkData.done) {
            // Get the final result
            const statusResponse = await fetch(`https://stablehorde.net/api/v2/generate/status/${requestId}`, {
                signal: AbortSignal.timeout(5000)
            });

            if (!statusResponse.ok) {
                throw new Error('AI Horde status check failed');
            }

            const statusData = await statusResponse.json();

            if (statusData.generations && statusData.generations.length > 0) {
                // Return the image URL directly (AI Horde provides a temporary URL)
                return statusData.generations[0].img;
            }
        }
    }

    throw new Error('AI Horde generation timeout');
}

/**
 * Generate image using Pollinations.ai
 * Current provider, used as fallback
 */
async function generateWithPollinations(prompt, options = {}) {
    const seed = options.seed || Date.now();
    const encodedPrompt = encodeURIComponent(prompt);

    // Use turbo model since flux is down
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=turbo&width=800&height=600&nologo=true&seed=${seed}`;

    // Verify the image content is not a rate-limit placeholder
    const response = await fetch(imageUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
        throw new Error(`Pollinations image not accessible: ${response.status}`);
    }

    const blob = await response.blob();

    // Check for the "RATE LIMITS" placeholder signature (identified as 1,396,239 bytes)
    const PLATEHOLDER_SIZE = 1396239;
    if (blob.size === PLATEHOLDER_SIZE) {
        throw new Error('Pollinations rate limit reached (returned placeholder image)');
    }

    // Convert to Data URL to persist the actual image and avoid reloading issues
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Mark provider as failed and update status
 */
function markProviderFailed(provider, error) {
    providerStatus[provider].failCount++;
    providerStatus[provider].lastError = error.message;

    // Temporarily disable provider after 3 consecutive failures
    if (providerStatus[provider].failCount >= 3) {
        providerStatus[provider].available = false;
        console.warn(`âš ï¸ Provider ${provider} temporarily disabled after ${providerStatus[provider].failCount} failures`);

        // Re-enable after 5 minutes
        setTimeout(() => {
            providerStatus[provider].available = true;
            providerStatus[provider].failCount = 0;
            console.info(`âœ… Provider ${provider} re-enabled`);
        }, 5 * 60 * 1000);
    }
}

/**
 * Mark provider as successful
 */
function markProviderSuccess(provider) {
    providerStatus[provider].failCount = 0;
    providerStatus[provider].lastError = null;
}

/**
 * Try to generate image with a specific provider
 */
async function tryProvider(provider, prompt, options) {
    console.log(`ðŸŽ¨ Attempting image generation with ${provider}...`);

    try {
        let imageUrl;

        switch (provider) {
            case PROVIDERS.GEMINI:
                imageUrl = await generateWithGemini(prompt, options);
                break;
            case PROVIDERS.AI_HORDE:
                imageUrl = await generateWithAIHorde(prompt, options);
                break;
            case PROVIDERS.SEGMIND:
                imageUrl = await generateWithSegmind(prompt, options);
                break;
            case PROVIDERS.DEEPAI:
                imageUrl = await generateWithDeepAI(prompt, options);
                break;
            case PROVIDERS.POLLINATIONS:
                imageUrl = await generateWithPollinations(prompt, options);
                break;
            default:
                throw new Error(`Unknown provider: ${provider}`);
        }

        markProviderSuccess(provider);
        console.log(`âœ… Successfully generated image with ${provider}`);
        return { imageUrl, provider };

    } catch (error) {
        console.error(`âŒ ${provider} failed:`, error.message);
        markProviderFailed(provider, error);
        throw error;
    }
}

/**
 * Generate pizza image with automatic provider fallback
 * @param {string} pizzaName - Name of the pizza
 * @param {string[]} ingredients - Array of main ingredient names
 * @param {Object} options - Generation options
 * @param {string} options.huggingfaceToken - Optional Hugging Face API token
 * @param {number} options.seed - Random seed for reproducibility
 * @param {boolean} options.hasTomato - Whether pizza has tomato base
 * @returns {Promise<{imageUrl: string, provider: string}>}
 */
export async function generatePizzaImage(pizzaName, ingredients = [], options = {}) {
    // Fetch user settings to get API keys
    try {
        const settings = await getUserSettings();
        if (settings) {
            options.geminiApiKey = settings.geminiApiKey || options.geminiApiKey;
            options.segmindApiKey = settings.segmindApiKey || options.segmindApiKey;
        }
    } catch (err) {
        console.warn('Failed to fetch user settings for image generation, falling back to localStorage if available:', err);
    }

    // Build the prompt
    const pizzaStyle = options.hasTomato
        ? 'pizza with red tomato sauce base'
        : 'pizza bianca, white pizza with NO tomato sauce, white base with olive oil';

    const ingredientList = ingredients.length > 0
        ? ingredients.join(', ')
        : 'gourmet toppings';

    const prompt = `gourmet ${pizzaStyle}, ${pizzaName}, toppings: ${ingredientList}, professional food photography, 4k, highly detailed, italian style, rustic background`;

    console.log(`ðŸ• Generating image for: ${pizzaName}`);
    console.log(`ðŸ“ Prompt: ${prompt}`);

    // Define provider priority order
    // Using Google Gemini (50 free images/day) + AI Horde (free but slower)
    const providerOrder = [
        PROVIDERS.GEMINI,       // Primary - 50 free images/day (fast & high quality)
        PROVIDERS.AI_HORDE      // Backup - unlimited free (slower, community-powered)
    ];

    const errors = [];

    // Try each provider in order
    for (const provider of providerOrder) {
        // Skip if provider is temporarily disabled
        if (!providerStatus[provider].available) {
            console.log(`â­ï¸ Skipping ${provider} (temporarily disabled)`);
            continue;
        }

        // Retry logic for each provider
        for (let attempt = 1; attempt <= PROVIDER_CONFIG.maxRetries; attempt++) {
            try {
                const result = await tryProvider(provider, prompt, options);
                return result;
            } catch (error) {
                errors.push({ provider, attempt, error: error.message });

                if (attempt < PROVIDER_CONFIG.maxRetries) {
                    const delay = PROVIDER_CONFIG.retryDelay * attempt;
                    console.log(`â³ Retrying ${provider} in ${delay}ms (attempt ${attempt + 1}/${PROVIDER_CONFIG.maxRetries})...`);
                    await sleep(delay);
                } else {
                    console.log(`âŒ ${provider} failed after ${PROVIDER_CONFIG.maxRetries} attempts`);
                }
            }
        }
    }

    // All providers failed
    console.error('âŒ All image providers failed:', errors);
    throw new Error(
        `Failed to generate image after trying all providers.\n` +
        `Errors: ${errors.map(e => `${e.provider} (attempt ${e.attempt}): ${e.error}`).join('; ')}`
    );
}

/**
 * Get current provider status
 */
export function getProviderStatus() {
    return { ...providerStatus };
}

/**
 * Reset provider status (for testing/debugging)
 */
export function resetProviderStatus() {
    Object.keys(providerStatus).forEach(provider => {
        providerStatus[provider].available = true;
        providerStatus[provider].failCount = 0;
        providerStatus[provider].lastError = null;
    });
}

/**
 * Test a specific provider
 */
export async function testProvider(provider, options = {}) {
    const testPrompt = 'A delicious gourmet pizza margherita with fresh mozzarella and basil, professional food photography, 4k, highly detailed';

    try {
        const result = await tryProvider(provider, testPrompt, options);
        return { success: true, result };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

