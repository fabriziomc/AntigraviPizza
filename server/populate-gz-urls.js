
import { getDb } from './db.js';
import https from 'https';

const GZ_SEARCH_URL = 'https://www.giallozafferano.it/ricerca-ricette/';

/**
 * Searches GialloZafferano for a recipe and returns the first recipe URL found.
 * @param {string} term 
 * @returns {Promise<string|null>}
 */
async function searchGz(term) {
    return new Promise((resolve, reject) => {
        const encodedTerm = encodeURIComponent(term);
        const url = `${GZ_SEARCH_URL}${encodedTerm}`;

        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        };

        const req = https.get(url, options, (res) => {
            // Handle Redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                // If it redirects to a specific recipe page (implied by .html), return it
                if (res.headers.location.includes('ricette.giallozafferano.it') && res.headers.location.endsWith('.html')) {
                    return resolve(res.headers.location);
                }
                // If it redirects to another search page (e.g. normalized term), we could follow, 
                // but usually GZ redirects directly to recipe if there's a strong match, OR to a search page.
                // Let's return null to keep it simple, or implement following ONE redirect if needed.
                // For now, let's treat a redirect to a recipe page as a win, otherwise ignore.
                return resolve(null);
            }

            if (res.statusCode !== 200) {
                // console.warn(`Server returned ${res.statusCode} for term "${term}"`);
                return resolve(null);
            }

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                // Regex to find recipe links
                // We look for links that look like https://ricette.giallozafferano.it/Name-Recipe.html
                // We exclude "ricette-cat" (categories) or "blog" if we want strictness, but the simplified regex matches standard recipes.
                const recipeLinkRegex = /href="(https:\/\/ricette\.giallozafferano\.it\/[^"]+\.html)"/g;

                let match = recipeLinkRegex.exec(data);
                if (match) {
                    resolve(match[1]);
                } else {
                    resolve(null);
                }
            });
        });

        req.on('error', (err) => {
            console.error(`Request error for "${term}":`, err.message);
            resolve(null);
        });
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function populate() {
    console.log('🥣 Starting GZ URL population...');
    const db = getDb();
    const isSQLite = typeof db.prepare === 'function';

    // 1. Fetch preparations without URL
    let preps = [];
    if (isSQLite) {
        preps = db.prepare('SELECT id, name FROM Preparations WHERE recipeUrl IS NULL OR recipeUrl = ""').all();
    } else {
        const result = await db.execute('SELECT id, name FROM Preparations WHERE recipeUrl IS NULL OR recipeUrl = ""');
        preps = result.rows;
    }

    console.log(`Found ${preps.length} preparations to check.`);

    let updatedCount = 0;
    let notFoundCount = 0;

    for (let i = 0; i < preps.length; i++) {
        const prep = preps[i];
        console.log(`[${i + 1}/${preps.length}] Searching for "${prep.name}"...`);

        try {
            const url = await searchGz(prep.name);

            if (url) {
                console.log(`   ✅ Found: ${url}`);

                // Update DB
                if (isSQLite) {
                    db.prepare('UPDATE Preparations SET recipeUrl = ? WHERE id = ?').run(url, prep.id);
                } else {
                    await db.execute({
                        sql: 'UPDATE Preparations SET recipeUrl = ? WHERE id = ?',
                        args: [url, prep.id]
                    });
                }
                updatedCount++;
            } else {
                console.log(`   ❌ No match found.`);
                notFoundCount++;
            }

            // Random delay 1s to 3s to be polite
            const pause = 1000 + Math.random() * 2000;
            await delay(pause);

        } catch (err) {
            console.error(`   ⚠️ Error processing "${prep.name}":`, err.message);
        }
    }

    console.log('🎉 Population complete!');
    console.log(`Updated: ${updatedCount}`);
    console.log(`Not found: ${notFoundCount}`);
}

populate();
