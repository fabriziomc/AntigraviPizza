
import { getDb } from './db.js';
import https from 'https';

const GZ_SEARCH_URL = 'https://www.giallozafferano.it/ricerca-ricette/';

/**
 * Searches GialloZafferano for a recipe and returns the first recipe URL found.
 * @param {string} term 
 * @returns {Promise<string|null>}
 */
// Levenshtein distance for similarity ranking
const levenshtein = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

/**
 * Searches GialloZafferano for a recipe and returns the best match.
 * @param {string} term 
 * @returns {Promise<string|null>}
 */
async function searchGz(term) {
    return new Promise((resolve, reject) => {

        const fetchUrl = (url, redirectCount = 0) => {
            if (redirectCount > 5) {
                console.log('   ⚠️ Too many redirects. Aborting.');
                return resolve(null);
            }

            const options = {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7'
                }
            };

            https.get(url, options, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    const nextUrl = res.headers.location;
                    if (nextUrl.includes('ricette.giallozafferano.it') && nextUrl.endsWith('.html') && !nextUrl.includes('ricerca-ricette')) {
                        return resolve(nextUrl);
                    }
                    return fetchUrl(nextUrl, redirectCount + 1);
                }

                if (res.statusCode !== 200) {
                    return resolve(null);
                }

                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    // Specific regex for header titles in GZ
                    const regex = /<h2 class="gz-title">\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/h2>/g;

                    const candidates = [];
                    let match;
                    while ((match = regex.exec(data)) !== null) {
                        const url = match[1];
                        const title = match[2].replace(/<[^>]+>/g, '').trim();
                        candidates.push({ url, title });
                    }

                    if (candidates.length === 0) {
                        return resolve(null);
                    }

                    // Rank candidates
                    const ranked = candidates.map(c => {
                        const distance = levenshtein(term.toLowerCase(), c.title.toLowerCase());
                        let score = distance;
                        if (c.title.toLowerCase().includes(term.toLowerCase())) score -= 5;
                        if (c.title.toLowerCase().startsWith(term.toLowerCase())) score -= 5;
                        return { ...c, score };
                    }).sort((a, b) => a.score - b.score);

                    const best = ranked[0];
                    const threshold = Math.max(term.length * 0.6, 5);

                    if (best.score > threshold) {
                        console.log(`   ❌ Best match "${best.title}" (score ${best.score}) below threshold (${threshold})`);
                        return resolve(null);
                    }

                    console.log(`   Best match: ${best.title} (${best.score.toFixed(1)})`);
                    resolve(best.url);
                });
            }).on('error', (err) => {
                console.error(`Request error:`, err.message);
                resolve(null);
            });
        };

        const initialUrl = `${GZ_SEARCH_URL}${encodeURIComponent(term)}`;
        fetchUrl(initialUrl);
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
