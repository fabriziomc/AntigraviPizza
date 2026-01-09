
(async () => {
    try {
        const fetch = (await import('node-fetch')).default;
        // Use localhost port 3000 (default)
        const response = await fetch('http://localhost:3000/api/pizza-nights');
        const nights = await response.json();

        console.log(`Found ${nights.length} pizza nights.`);
        nights.forEach(n => {
            console.log(`- [${n.id}] ${n.name}: imageUrl=${n.imageUrl ? n.imageUrl.substring(0, 30) + '...' : 'NULL'}`);
        });

    } catch (err) {
        console.error('Error:', err.message);
    }
})();
