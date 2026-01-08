
import https from 'https';

const searchTerm = 'crema pasticcera';
const encodedTerm = encodeURIComponent(searchTerm);
const url = `https://www.giallozafferano.it/ricerca-ricette/${encodedTerm}`;

const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
};

https.get(url, options, (res) => {
    console.log('STATUS:', res.statusCode);
    if (res.statusCode >= 300 && res.statusCode < 400) {
        console.log('REDIRECT:', res.headers.location);
    }

    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        console.log('SIZE:', data.length);
        if (data.includes('cloudflare')) console.log('CLOUDFLARE DETECTED');
        console.log('BODY_START:', data.substring(0, 200));
    });
});
