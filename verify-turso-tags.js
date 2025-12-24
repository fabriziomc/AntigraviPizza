
import { createClient } from '@libsql/client';

// Turso credentials
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

async function auditTags() {
    try {
        console.log('--- SCHEMA INSPECTION ---');
        const schema = await db.execute('PRAGMA table_info(Ingredients)');
        schema.rows.forEach(col => console.log(`  - ${col.name} (${col.type})`));

        console.log('\n--- SAMPLE DATA ---');
        const sample = await db.execute('SELECT * FROM Ingredients LIMIT 5');
        sample.rows.forEach(row => {
            console.log(`  - ${row.name}: tags="${row.tags}"`);
        });

        console.log('\nFetching all ingredients from Turso...');
        const result = await db.execute('SELECT * FROM Ingredients');
        const ingredients = result.rows;
        console.log(`Found ${ingredients.length} ingredients.\n`);

        const tagMap = {}; // tag -> count
        const ingredientMap = {}; // tag -> [ingredient names]

        ingredients.forEach(row => {
            let tags = [];
            try {
                tags = row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : [];
            } catch (e) {
                console.error(`Error parsing tags for ${row.name}:`, row.tags);
            }

            tags.forEach(tag => {
                tagMap[tag] = (tagMap[tag] || 0) + 1;
                if (!ingredientMap[tag]) ingredientMap[tag] = [];
                ingredientMap[tag].push(row.name);
            });
        });

        console.log('--- ARCHETYPE GAP ANALYSIS ---');
        let totalGaps = 0;

        for (const [archetype, tags] of Object.entries(ARCHETYPE_REQUIREMENTS)) {
            console.log(`\nArchetype: ${archetype.toUpperCase()}`);
            let archetypeGaps = 0;

            tags.forEach(tag => {
                const count = tagMap[tag] || 0;
                const status = count > 0 ? '✅' : '❌';
                console.log(`  ${status} ${tag}: ${count} ingredients`);
                if (count === 0) {
                    archetypeGaps++;
                    totalGaps++;
                }
            });

            if (archetypeGaps === 0) {
                console.log(`  ✨ Archetype fully satisfied!`);
            } else {
                console.log(`  ⚠️  Archetype has ${archetypeGaps} missing tag requirements.`);
            }
        }

        console.log('\n--- SUMMARY ---');
        if (totalGaps === 0) {
            console.log('✅ All archetypes have at least one ingredient for every required tag!');
        } else {
            console.log(`❌ Found ${totalGaps} total missing tag-requirement pairings.`);
        }

        // List tags with few ingredients (risk of repetition)
        console.log('\n--- CRITICAL TAGS (Low Variety) ---');
        for (const [tag, count] of Object.entries(tagMap)) {
            if (count === 1) {
                console.log(`  ⚠️  ${tag} only has 1 ingredient: ${ingredientMap[tag][0]}`);
            }
        }

        // List ingredients with NO tags
        const untagged = ingredients.filter(i => !i.tags || i.tags === '[]' || i.tags === '');
        if (untagged.length > 0) {
            console.log(`\n--- UNTAGGED INGREDIENTS (${untagged.length}) ---`);
            untagged.slice(0, 10).forEach(i => console.log(`  - ${i.name}`));
            if (untagged.length > 10) console.log('  ...');
        }

    } catch (err) {
        console.error('Error during audit:', err);
    } finally {
        db.close();
    }
}

auditTags();
