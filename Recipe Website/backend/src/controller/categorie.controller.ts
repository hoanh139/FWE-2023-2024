import { Router } from 'express';

import { DI } from '../server';
import {CreateCategorySchema, CreateCategory, Category, RecipeTag} from '../entities';

const router = Router({ mergeParams: true });

router.get('/', async (req, res) => {

    try {
        const em = DI.em.fork();
        const categories = await em.getRepository(Category).findAll();

        if (categories.length == 0) {
            return res.status(404).send({errors: ['No Categories found']});
        }
        res.status(200).send(categories);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.get('/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const em = DI.em.fork();
        const category = await em.getRepository(Category).findOne({
            name: name,
        });
        if (!category) {
            return res.status(404).send({errors: [`Category ${name} not found`]});
        }

        res.status(200).send(category);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.post('/', async (req, res) => {
    try {
        const validatedData = await CreateCategorySchema.validate(req.body).catch((e) => {
            res.status(400).json({errors: e.errors});
        });
        if (!validatedData) {
            return;
        }
        const CreateCategory: CreateCategory = {
            ...validatedData,
        };

        const em = DI.em.fork();
        const existingCategory = await em.getRepository(Category).findOne({
            name: validatedData.name,
        });
        if (existingCategory) {
            return res.status(400).send({errors: [`Category ${validatedData.name} already exists`]});
        }

        const category = new Category(CreateCategory);
        await em.persistAndFlush(category);

        res.status(201).send(category);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }

});

router.put('/:name', async (req, res) => {
    const {name} = req.params;

    try {
        const validatedData = await CreateCategorySchema.validate(req.body).catch((e) => {
            res.status(400).json({errors: e.errors});
        });
        if (!validatedData) {
            return;
        }

        const em = DI.orm.em.fork();
        const category = await em.getRepository(Category).findOne({
            name: name,
        });

        if (!category) {
            return res.status(404).send({error: `Category ${name} not found`});
        }

        Object.assign(category, validatedData);

        await em.persistAndFlush(category);

        res.status(200).send(category);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.delete('/:name', async (req, res) => {
    const em = DI.orm.em.fork();

    try {
        const existingCategory = await em.getRepository(Category).find({
            name: req.params.name
        });
        if (!existingCategory) {
            return res.status(403).json({errors: [`You can't delete this category`]});
        }

        const recipesWithTag = await em.getRepository(RecipeTag).find({
            category: {name: req.params.name},
        });
        for (const recipetag of recipesWithTag) {
            em.remove(recipetag);
        }

        await em.remove(existingCategory).flush();
        return res.status(200).send({message: `Category ${req.params.name} deleted successfully`});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

export const CategoryController = router;
