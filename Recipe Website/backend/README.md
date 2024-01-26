# Backend


## Description

---

The backend is a REST API that was implemented with Node.js and Express.js.
The application can be used to create, display, edit and delete recipes, ingredients, categories.

---
## Set up
Use the following steps in order to run backend correctly.

1. Install all neccessary packages and dependencies via Package Manager npm in backend.
```
cd /backend
npm install
```
2. The Port for our server is 3000. So its URL is `localhost:3000`.
3. Use`npm run schema:fresh` command line to create data base tables.
4. Add Database in IDE: Choose PostgreSQL (Port: 5432), then login with User as 'recipeDBUser', password as 'recipeWS23'.
5. Use `npm start dev` command line to run backend.
6. Test functionalities of Backend with Postman Collection Backend.postman_collection.json inside backend directory

> **Notice**
>
> if there is a problem, you can use Backendv2_0.postman_collection.json as alternative
---

## Entities

---
### Recipe Entity
This entity has all the characteristic of a recipe. 
It also has three arrays which can give out information about the recipe steps, categories and ingredients of the recipe.
```typescript
name: string;
description: string;
rating: number;
picture: string;
recipeIngredients: array <RecipeIngredient>
recipeTags: array <RecipeTag>
recipeSteps: array <RecipeStep>
```
### Ingredient Entity
The Ingredient entity consists of the following attributes:
```typescript
name: string;
description: string;
link: number;
```

### Category Entity
The Category entity consists of the following attributes:
```typescript
name: string;
```

### RecipeIngredient Entity
Ingredient exists in the form of a 'many-to-many' relationship with the recipe.
This entity is used to store the relation between these two entities. 
Therefore two attributes in the entiities store the reference of recipe and ingredient.
RecipeIngredient entity stores also the amount and unit of the ingredient.

```typescript
// IngredientRecipeEntity.ts
amount: number;
unit: string;
ingredient: Ingredient;
recipe: Recipe;
```

### RecipeTag Entity
Category exists in the form of a 'many-to-many' relationship with the recipe.
This entity is used to store the relation between these two entities.
Therefore two attributes in the entiities store the reference of recipe and category.

```typescript
category: Category;
recipe: Recipe;
```

### RecipeStep Entity
Category exists in the form of a 'one-to-many' relationship with the recipe.
RecipeStep entity stores the number of the recipe step and its description.

```typescript
category: Category;
recipe: Recipe;
```
---

## API


The API is accessible at `localhost:3000/`.

The following endpoints are available:

> **Notice**
>
> All uncatched errors are returned with a status code `500 Internal Server Error`.
> 
> The validation error with response code 400 is caused by the missing of a required field.

---

## Category


### Get

- `GET /category/` - Get all Categories
    - Response Code 200 OK - Array of `Category`
    - Response Code 404 Not Found - No Categories found
- `GET /category/:name` - Get Category by name, with path parameter `name`
    - Response Code 200 OK - Object of `Category`
    - Response Code 404 Not Found - Category `name` not found 

### Post

- `POST /category` - Create new Category
    - Request Body:
      ```json
      {
        "name": "string"
      }
      ```
    - Response Code 201 Created - Return Object of `Category`
    - Response Code 400 Bad Request - Category already exists / Validation Error

### PUT

- `PUT /category/:name` - Update an existed Category by name, with path parameter `name`
    - Request Body:
      ```json
      {
        "name": "string"
      }
      ```
    - Response Code 200 OK - Return Object of `Category`
    - Response Code 400 Bad Request - Validation Error
    - Response Code 404 Not Found - Category `name` not found

### DELETE

- `DELETE /category/:name` - Delete an existed Category by name, with path parameter `name`
    - Response Code 200 OK - Category `name` deleted successfully
    - Response Code 403 Forbidden - You can't delete this category

---

## Ingredient


### Get

- `GET /ingredient/` - Get all Ingredients
  - Response Code 200 OK - Array of `Ingredient`
  - Response Code 404 Not Found - No Ingredient found
- `GET /ingredient/:name` - Get Ingredient by name, with path parameter `name`
  - Response Code 200 OK - Object of `Ingredient`
  - Response Code 404 Not Found - Ingredient `name` not found

### Post

- `POST /ingredient` - Create new Ingredient
  - Request Body:
    ```json
    {
      "name": "string",
      "description": "string",
      "link": "string"
    }
    ```
  - Response Code 201 Created - Return Object of `Ingredient`
  - Response Code 400 Bad Request - Ingredient already exists / Validation Error

### PUT

- `PUT /ingredient/:name` - Update an existed Ingredient by name, with path parameter `name`
  - Request Body:
    ```json
    {
      "name": "string",
      "description": "string",
      "link": "string"
    }
    ```
  - Response Code 200 OK - Return Object of `Ingredient`
  - Response Code 400 Bad Request - Validation Error
  - Response Code 404 Not Found - Ingredient `name` not found

### DELETE

- `DELETE /ingredient/:name` - Delete an existed Ingredient by name, with path parameter `name`
  - Response Code 200 OK - Ingredient `name` deleted successfully
  - Response Code 403 Forbidden - You can't delete this ingredient

---

## Recipe


### Get

- `GET /recipe/` - Get all recipes
    - Response Code 200 OK - Array of `Recipe`
    - Response Code 404 Not Found - Recipe does not exist
- `GET /recipe/:name` - Get recipe by name, which is similar with path parameter `name`
    - Response Code 200 OK - Object of `Recipe`
    - Response Code 404 Not Found - Recipe does not exist

### Post

- `POST /recipe` - Create new Recipe
  - Request Body:
    ```json
    {
      "name": "string",
      "description": "string",
      "rating": "number",
      "picture": "string",
      "recipeIngredients": [{
        "unit": "string",
        "amount": "number",
        "ingredient": {
          "name": "string"
        }
      }],
      "recipeTags": [{
        "name": "string"
      }],
      "recipeSteps": [{
        "number": "string",
        "description": "string"
      }]
    }
    ```
    > **Notice**
    >
    > If you don't want to post any ingredients, categories or recipe steps yet (recipeIngredients/recipeTags/recipeSteps).
    > Please don't give this key in. 
    > When the key is give in, the program will assure that the array must not be empty.
  - Response Code 201 Created - Return Object of `Recipe`
  - Response Code 400 Bad Request - 
    - Recipe already exists 
    - Validation Error (Recipe/recipeIngredients/recipeTags/recipeSteps)
    - Missing Recipe-Ingredients/Recipe-Steps/Recipe-Tags

### PUT

- `PUT /recipe/:name` - Update an existed Recipe by name, with path parameter `name`
  - Request Body:
    ```json
    {
      "name": "string",
      "description": "string",
      "rating": "number",
      "picture": "string",
      "recipeIngredients": [{
        "unit": "string",
        "amount": "number",
        "ingredient": {
          "name": "string"
        }
      }],
      "recipeTags": [{
        "name": "string"
      }],
      "recipeSteps": [{
        "number": "string",
        "description": "string"
      }]
    }
    ```
    > **Notice**
    >
    > If you don't want to post any ingredients, categories or recipe steps yet (recipeIngredients/recipeTags/recipeSteps).
    > Please don't give this key in.
    > When the key is give in, the program will assure that the array must not be empty.
  - Response Code 200 OK - Return Object of `Recipe`
  - Response Code 404 Not Found - Recipe `name` not found
  - Response Code 400 Bad Request - Validation Error (Recipe/recipeIngredients/recipeTags/recipeSteps)

### DELETE

- `DELETE /recipe/:name` - Delete an existed Recipe by name, with path parameter `name`
  - Response Code 200 OK - Return successful deleted Ingredient message
  - Response Code 403 Forbidden - You can't delete this Recipe
  
- `DELETE /recipe/:name/recipesteps` - Delete steps from an existed Recipe by name, with path parameter `name`
  - Request Body:
    ```json
    {
      "stepNumbers": ["number"]
    }
    ```
  - Response Code 200 OK - Steps from Recipe `name` deleted successfully
  - Response Code 400 Bad Request - Invalid or missing stepNumbers in the request body
  - Response Code 404 Not Found 
    - Recipe `name` not found
    - Recipe with recipe step number `stepNumber` not found

- `DELETE /recipe/:name/ingredients` - Delete ingredients from an existed Recipe by name, with path parameter `name`
  - Request Body:
    ```json
    {
      "ingredientNames": ["string"]
    }
    ```
  - Response Code 200 OK - Ingredients from Recipe `name` deleted successfully
  - Response Code 400 Bad Request - Invalid or missing ingredientNames in the request body
  - Response Code 404 Not Found
    - Recipe `name` not found
    - Recipe with ingredient name `ingredientName` not found

- `DELETE /recipe/:name/categories` - Delete tags from an existed Recipe by name, with path parameter `name`
  - Request Body:
    ```json
    {
      "categories": ["string"]
    }
    ```
  - Response Code 200 OK - Tags from Recipe `name` deleted successfully
  - Response Code 400 Bad Request - Invalid or missing categories in the request body
  - Response Code 404 Not Found
    - Recipe `name` not found
    - Recipe with tag `tag` not found

---

## RecipeIngredient


### Get

- `GET /recipeingredient/:name` - Get all Ingredients from a Recipe, with path parameter `name`
  - Response Code 200 OK - Object of `RecipeIngredient`
  - Response Code 404 Not Found - Recipe `name` not found
- `GET /recipeingredient/:ingredient/ingredient` - Get all Recipes that has this ingredient, with path parameter `ingredient`
  - Response Code 200 OK - Array of `Recipe`
  - Response Code 404 Not Found - No Recipe not found

---

## RecipeTag


### Get

- `GET /recipetag/:name` - Get all Categories from a Recipe, with path parameter `name`
  - Response Code 200 OK - Object of `RecipeTag`
  - Response Code 404 Not Found - Recipe `name` not found
- `GET /recipetag/` - Get all Recipes that has this following categories
  - Request Body:
    ```json
    {
      "categoryList": ["string"]
    }
    ```
  - Response Code 200 OK - Array of `Recipe`
  - Response Code 400 Bad Request - Categories must be a non-empty array
  - Response Code 404 Not Found - No Recipe not found

---

## RecipeStep


### Get

- `GET /recipestep/:recipe` - Get all Steps from a Recipe, with path parameter `recipe`
  - Response Code 200 OK - Object of `RecipeStep`
  - Response Code 404 Not Found - Recipe `name` not found

---

# New Features

## Get Recipe that has greater Rating
- `GET /recipe/recipes/:rating` - Get all Recipes that has greater rating than `rating`, with path parameter `rating`
  - Response Code 200 OK - Array of `Recipe`
  - Response Code 404 Not Found - No Recipe found with rating greater than `rating`
# Get All Recipes that has these Ingredients
- `GET /recipeingredient/` - Get all Recipes that has this following ingredients
  - Request Body:
    ```json
    {
      "ingredientList": ["string"]
    }
    ```
  - Response Code 200 OK - Array of `Recipe`
  - Response Code 400 Bad Request - Ingredients must be a non-empty array
  - Response Code 404 Not Found - No Recipe not found

