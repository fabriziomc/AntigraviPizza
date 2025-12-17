@echo off
echo ========================================
echo   TEST API INGREDIENTS ENDPOINT
echo ========================================
echo.

curl -s http://localhost:5173/api/ingredients | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf-8')); const latticini = data.filter(i => i.category === 'Latticini'); const altro = data.filter(i => i.category === 'Altro' && ['Burro', 'Latte', 'Latte intero', 'Panna', 'Panna fresca', 'Yogurt', 'Uova', 'Crema di burrata'].includes(i.name)); console.log('\nLatticini (' + latticini.length + '):'); latticini.forEach(i => console.log('  ✓ ' + i.name)); if (altro.length > 0) { console.log('\n⚠️  Still in ALTRO (' + altro.length + '):'); altro.forEach(i => console.log('  ❌ ' + i.name)); } else { console.log('\n✅ All dairy products are correctly categorized!'); }"

echo.
pause
