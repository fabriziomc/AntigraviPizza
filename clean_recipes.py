import json

# Read the seed data
with open('public/seed-data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Mapping from flour type to suggested dough
flour_to_dough = {
    'Farina tipo 00': 'Napoletana Classica',
    'Farina Manitoba': 'Alta Idratazione',
    'Farina integrale': 'Integrale',
    'Mix farina 00 e integrale': 'Contemporanea',
    'Farina tipo 0': 'Romana Croccante',
    'Farina tipo 1': 'Contemporanea'
}

def get_suggested_dough(ingredients):
    """Determine suggested dough based on flour type in ingredients"""
    for ing in ingredients:
        if ing.get('category') == 'Impasto':
            flour_name = ing.get('name', '')
            # Check for exact matches first
            if flour_name in flour_to_dough:
                return flour_to_dough[flour_name]
            # Check for partial matches
            for flour_key, dough_type in flour_to_dough.items():
                if flour_key.lower() in flour_name.lower():
                    return dough_type
    # Default to Napoletana Classica if no match found
    return 'Napoletana Classica'

# Process each recipe
cleaned_recipes = []
for recipe in data.get('recipes', []):
    # Get suggested dough before removing ingredients
    suggested_dough = get_suggested_dough(recipe.get('ingredients', []))
    
    # Remove dough ingredients (category: "Impasto")
    cleaned_ingredients = [
        ing for ing in recipe.get('ingredients', [])
        if ing.get('category') != 'Impasto'
    ]
    
    # Remove dough instructions
    instructions = recipe.get('instructions', {})
    if isinstance(instructions, dict):
        # Keep only topping instructions
        cleaned_instructions = {
            'topping': instructions.get('topping', [])
        }
    else:
        cleaned_instructions = instructions
    
    # Create cleaned recipe
    cleaned_recipe = {
        **recipe,
        'suggestedDough': suggested_dough,
        'ingredients': cleaned_ingredients,
        'instructions': cleaned_instructions
    }
    
    cleaned_recipes.append(cleaned_recipe)

# Create cleaned data
cleaned_data = {
    'version': data.get('version', 2),
    'exportDate': data.get('exportDate'),
    'recipes': cleaned_recipes
}

# Write cleaned data
with open('public/seed-data.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned_data, f, indent=2, ensure_ascii=False)

print(f"✅ Cleaned {len(cleaned_recipes)} recipes")
print(f"✅ Removed dough ingredients and instructions")
print(f"✅ Added suggestedDough field to all recipes")
