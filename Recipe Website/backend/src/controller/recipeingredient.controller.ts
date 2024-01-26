import { Router } from 'express';

import { DI } from '../server';
import {Recipe, RecipeIngredient} from '../entities';

const router = Router({ mergeParams: true });

router.get('/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const em = DI.em.fork();
        const recipesWithIngredient = await em.getRepository(RecipeIngredient).find({
            recipe: {name: name},
        });
        if (recipesWithIngredient.length == 0) {
            return res.status(404).send({errors: [`Recipe ${name} not found`]});
        }

        res.status(200).send(recipesWithIngredient);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.get('/:ingredient/ingredient', async (req, res) => {
    const { ingredient } = req.params;

    try {
        const em = DI.em.fork();
        const recipesWithIngredient = await em.find(Recipe, {
            recipeIngredients: {
                ingredient: {
                    name: ingredient,
                },
            },
        },
            {populate: ['recipeIngredients', 'recipeIngredients.ingredient', 'recipeTags', 'recipeTags.category', 'recipeSteps']},
        );
        if (recipesWithIngredient.length == 0) {
            return res.status(404).send({errors: ['No Recipe not found']});
        }

        res.status(200).send(recipesWithIngredient);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.get('/', async (req, res) => {
    try {
        const em = DI.orm.em.fork();

        if (!req.body.ingredientList || !Array.isArray(req.body.ingredientList) || req.body.ingredientList.length === 0) {
            return res.status(400).json({error: 'Ingredients must be a non-empty array.'});
        }

        const recipes = await em.find(Recipe, {
            $and: req.body.ingredientList.map((ingredient: string) => ({
                recipeIngredients: {
                    ingredient: {
                        name: ingredient,
                    },
                },
            })),
        });

        if (recipes.length == 0) {
            return res.status(404).send({errors: ['No Recipe not found']});
        }

        res.status(200).send(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

export const RecipeIngredientController = router;
