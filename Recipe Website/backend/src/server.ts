import express from 'express';
import http from 'http';

import { EntityManager, EntityRepository, MikroORM } from '@mikro-orm/core';


import {RecipeController} from "./controller/recipe.controller";
import {IngredientController} from "./controller/ingredient.controller";
import {CategoryController} from "./controller/categorie.controller";
import {RecipeIngredientController} from "./controller/recipeingredient.controller";
import {RecipeStepController} from "./controller/recipestep.controller";
import {RecipeTagController} from "./controller/recipetag.controller";
import { Category, Ingredient, Recipe, RecipeIngredient, RecipeStep, RecipeTag } from './entities';

const app = express();
const PORT = 3000;

export const DI = {} as {
    server: http.Server;
    orm: MikroORM;
    em: EntityManager;
    categoryRepository: EntityRepository<Category>;
    ingredientRepository: EntityRepository<Ingredient>;
    recipeRepository: EntityRepository<Recipe>;
    recipeIngredientRepository: EntityRepository<RecipeIngredient>;
    recipeStepRepository: EntityRepository<RecipeStep>;
    recipeTagRepository: EntityRepository<RecipeTag>;
};

export const initializeServer = async () => {
    // dependency injection setup
    DI.orm = await MikroORM.init();
    DI.em = DI.orm.em;
    DI.categoryRepository = DI.orm.em.getRepository(Category);
    DI.ingredientRepository = DI.orm.em.getRepository(Ingredient);
    DI.recipeRepository = DI.orm.em.getRepository(Recipe);
    DI.recipeIngredientRepository = DI.orm.em.getRepository(RecipeIngredient);
    DI.recipeStepRepository = DI.orm.em.getRepository(RecipeStep);
    DI.recipeTagRepository = DI.orm.em.getRepository(RecipeTag);

    // example middleware
    app.use((req, res, next) => {
        console.info(`New request to ${req.path}`);
        next();
    });

    app.use(express.json());

    app.use('/recipe', RecipeController);
    app.use('/ingredient', IngredientController);
    app.use('/category', CategoryController);
    app.use('/recipeingredient', RecipeIngredientController);
    app.use('/recipestep', RecipeStepController);
    app.use('/recipetag', RecipeTagController);

    app.get('/', (req, res) => {
        res.send("Hello World");
    });

    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
}

initializeServer();