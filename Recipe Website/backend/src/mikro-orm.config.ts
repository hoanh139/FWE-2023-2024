import { Options } from '@mikro-orm/core';
import { Category, Ingredient, Recipe, RecipeIngredient, RecipeStep, RecipeTag } from './entities';

const options: Options = {
    type: 'postgresql',
    entities: [Category, Ingredient, Recipe, RecipeIngredient, RecipeStep, RecipeTag],
    dbName: 'recipeDB',
    user: 'recipeDBUser',
    password: 'recipeWS23',
    debug: true,
};

export default options;
