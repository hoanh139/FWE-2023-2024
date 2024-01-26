import { Router } from 'express';

import { DI } from '../server';
import {
    CreateIngredientSchema,
    CreateIngredient,
    Ingredient,
    RecipeIngredient
} from '../entities';

const router = Router({ mergeParams: true });

router.get('/', async (req, res) => {
    try {
        const em = DI.em.fork();
        const ingredients = await em.getRepository(Ingredient).findAll();

        if (ingredients.length == 0) {
            return res.status(404).send({errors: ['No Ingredient found']});
        }

        res.status(200).send(ingredients);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.get('/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const em = DI.em.fork();
        const ingredient = await em.getRepository(Ingredient).findOne({
            name: name,
        });

        if (!ingredient) {
            return res.status(404).send({errors: [`Ingredient ${name} not found`]});
        }

        res.status(200).send(ingredient);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.post('/', async (req, res) => {
    try {
        const validatedData = await CreateIngredientSchema.validate(req.body).catch((e) => {
            res.status(400).json({errors: e.errors});
        });
        if (!validatedData) {
            return;
        }
        const CreateIngredient: CreateIngredient = {
            ...validatedData,
        };

        const em = DI.em.fork();
        const existingIngredient = await em.getRepository(Ingredient).findOne({
            name: validatedData.name,
        });

        if (existingIngredient) {
            return res.status(400).send({errors: [`Ingredient ${validatedData.name} already exists`]});
        }

        const ingredient = new Ingredient(CreateIngredient);
        await em.persistAndFlush(ingredient);

        res.status(201).send(ingredient);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.put('/:name', async (req, res) => {
    const {name} = req.params;

    try {
        const validatedData = await CreateIngredientSchema.validate(req.body,
            {stripUnknown: true,}
        ).catch((e) => {
            res.status(400).json({errors: e.errors});
        });
        if (!validatedData) {
            return;
        }

        const em = DI.orm.em.fork();
        const ingredient = await em.getRepository(Ingredient).findOne({
            name: name,
        });

        if (!ingredient) {
            return res.status(404).send({error: `Ingredient ${name} not found`});
        }

        Object.assign(ingredient, validatedData);

        await em.persistAndFlush(ingredient);

        res.status(200).send(ingredient);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.delete('/:name', async (req, res) => {
    try {
        const em = DI.orm.em.fork();
        const existingIngredient = await em.getRepository(Ingredient).find({
            name: req.params.name
        });
        if (!existingIngredient) {
            return res.status(403).json({errors: [`You can't delete this ingredient`]});
        }

        const recipesWithIngredient = await em.getRepository(RecipeIngredient).find({
            ingredient: {name: req.params.name},
        });
        for (const recipeingredient of recipesWithIngredient) {
            em.remove(recipeingredient);
        }

        await em.remove(existingIngredient).flush();
        return res.status(200).send({message: `Ingredient ${req.params.name} deleted successfully`});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

export const IngredientController = router;
