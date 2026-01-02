// ============================================
// PIZZA OPTIMIZER - Smart Pizza Selection
// ============================================

import { generateRandomRecipe } from './recipeGenerator.js';

// ============================================
// CONFIGURATION
// ============================================

const SCORING_WEIGHTS = {
    ingredientOverlap: 0.4,    // 40% - Most important
    preparationOverlap: 0.3,   // 30% - Second priority
    varietyBonus: 0.2,         // 20% - Archetype diversity
    costEfficiency: 0.1        // 10% - Minimize unique ingredients
};

const CONSTRAINTS = {
    maxSameArchetype: 2,       // Max pizzas of same archetype
    maxSimilarity: 0.7,        // Max 70% ingredient overlap between pizzas
    candidateMultiplier: 3     // Generate 3x candidates for selection
};

// ============================================
// SCORING FUNCTIONS
// ============================================

/**
 * Calculate ingredient overlap score for a set of pizzas
 * Higher score = more ingredient reuse
 */
function calculateIngredientScore(pizzas) {
    const ingredientCounts = new Map();

    // Count ingredient usage across all pizzas
    pizzas.forEach(pizza => {
        pizza.baseIngredients.forEach(ing => {
            const name = ing.name || ing;
            ingredientCounts.set(name, (ingredientCounts.get(name) || 0) + 1);
        });
    });

    let score = 0;
    ingredientCounts.forEach(count => {
        if (count === 1) {
            score -= 5;  // Penalty for unique ingredients
        } else if (count === 2) {
            score += 10; // Bonus for shared in 2 pizzas
        } else {
            score += 20; // Higher bonus for shared in 3+ pizzas
        }
    });

    // Normalize to 0-100
    const maxPossibleScore = pizzas.length * 20;
    return Math.max(0, Math.min(100, (score / maxPossibleScore) * 100));
}

/**
 * Calculate preparation overlap score
 * Higher score = fewer unique preparations
 */
function calculatePreparationScore(pizzas) {
    const preparationCounts = new Map();

    pizzas.forEach(pizza => {
        if (pizza.preparations && pizza.preparations.length > 0) {
            pizza.preparations.forEach(prep => {
                const name = prep.name || prep;
                preparationCounts.set(name, (preparationCounts.get(name) || 0) + 1);
            });
        }
    });

    let score = 0;
    preparationCounts.forEach(count => {
        if (count === 1) {
            score -= 10; // Penalty for unique preparations
        } else {
            score += 15; // Bonus for shared preparations
        }
    });

    // Normalize to 0-100
    const maxPossibleScore = pizzas.length * 15;
    return Math.max(0, Math.min(100, (score / maxPossibleScore) * 100));
}

/**
 * Calculate variety score based on archetype distribution
 * Higher score = more diverse archetypes
 */
function calculateVarietyScore(pizzas) {
    const archetypeCounts = new Map();

    pizzas.forEach(pizza => {
        const archetype = pizza.archetype || 'unknown';
        archetypeCounts.set(archetype, (archetypeCounts.get(archetype) || 0) + 1);
    });

    let score = 0;
    const uniqueArchetypes = archetypeCounts.size;

    // Bonus for variety
    score += uniqueArchetypes * 5;

    // Penalty for too many of same archetype
    archetypeCounts.forEach(count => {
        if (count > 2) {
            score -= 20; // Heavy penalty for >2 of same type
        }
    });

    // Normalize to 0-100
    const maxPossibleScore = pizzas.length * 5;
    return Math.max(0, Math.min(100, (score / maxPossibleScore) * 100));
}

/**
 * Calculate cost efficiency score
 * Higher score = fewer total unique ingredients
 */
function calculateCostScore(pizzas) {
    const uniqueIngredients = new Set();

    pizzas.forEach(pizza => {
        pizza.baseIngredients.forEach(ing => {
            const name = ing.name || ing;
            uniqueIngredients.add(name);
        });
    });

    // Fewer unique ingredients = better score
    const avgIngredientsPerPizza = uniqueIngredients.size / pizzas.length;

    // Ideal is 3-4 ingredients per pizza
    const efficiency = Math.max(0, 1 - (avgIngredientsPerPizza - 3.5) / 10);

    return efficiency * 100;
}

/**
 * Calculate total weighted score for a pizza set
 */
function calculateTotalScore(pizzas) {
    const ingredientScore = calculateIngredientScore(pizzas);
    const preparationScore = calculatePreparationScore(pizzas);
    const varietyScore = calculateVarietyScore(pizzas);
    const costScore = calculateCostScore(pizzas);

    return (
        ingredientScore * SCORING_WEIGHTS.ingredientOverlap +
        preparationScore * SCORING_WEIGHTS.preparationOverlap +
        varietyScore * SCORING_WEIGHTS.varietyBonus +
        costScore * SCORING_WEIGHTS.costEfficiency
    );
}

/**
 * Calculate detailed metrics for a pizza set
 */
export function calculateSetMetrics(pizzas) {
    const ingredientCounts = new Map();
    const preparationCounts = new Map();
    const archetypeCounts = new Map();

    // Gather data
    pizzas.forEach(pizza => {
        // Ingredients
        pizza.baseIngredients.forEach(ing => {
            const name = ing.name || ing;
            ingredientCounts.set(name, (ingredientCounts.get(name) || 0) + 1);
        });

        // Preparations
        if (pizza.preparations) {
            pizza.preparations.forEach(prep => {
                const name = prep.name || prep;
                preparationCounts.set(name, (preparationCounts.get(name) || 0) + 1);
            });
        }

        // Archetypes
        const archetype = pizza.archetype || 'unknown';
        archetypeCounts.set(archetype, (archetypeCounts.get(archetype) || 0) + 1);
    });

    // Calculate metrics
    const totalIngredients = ingredientCounts.size;
    const sharedIngredients = Array.from(ingredientCounts.values()).filter(c => c > 1).length;
    const ingredientReusePercent = totalIngredients > 0
        ? Math.round((sharedIngredients / totalIngredients) * 100)
        : 0;

    const totalPreparations = preparationCounts.size;
    const sharedPreparations = Array.from(preparationCounts.values()).filter(c => c > 1).length;
    const preparationReusePercent = totalPreparations > 0
        ? Math.round((sharedPreparations / totalPreparations) * 100)
        : 0;

    const varietyPercent = Math.round((archetypeCounts.size / 8) * 100); // 8 total archetypes

    return {
        totalScore: Math.round(calculateTotalScore(pizzas)),
        ingredientScore: Math.round(calculateIngredientScore(pizzas)),
        preparationScore: Math.round(calculatePreparationScore(pizzas)),
        varietyScore: Math.round(calculateVarietyScore(pizzas)),
        costScore: Math.round(calculateCostScore(pizzas)),

        totalIngredients,
        sharedIngredients,
        ingredientReusePercent,

        totalPreparations,
        sharedPreparations,
        preparationReusePercent,

        uniqueArchetypes: archetypeCounts.size,
        varietyPercent,

        ingredientList: Array.from(ingredientCounts.entries()).map(([name, count]) => ({
            name,
            count,
            shared: count > 1
        })),

        preparationList: Array.from(preparationCounts.entries()).map(([name, count]) => ({
            name,
            count,
            shared: count > 1
        })),

        archetypeDistribution: Array.from(archetypeCounts.entries()).map(([archetype, count]) => ({
            archetype,
            count
        }))
    };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate similarity between two pizzas (0-1)
 */
function calculateSimilarity(pizza1, pizza2) {
    const ingredients1 = new Set(pizza1.baseIngredients.map(i => i.name || i));
    const ingredients2 = new Set(pizza2.baseIngredients.map(i => i.name || i));

    const intersection = new Set([...ingredients1].filter(x => ingredients2.has(x)));
    const union = new Set([...ingredients1, ...ingredients2]);

    return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Check if pizza meets diversity constraints against selected set
 */
function meetsDiversityConstraints(pizza, selectedSet) {
    if (selectedSet.length === 0) return true;

    // Check archetype constraint
    const sameArchetype = selectedSet.filter(p =>
        p.archetype === pizza.archetype
    ).length;

    if (sameArchetype >= CONSTRAINTS.maxSameArchetype) {
        return false;
    }

    // Check similarity constraint
    for (const existing of selectedSet) {
        const similarity = calculateSimilarity(pizza, existing);
        if (similarity > CONSTRAINTS.maxSimilarity) {
            return false;
        }
    }

    return true;
}

/**
 * Calculate incremental score for adding a pizza to current selection
 */
function calculateIncrementalScore(candidate, currentSet) {
    const testSet = [...currentSet, candidate];
    return calculateTotalScore(testSet);
}

// ============================================
// CANDIDATE GENERATION
// ============================================

/**
 * Generate candidate pizzas with optional constraints
 */
async function generateCandidates(count, constraints = {}) {
    const candidates = [];

    for (let i = 0; i < count; i++) {
        try {
            const recipe = await generateRandomRecipe();

            // Apply bonus scoring if constraints specified
            if (constraints.favorIngredients && constraints.favorIngredients.length > 0) {
                const favoredSet = new Set(constraints.favorIngredients);
                const recipeIngredients = recipe.baseIngredients.map(i => i.name || i);
                const overlap = recipeIngredients.filter(ing => favoredSet.has(ing)).length;
                recipe._bonusScore = overlap * 20; // Bonus for using favored ingredients
            }

            candidates.push(recipe);
        } catch (error) {
            console.error('Error generating candidate:', error);
        }
    }

    return candidates;
}

// ============================================
// SELECTION ALGORITHM
// ============================================

/**
 * Select optimal set of pizzas from candidates using greedy algorithm
 */
function selectOptimalSet(candidates, count, fixedPizzas = []) {
    const selected = [...fixedPizzas];
    const remaining = [...candidates];

    while (selected.length < count && remaining.length > 0) {
        // Score each candidate against current selection
        const scored = remaining.map(candidate => ({
            pizza: candidate,
            score: calculateIncrementalScore(candidate, selected) + (candidate._bonusScore || 0)
        }));

        // Sort by score (descending)
        scored.sort((a, b) => b.score - a.score);

        // Find first candidate that meets diversity constraints
        let added = false;
        for (const item of scored) {
            if (meetsDiversityConstraints(item.pizza, selected)) {
                selected.push(item.pizza);
                remaining.splice(remaining.indexOf(item.pizza), 1);
                added = true;
                break;
            }
        }

        // If no valid candidate found, take best score anyway
        if (!added && scored.length > 0) {
            selected.push(scored[0].pizza);
            remaining.splice(remaining.indexOf(scored[0].pizza), 1);
        }
    }

    return selected.slice(0, count);
}

// ============================================
// MAIN PUBLIC FUNCTIONS
// ============================================

/**
 * Generate fully optimized pizza set (Automatic mode)
 */
export async function generateOptimizedSet(numPizzas, options = {}) {
    console.log(`🎲 Generating optimized set of ${numPizzas} pizzas...`);

    const candidateCount = numPizzas * CONSTRAINTS.candidateMultiplier;
    const candidates = await generateCandidates(candidateCount, options.constraints);

    console.log(`📊 Generated ${candidates.length} candidates`);

    const selected = selectOptimalSet(candidates, numPizzas);
    const metrics = calculateSetMetrics(selected);

    console.log(`✅ Selected ${selected.length} pizzas with score: ${metrics.totalScore}/100`);

    return {
        pizzas: selected,
        metrics
    };
}

/**
 * Complete a partial set with optimized suggestions (Mixed mode)
 */
export async function completeOptimizedSet(fixedPizzas, numToGenerate, options = {}) {
    console.log(`🎯 Completing set: ${fixedPizzas.length} fixed + ${numToGenerate} to generate`);

    // Extract ingredients and preparations from fixed pizzas
    const favoredIngredients = [];
    const favoredPreparations = [];

    fixedPizzas.forEach(pizza => {
        pizza.baseIngredients.forEach(ing => {
            const name = ing.name || ing;
            if (!favoredIngredients.includes(name)) {
                favoredIngredients.push(name);
            }
        });

        if (pizza.preparations) {
            pizza.preparations.forEach(prep => {
                const name = prep.name || prep;
                if (!favoredPreparations.includes(name)) {
                    favoredPreparations.push(name);
                }
            });
        }
    });

    console.log(`📌 Favoring ${favoredIngredients.length} ingredients from fixed pizzas`);

    // Generate candidates with constraints
    const candidateCount = numToGenerate * CONSTRAINTS.candidateMultiplier;
    const candidates = await generateCandidates(candidateCount, {
        favorIngredients: favoredIngredients,
        favorPreparations: favoredPreparations,
        ...options.constraints
    });

    console.log(`📊 Generated ${candidates.length} candidates`);

    // Select NEW pizzas that complement the fixed ones
    // We pass fixedPizzas to consider them in scoring, but only select NEW ones
    const allSelected = selectOptimalSet(candidates, fixedPizzas.length + numToGenerate, fixedPizzas);

    // Extract only the NEW suggestions (remove the fixed pizzas from the result)
    const newSuggestions = allSelected.slice(fixedPizzas.length);

    console.log(`✅ Selected ${newSuggestions.length} new suggestions from ${candidates.length} candidates`);

    // Calculate metrics for complete set
    const completeSet = [...fixedPizzas, ...newSuggestions];
    const metrics = calculateSetMetrics(completeSet);

    console.log(`✅ Complete set score: ${metrics.totalScore}/100`);

    return {
        suggestions: newSuggestions,
        completeSet,
        metrics
    };
}
