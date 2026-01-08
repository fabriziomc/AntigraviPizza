import https from 'https';

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

export const searchGz = (term) => {
    return new Promise((resolve, reject) => {

        const fetchUrl = (url, redirectCount = 0) => {
            if (redirectCount > 5) {
                console.log('⚠️ [GZ] Too many redirects. Aborting.');
                return resolve(null);
            }

            console.log(`🔎 [GZ] Fetching (${redirectCount}): ${url}`);

            const options = {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7'
                }
            };

            https.get(url, options, (response) => {
                console.log(`🔎 [GZ] Status: ${response.statusCode}`);

                if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                    const nextUrl = response.headers.location;
                    if (nextUrl.includes('ricette.giallozafferano.it') && nextUrl.endsWith('.html') && !nextUrl.includes('ricerca-ricette')) {
                        console.log('   ✅ [GZ] Direct hit! Redirected to recipe.');
                        return resolve(nextUrl);
                    }
                    console.log('   ↪️ [GZ] Following redirect...');
                    return fetchUrl(nextUrl, redirectCount + 1);
                }

                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    console.log(`🔎 [GZ] Body received: ${data.length} bytes`);

                    // Find all titles in search results
                    // Structure: <h2 class="gz-title"><a ... href="...">Title</a></h2>
                    const regex = /<h2 class="gz-title">\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/h2>/g;

                    const candidates = [];
                    let match;
                    while ((match = regex.exec(data)) !== null) {
                        const url = match[1];
                        const title = match[2].replace(/<[^>]+>/g, '').trim(); // Remove any inner tags
                        candidates.push({ url, title });
                    }

                    // Secondary Regex for Blog Results (span.gz-title or article > a[href*="blog"])
                    // Structure: <a href="https://blog.giallozafferano.it/..." title="..."> ... <span class="gz-title">Title</span>
                    const blogRegex = /<a[^>]*href="(https:\/\/blog\.giallozafferano\.it\/[^"]+)"[^>]*title="([^"]+)"/g;
                    while ((match = blogRegex.exec(data)) !== null) {
                        const url = match[1];
                        let title = match[2];
                        // Simple entity decode for common quotes
                        title = title.replace(/&#039;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
                        candidates.push({ url, title });
                    }

                    if (candidates.length === 0) {
                        console.log('   ❌ [GZ] No results found matching regex.');
                        return resolve(null);
                    }

                    console.log(`   📊 Found ${candidates.length} candidates. Ranking...`);

                    // Rank candidates
                    const ranked = candidates.map(c => {
                        const distance = levenshtein(term.toLowerCase(), c.title.toLowerCase());
                        // Normalized score: lower is better. 
                        // Bonus for "starts with" or "contains"
                        let score = distance;
                        if (c.title.toLowerCase().includes(term.toLowerCase())) score -= 5;
                        if (c.title.toLowerCase().startsWith(term.toLowerCase())) score -= 5;

                        return { ...c, score, distance };
                    }).sort((a, b) => a.score - b.score);

                    console.log('   🏆 Top 3 matches:');
                    ranked.slice(0, 3).forEach((r, i) => console.log(`      ${i + 1}. [${r.score.toFixed(1)}] ${r.title}`));

                    const best = ranked[0];
                    // Threshold: if the best score is > 60% of term length (conceptually), vague.
                    // Better: if distance is high absolute or relative.
                    // Let's use: if score > term.length * 0.5  AND score > 5
                    // Example "Ananas caramellato" (18). 18 * 0.5 = 9. Best mismatch was 16. 16 > 9 -> REJECT.
                    // Example "Crema" (5). 2.5. Match "Crema di..." (score could be low).

                    const threshold = Math.max(term.length * 0.6, 5);
                    if (best.score > threshold) {
                        console.log(`   ❌ [GZ] Best match "${best.title}" (score ${best.score}) below confidence threshold (${threshold})`);
                        return resolve(null);
                    }

                    resolve(best.url);
                });

                response.on('error', (err) => {
                    console.error('   ❌ [GZ] Error reading response:', err);
                    reject(err);
                });
            }).on('error', (err) => {
                console.error('   ❌ [GZ] Connection error:', err);
                reject(err);
            });
        };

        const searchUrl = `https://www.giallozafferano.it/ricerca-ricette/${encodeURIComponent(term)}`;
        fetchUrl(searchUrl);
    });
};
