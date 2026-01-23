# AntigraviPizza API Documentation

## Table of Contents
- [Overview](#overview)
- [Normalized Database Structure](#normalized-database-structure)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Recipes](#recipes)
  - [Ingredients](#ingredients)
  - [Preparations](#preparations)
  - [Pizza Nights](#pizza-nights)
  - [Guests](#guests)
  - [Categories](#categories)
  - [Doughs](#doughs)
  - [Settings](#settings)
  - [Admin](#admin)

---

## Overview

AntigraviPizza uses a **normalized database structure** to ensure data integrity and avoid duplication. This means:

- **Ingredients** are stored in the `Ingredients` table with unique IDs
- **Preparations** are stored in the `Preparations` table with unique IDs
- **Recipes** reference ingredients and preparations **by ID only**, not by embedding full data
- All ingredient/preparation details are fetched via JOIN operations

> [!IMPORTANT]
> When creating or updating recipes/preparations, **do not send embedded data** (like `name`, `category`, `categoryIcon`). Only send ID references along with quantity information.

---

## Normalized Database Structure

### Ingredient Reference Format

When referencing ingredients in recipes or preparations, use this structure:

```json
{
  "ingredientId": "uuid-of-ingredient",
  "quantity": 100,
  "unit": "g"
}
```

**DO NOT include:**
- `name`
- `category`
- `categoryName`
- `categoryIcon`
- `defaultUnit`

These fields are automatically fetched from the `Ingredients` table via the `db-adapter.js` layer.

### Preparation Reference Format

When referencing preparations in recipes, use this structure:

```json
{
  "preparationId": "uuid-of-preparation",
  "quantity": 1,
  "unit": "portion"
}
```

**DO NOT include:**
- `name`
- `category`
- `description`
- `ingredients`
- `instructions`
- `tips`
- `yield`
- `prepTime`
- `difficulty`

These fields are automatically fetched from the `Preparations` table.

### Multi-User Support

All tables include a `userId` column for multi-user isolation:
- `userId = NULL`: Base/shared data (ingredients, preparations, recipes provided by the system)
- `userId = <user-uuid>`: User-specific data

When fetching data, the API automatically returns both base data and user-specific data.

---

## Authentication

Most endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

**Public Endpoints** (no authentication required):
- `GET /api/recipes` (for guest access)
- `GET /api/preparations` (for guest access)
- `GET /api/ingredients` (for guest access)
- `GET /api/categories` (for guest access)
- `GET /api/guest/*` (all guest endpoints)

---

## API Endpoints

### Recipes

#### GET `/api/recipes`

Get all recipes for the authenticated user (includes base recipes + user recipes).

**Response:**
```json
[
  {
    "id": "recipe-uuid",
    "name": "Margherita",
    "pizzaiolo": "Admin",
    "description": "Classic pizza",
    "baseIngredients": [
      {
        "ingredientId": "ing-uuid-1",
        "quantity": 250,
        "unit": "g",
        "name": "Mozzarella",           // ✅ Auto-populated by API
        "category": "Formaggi",         // ✅ Auto-populated by API
        "categoryIcon": "🧀"            // ✅ Auto-populated by API
      }
    ],
    "toppingsDuringBake": [],
    "toppingsPostBake": [],
    "preparations": [
      {
        "preparationId": "prep-uuid-1",
        "quantity": 1,
        "unit": "portion",
        "name": "Salsa di Pomodoro",    // ✅ Auto-populated by API
        "category": "Salse"             // ✅ Auto-populated by API
      }
    ],
    "instructions": ["Step 1", "Step 2"],
    "imageUrl": "path/to/image.jpg",
    "dough": "Napoletana",
    "tags": ["classica", "vegetariana"],
    "isFavorite": false,
    "rating": 4.5,
    "userId": "user-uuid",
    "createdAt": 1234567890
  }
]
```

---

#### GET `/api/recipes/:id`

Get a specific recipe by ID.

**Response:** Single recipe object (same structure as above)

---

#### POST `/api/recipes`

Create a new recipe.

**Request Body:**
```json
{
  "id": "new-recipe-uuid",
  "name": "New Pizza",
  "pizzaiolo": "Chef Name",
  "description": "Pizza description",
  "baseIngredients": [
    {
      "ingredientId": "ing-uuid-1",
      "quantity": 250,
      "unit": "g"
      // ❌ DO NOT send name, category, etc.
    }
  ],
  "preparations": [
    {
      "preparationId": "prep-uuid-1",
      "quantity": 1,
      "unit": "portion"
      // ❌ DO NOT send name, ingredients, etc.
    }
  ],
  "instructions": ["Step 1"],
  "tags": ["custom"],
  "dough": "Napoletana"
}
```

> [!WARNING]
> The API will automatically strip any embedded data (`name`, `category`, etc.) from ingredients and preparations to maintain normalization.

**Response:** Created recipe object with auto-populated ingredient/preparation details

---

#### PATCH `/api/recipes/:id`

Update an existing recipe.

**Request Body:** Partial recipe object (only fields to update)

```json
{
  "name": "Updated Name",
  "isFavorite": true,
  "rating": 5
}
```

---

#### PATCH `/api/recipes/:id/components`

Update recipe ingredients and preparations with validation.

**Request Body:**
```json
{
  "baseIngredients": [
    {
      "ingredientId": "valid-ing-uuid",
      "quantity": 100,
      "unit": "g"
    }
  ],
  "preparations": [
    {
      "preparationId": "valid-prep-uuid",
      "quantity": 1,
      "unit": "portion"
    }
  ]
}
```

> [!NOTE]
> This endpoint validates that all referenced ingredient and preparation IDs exist in the database before updating.

---

#### POST `/api/recipes/:id/image`

Upload a recipe image.

**Request Body:**
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

---

#### DELETE `/api/recipes/:id`

Delete a recipe.

**Response:**
```json
{
  "message": "Deleted successfully"
}
```

---

### Ingredients

#### GET `/api/ingredients`

Get all ingredients (base + user-specific).

**Response:**
```json
[
  {
    "id": "ingredient-uuid",
    "name": "Mozzarella",
    "categoryId": "category-uuid",
    "categoryName": "Formaggi",      // ✅ Auto-joined from Categories table
    "categoryIcon": "🧀",             // ✅ Auto-joined from Categories table
    "defaultUnit": "g",
    "userId": null,                   // null = base ingredient
    "createdAt": 1234567890
  }
]
```

---

#### POST `/api/ingredients`

Create a new ingredient.

**Request Body:**
```json
{
  "id": "new-ing-uuid",
  "name": "New Ingredient",
  "categoryId": "category-uuid",
  "defaultUnit": "g"
}
```

> [!IMPORTANT]
> Always reference `categoryId` from the `Categories` table. Do not send `categoryName` or `categoryIcon`.

---

#### PUT `/api/ingredients/:id`

Update an ingredient.

**Request Body:** Partial ingredient object

---

#### DELETE `/api/ingredients/:id`

Delete an ingredient.

---

### Preparations

#### GET `/api/preparations`

Get all preparations (base + user-specific).

**Response:**
```json
[
  {
    "id": "prep-uuid",
    "name": "Salsa di Pomodoro",
    "category": "Salse",
    "description": "Classic tomato sauce",
    "ingredients": [
      {
        "ingredientId": "ing-uuid-1",
        "quantity": 400,
        "unit": "g",
        "name": "Pomodori",             // ✅ Auto-populated
        "category": "Verdure",          // ✅ Auto-populated
        "categoryIcon": "🍅"            // ✅ Auto-populated
      }
    ],
    "instructions": ["Step 1", "Step 2"],
    "tips": ["Tip 1"],
    "yield": "500g",
    "prepTime": "20",
    "difficulty": "Facile",
    "userId": null,
    "isCustom": false,
    "createdAt": 1234567890
  }
]
```

---

#### POST `/api/preparations`

Create a new preparation.

**Request Body:**
```json
{
  "id": "new-prep-uuid",
  "name": "New Preparation",
  "category": "Salse",
  "description": "Description",
  "ingredients": [
    {
      "ingredientId": "valid-ing-uuid",
      "quantity": 100,
      "unit": "g"
      // ❌ DO NOT send name, category, etc.
    }
  ],
  "instructions": ["Step 1"],
  "tips": [],
  "yield": "300g",
  "prepTime": "15",
  "difficulty": "Facile"
}
```

---

#### PUT `/api/preparations/:id`

Update a preparation.

---

#### DELETE `/api/preparations/:id`

Delete a preparation.

---

### Pizza Nights

#### GET `/api/pizza-nights`

Get all pizza nights for the user.

**Response:**
```json
[
  {
    "id": "night-uuid",
    "name": "Pizza Party",
    "date": "2026-01-25",
    "guestCount": 8,
    "selectedDough": "dough-uuid",
    "selectedPizzas": [
      {
        "recipeId": "recipe-uuid",
        "quantity": 2,
        "ratings": [4, 5, 5]
      }
    ],
    "selectedGuests": ["guest-uuid-1", "guest-uuid-2"],
    "guests": [                          // ✅ Auto-populated guest objects
      {
        "id": "guest-uuid-1",
        "name": "John Doe",
        "email": "john@example.com"
      }
    ],
    "availableIngredients": ["ing-uuid-1", "ing-uuid-2"],
    "status": "planned",
    "notes": "Notes here",
    "imageUrl": "",
    "userId": "user-uuid",
    "createdAt": 1234567890
  }
]
```

---

#### POST `/api/pizza-nights`

Create a new pizza night.

---

#### PATCH `/api/pizza-nights/:id`

Update a pizza night.

---

#### DELETE `/api/pizza-nights/:id`

Delete a pizza night.

---

#### POST `/api/pizza-nights/:nightId/rate/:recipeId`

Rate a pizza in a pizza night.

**Request Body:**
```json
{
  "rating": 5
}
```

> [!NOTE]
> This automatically syncs the global rating for the recipe across all pizza nights.

---

### Guests

#### GET `/api/guests`

Get all guests for the user.

---

#### POST `/api/guests`

Create a new guest.

**Request Body:**
```json
{
  "id": "guest-uuid",
  "name": "Guest Name",
  "email": "guest@example.com",
  "phone": "+1234567890"
}
```

---

#### PUT `/api/guests/:id`

Update a guest.

---

#### DELETE `/api/guests/:id`

Delete a guest.

---

### Categories

#### GET `/api/categories`

Get all ingredient categories.

**Response:**
```json
[
  {
    "id": "category-uuid",
    "name": "Formaggi",
    "icon": "🧀",
    "color": "#FFD700"
  }
]
```

---

### Doughs

#### GET `/api/doughs`

Get all dough recipes for the user.

---

#### POST `/api/doughs`

Create a new dough recipe.

---

#### PUT `/api/doughs/:id`

Update a dough recipe.

---

#### DELETE `/api/doughs/:id`

Delete a dough recipe.

---

### Settings

#### GET `/api/settings`

Get user settings.

---

#### POST `/api/settings`

Update user settings.

**Request Body:**
```json
{
  "ovenTemp": 450,
  "defaultDough": "dough-uuid",
  "googleApiKey": "key",
  "bringEmail": "email",
  "bringPassword": "pass"
}
```

---

### Admin

> [!CAUTION]
> Admin endpoints require `role: 'admin'` in the JWT token.

#### GET `/api/admin/users`

Get all users (admin only).

---

#### GET `/api/admin/stats`

Get system statistics (admin only).

---

#### DELETE `/api/admin/users/:userId`

Delete a user and all associated data (admin only).

---

## Migration Guide for Frontend Developers

### Before (Old Structure - Embedded Data) ⛔

```javascript
// ❌ OLD - Don't do this anymore
const recipe = {
  baseIngredients: [
    {
      ingredientId: "uuid",
      name: "Mozzarella",        // ❌ Embedded
      category: "Formaggi",       // ❌ Embedded
      categoryIcon: "🧀",         // ❌ Embedded
      quantity: 250,
      unit: "g"
    }
  ]
};
```

### After (New Structure - ID References Only) ✅

```javascript
// ✅ NEW - Send only ID references when creating/updating
const recipe = {
  baseIngredients: [
    {
      ingredientId: "uuid",
      quantity: 250,
      unit: "g"
      // ✅ No embedded data!
    }
  ]
};

// The API response will include the populated data:
const response = await fetch('/api/recipes', {
  method: 'POST',
  body: JSON.stringify(recipe)
});

const createdRecipe = await response.json();
// createdRecipe.baseIngredients[0].name === "Mozzarella" ✅ Auto-populated
```

### Key Changes

1. **When sending data to the API:** Strip all embedded fields, send only IDs + quantities
2. **When receiving data from the API:** Full objects with joined data are returned
3. **Database normalization:** Handled automatically by `db-adapter.js`
4. **No action needed:** If you're using the existing API endpoints, the adapter handles everything

---

## Data Validation

The API automatically validates:

✅ Ingredient IDs exist in the `Ingredients` table  
✅ Preparation IDs exist in the `Preparations` table  
✅ Category IDs exist in the `Categories` table  
✅ User permissions (userId matching)  
✅ Recipe limits for non-admin users  

> [!TIP]
> Use the `/api/recipes/:id/components` endpoint for validated ingredient/preparation updates.

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `400` - Bad request (validation failed)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `500` - Internal server error

---

## Database Adapter Layer

The `db-adapter.js` module handles normalization automatically:

- **`stripEmbeddedIngredientData()`** - Removes embedded ingredient fields before saving
- **`stripEmbeddedPreparationData()`** - Removes embedded preparation fields before saving
- **`expandIngredients()`** - Batch-fetches and populates ingredient data when reading
- **Multi-user filtering** - Automatically filters by userId

> [!NOTE]
> All database writes go through the adapter, ensuring consistent normalization.

---

*Last Updated: 2026-01-23*
