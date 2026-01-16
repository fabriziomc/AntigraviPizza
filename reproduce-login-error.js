async function testLogin() {
    console.log('Attempting login...');
    try {
        const response = await fetch('http://localhost:5173/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response body:', text);
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

testLogin();
