// Quick test of the split logic
const text = "Mozzarella di bufala e funghi porcini spadellati";

console.log("Original text:", text);
console.log("\nTest 1: Split by comma");
const parts1 = text.split(',');
console.log("Parts:", parts1);

console.log("\nTest 2: Split by ' e ' followed by uppercase");
const finalParts = [];
for (const part of parts1) {
    const subParts = part.split(/\s+e\s+(?=[A-Z])/);
    console.log(`  Part "${part}" splits into:`, subParts);
    finalParts.push(...subParts);
}
console.log("Final parts:", finalParts);

console.log("\n\nThe problem: 'funghi' starts with lowercase 'f', not uppercase!");
console.log("So the regex /\\s+e\\s+(?=[A-Z])/ doesn't match ' e funghi'");
console.log("\nSolution: Split on ' e ' when followed by a common ingredient word OR uppercase");
