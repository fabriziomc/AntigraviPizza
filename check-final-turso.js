
import { createClient } from '@libsql/client';

const tursoUrl = 'libsql://antigravipizza-fabriziomc.aws-eu-west-1.turso.io';
const tursoToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjYyMTY2MjAsImlkIjoiNGY1MTQ3YWEtM2UxMi00MTQ2LWE2ZTUtMzAyZDk5MjQ4ODBmIiwicmlkIjoiMzYxNGFkZjQtOWEyYS00ZmFmLThlZGYtMjExMmYwODEyM2QyIn0.0zGVAYtzri2Lo3c2qwR6g6wwlBJzSMlcaVHye1bEo2X-YJDXSKLUAgE4Rfwn74HTnpQIb95sxrBigpWL7dt6DQ';

const db = createClient({
    url: tursoUrl,
    authToken: tursoToken
});

const ARCHETYPE_REQUIREMENTS = {
    'dolce_salato': ['cheese_blue', 'cheese_soft', 'cheese_aged', 'fruit_sweet', 'finish_sweet', 'nut_creamy', 'nut_crunchy'],
    'terra_bosco': ['vegetable_mushrooms', 'meat_cured_intense', 'meat_cooked', 'meat_fatty', 'premium_truffle', 'base_cream_vegetable'],
    'fresca_estiva': ['vegetable_tomato_fresh', 'base_oil', 'cheese_fresh', 'meat_cured_delicate', 'seafood_preserved', 'vegetable_leafy'],
    'piccante_decisa': ['meat_spicy', 'vegetable_onions', 'finish_savory', 'vegetable_grilled', 'finish_sweet', 'cheese_fresh'],
    'mare': ['seafood_crustaceans', 'seafood_mollusks', 'seafood_fish', 'vegetable_grilled', 'vegetable_tomato_fresh', 'vegetable_leafy', 'vegetable_asparagus', 'herb_citrus', 'herb_fresh_delicate'],
    'vegana': ['base_cream_vegetable', 'base_pesto', 'vegetable_grilled', 'vegetable_leafy', 'vegetable_cruciferous', 'vegetable_mushrooms', 'vegetable_tomato_fresh', 'vegetable_bitter', 'finish_savory', 'nut_crunchy', 'nut_creamy'],
    'fusion': ['cheese_soft', 'cheese_creamy', 'meat_cured_delicate', 'meat_cured_intense', 'meat_mild_salumi', 'vegetable_root', 'vegetable_cruciferous', 'vegetable_leafy', 'finish_sweet', 'finish_tangy', 'nut_creamy']
};

async function checkFinal() {
    try {
        const ingredientsR = await db.execute('SELECT name, tags FROM Ingredients');
        const preparationsR = await db.execute('SELECT name, tags FROM Preparations');

        const allItems = [...ingredientsR.rows, ...preparationsR.rows];
        const tagMap = {};

        allItems.forEach(row => {
            if (!row.tags) return;
            const tags = JSON.parse(row.tags);
            tags.forEach(t => {
                tagMap[t] = (tagMap[t] || 0) + 1;
            });
        });

        console.log('--- FINAL AUDIT RESULTS ---');
        let totalGaps = 0;

        for (const [archetype, reqs] of Object.entries(ARCHETYPE_REQUIREMENTS)) {
            let matchingTags = reqs.filter(tag => (tagMap[tag] || 0) > 0);
            let missingTags = reqs.filter(tag => (tagMap[tag] || 0) === 0);

            const status = missingTags.length === 0 ? '✅' : '❌';
            console.log(`${status} ${archetype.toUpperCase()}: ${matchingTags.length}/${reqs.length} reqs met`);
            if (missingTags.length > 0) {
                console.log(`   MISSING: ${missingTags.join(', ')}`);
                totalGaps += missingTags.length;
            }
        }

        if (totalGaps === 0) {
            console.log('\n✨ ALL ARCHETYPES ARE NOW FULLY SATISFIED ON TURSO!');
        } else {
            console.log(`\n⚠️ STILL HAVE ${totalGaps} MISSING TAGS.`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        db.close();
    }
}

checkFinal();
