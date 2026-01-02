// Script to export database to seed-data.json using Puppeteer
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function exportDatabase() {
    console.log('🚀 Starting database export...');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        // Navigate to the auto-export page
        console.log('📄 Loading export page...');
        await page.goto('http://localhost:5173/auto-export.html', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        // Wait for export to complete
        await page.waitForFunction(() => {
            return window.exportedDataString !== undefined;
        }, { timeout: 10000 });
        
        // Get the exported data
        const exportedDataString = await page.evaluate(() => {
            return window.exportedDataString;
        });
        
        // Parse to verify it's valid JSON
        const exportedData = JSON.parse(exportedDataString);
        
        console.log(`✅ Export completed:`);
        console.log(`   - Recipes: ${exportedData.recipes.length}`);
        console.log(`   - Pizza Nights: ${exportedData.pizzaNights.length}`);
        
        // Save to seed-data.json
        const outputPath = path.join(process.cwd(), 'public', 'seed-data.json');
        fs.writeFileSync(outputPath, exportedDataString, 'utf8');
        
        console.log(`💾 Data saved to: ${outputPath}`);
        
    } catch (error) {
        console.error('❌ Error during export:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the export
exportDatabase()
    .then(() => {
        console.log('🎉 Export completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Export failed:', error);
        process.exit(1);
    });
