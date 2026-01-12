
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';
// Use a fake ID, we just want to test the auth middleware response
const RECIPE_ID = 'recipe-test';

async function testUpload(name, headers) {
    try {
        console.log(`\n--- Testing ${name} ---`);
        console.log('Headers:', headers);
        const response = await fetch(`${BASE_URL}/api/recipes/${RECIPE_ID}/image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify({ imageBase64: 'data:image/jpeg;base64,fakeimage' })
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        try {
            const json = await response.json();
            console.log('Response:', json);
        } catch (e) {
            console.log('Response text:', await response.text().catch(() => 'No text'));
        }
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

async function run() {
    await testUpload('No Authorization Header', {});
    await testUpload('Bearer null', { 'Authorization': 'Bearer null' });
    await testUpload('Bearer undefined', { 'Authorization': 'Bearer undefined' });
    await testUpload('Bearer empty', { 'Authorization': 'Bearer ' });
    await testUpload('Bearer <empty string>', { 'Authorization': 'Bearer' });
    await testUpload('Header value undefined', { 'Authorization': undefined });
}

run();
