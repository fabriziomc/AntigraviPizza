
import https from 'https';
import fs from 'fs';

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

async function searchGz(term) {
    return new Promise((resolve, reject) => {
        console.log(`🔍 Searching for: "${term}"`);

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

            console.log(`   🌐 Fetching: ${url}`);
            https.get(url, options, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    console.log(`   ↪️ Redirect to: ${res.headers.location}`);
                    const nextUrl = res.headers.location;
                    if (nextUrl.includes('ricette.giallozafferano.it') && nextUrl.endsWith('.html') && !nextUrl.includes('ricerca-ricette')) {
                        console.log('   ✅ Direct recipe redirect detected!');
                        // We CONTINUE here to see what would happen if we didn't take the redirect shortcut, 
                        // effectively simulating a search where this redirect happens.
                        // But actually, if GZ redirects, we usually take it.
                        // Let's assume the issue is when it DOESN'T redirect, or redirects to a search page.
                        return fetchUrl(nextUrl, redirectCount + 1);
                    }
                    return fetchUrl(nextUrl, redirectCount + 1);
                }

                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    // Save full HTML for inspection
                    fs.writeFileSync('debug_gz_response.html', data);
                    console.log('   💾 Full HTML saved to debug_gz_response.html');

                    // Capture ANY link inside gz-title to detect blogs etc.
                    const regex = /<h2 class="gz-title">\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/h2>/g;

                    const candidates = [];
                    let match;
                    while ((match = regex.exec(data)) !== null) {
                        const url = match[1];
                        const title = match[2].replace(/<[^>]+>/g, '').trim();
                        candidates.push({ url, title });
                    }

                    console.log(`   📊 Found ${candidates.length} candidates.`);

                    if (candidates.length === 0) {
                        console.log('No candidates found. Dumping HTML snippet...');
                        console.log(data.substring(0, 1000));
                        return resolve(null);
                    }

                    // Rank candidates
                    const ranked = candidates.map(c => {
                        const distance = levenshtein(term.toLowerCase(), c.title.toLowerCase());
                        let score = distance;

                        // Bonus for "contains"
                        if (c.title.toLowerCase().includes(term.toLowerCase())) {
                            score -= 5;
                        }

                        // Bonus for "starts with"
                        if (c.title.toLowerCase().startsWith(term.toLowerCase())) {
                            score -= 5;
                        }

                        return { ...c, rawDistance: distance, score };
                    }).sort((a, b) => a.score - b.score);

                    // Write full results to file for inspection
                    fs.writeFileSync('debug_gz_results.json', JSON.stringify(ranked, null, 2));
                    console.log('   💾 Results saved to debug_gz_results.json');

                    console.log('\n   🏆 Top 5 Ranking:');
                    ranked.slice(0, 5).forEach((r, i) => {
                        console.log(`      ${i + 1}. [Score: ${r.score.toFixed(1)} | Dist: ${r.rawDistance}] "${r.title}"`);
                    });

                    resolve(ranked[0].url);
                });
            }).on('error', (err) => {
                console.error(`Request error:`, err.message);
                resolve(null);
            });
        };

        const initialUrl = `https://www.giallozafferano.it/ricerca-ricette/${encodeURIComponent(term)}`;
        fetchUrl(initialUrl);
    });
}

searchGz('Ananas caramellato');
