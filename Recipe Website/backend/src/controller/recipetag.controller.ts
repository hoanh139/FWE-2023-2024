import { Router } from 'express';

import { DI } from '../server';
import {Recipe, RecipeTag} from '../entities';

const router = Router({ mergeParams: true });

router.get('/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const em = DI.em.fork();
        const recipeTags = await em.getRepository(RecipeTag).find({
            recipe: {name: name},
        });
        if (recipeTags.length == 0) {
            return res.status(404).send({errors: [`Recipe ${name} not found`]});
        }

        res.status(200).send(recipeTags);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.get('/', async (req, res) => {
    try {
        const em = DI.orm.em.fork();

        if (!req.body.categoryList || !Array.isArray(req.body.categoryList) || req.body.categoryList.length === 0) {
            return res.status(400).json({error: 'Categories must be a non-empty array.'});
        }

        const recipes = await em.find(Recipe, {
            $and: req.body.categoryList.map((category: string) => ({
                recipeTags: {
                    category: {
                        name: category,
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

export const RecipeTagController = router;
