
// Reproduction of logic from routes.js

async function run() {
    console.log(`🔍 Searching GZ logic test (v2 - with redirect following)...`);
    const { default: https } = await import('https');

    const searchGz = (term) => {
        return new Promise((resolve, reject) => {

            const fetchUrl = (url, redirectCount = 0) => {
                if (redirectCount > 5) {
                    console.log('⚠️ Too many redirects. Aborting.');
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
                    console.log(`   Status: ${response.statusCode}`);

                    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                        const nextUrl = response.headers.location;
                        // console.log(`   Redirect found to: ${nextUrl}`);

                        // Check if it's the recipe page we want
                        if (nextUrl.includes('ricette.giallozafferano.it') && nextUrl.endsWith('.html')) {
                            console.log('   ✅ Direct hit! Redirected to recipe.');
                            return resolve(nextUrl);
                        }

                        // Otherwise follow strict redirect
                        console.log('   ↪️ Following redirect...');
                        return fetchUrl(nextUrl, redirectCount + 1);
                    }

                    let data = '';
                    response.on('data', chunk => data += chunk);
                    response.on('end', () => {
                        console.log(`   Body received: ${data.length} bytes`);

                        // Look for recipe links in the body
                        // Note: GZ search results usually have class="gz-title" > a href="..."
                        // Our simple regex matches ANY recipe link.
                        // We hopefully pick the first one which is usually the top result.

                        const recipeLinkRegex = /href="(https:\/\/ricette\.giallozafferano\.it\/[^"]+\.html)"/g;
                        let match = recipeLinkRegex.exec(data);

                        if (match) {
                            console.log(`   ✅ Regex match found: ${match[1]}`);
                            resolve(match[1]);
                        } else {
                            console.log(`   ❌ No regex match found in body.`);
                            resolve(null);
                        }
                    });
                }).on('error', err => {
                    console.error('GZ Search Error:', err);
                    resolve(null);
                });
            };

            const initialUrl = `https://www.giallozafferano.it/ricerca-ricette/${encodeURIComponent(term)}`;
            fetchUrl(initialUrl);
        });
    };

    const term = 'crema pasticcera';
    const url = await searchGz(term);

    if (url) {
        console.log(`🎉 Final Result URL: ${url}`);
    } else {
        console.log('💀 Final Result: NULL');
    }
}

run();
