import express, { Router } from 'express';

import { DI } from '../server';
import {
    CreateRecipeSchema,
    CreateRecipe,
    Recipe,
    RecipeIngredient,
    RecipeStep,
    Ingredient,
    Category,
    RecipeTag,
    CreateIngredient,
    CreateCategory,
    CreateRecipeIngredientSchema,
    CreateRecipeStepSchema,
    CreateRecipeTagSchema, CreateIngredientSchema
} from '../entities';
import {string} from "yup";
const router = Router({ mergeParams: true });

router.get('/', async (req, res) => {
    try {
        const em = DI.em.fork();
        const recipe = await em.getRepository(Recipe).findAll(
            {populate: ['recipeIngredients', 'recipeIngredients.ingredient', 'recipeTags', 'recipeTags.category', 'recipeSteps']},
        );

        if (recipe.length == 0) {
            return res.status(404).send({errors: ['No Recipe found']});
        }

        res.status(200).send(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.get('/:name', async (req, res) => {
    const {name} = req.params;

    try {
        const em = DI.em.fork();
        const recipe = await em.getRepository(Recipe).findOne(
            {name: name,},
            {populate: ['recipeIngredients', 'recipeIngredients.ingredient', 'recipeTags', 'recipeTags.category', 'recipeSteps']},
        );

        if (!recipe) {
            return res.status(404).send({errors: ['Recipe not found']});
        }

        res.status(200).send(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.get('/recipes/:rating', async (req, res) => {
    const { rating } = req.params;

    try {
        const em = DI.em.fork();
        const recipes = await em.getRepository(Recipe).find(
            { rating: { $gt: parseFloat(rating) } }
        );
        if (recipes.length == 0) {
            return res.status(404).send({errors: [`No Recipe found with rating greater than ${rating}`]});
        }

        res.status(200).json(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const validatedData = await CreateRecipeSchema.validate(req.body).catch((e) => {
            res.status(400).json({errors: e.errors});
        });
        if (!validatedData) {
            return;
        }
        const CreateRecipe: CreateRecipe = {
            ...validatedData,
        };

        const em = DI.em.fork();
        const existingRecipe = await em.getRepository(Recipe).findOne({
            name: validatedData.name,
        });

        if (existingRecipe) {
            return res.status(400).send({errors: ['Recipe already exists']});
        }

        const recipe = new Recipe(CreateRecipe);

        if (CreateRecipe.recipeIngredients) {
            for (const ri of CreateRecipe.recipeIngredients) {
                const validatedData = await CreateRecipeIngredientSchema.validate(ri).catch((e) => {
                    res.status(400).json({errors: e.errors});
                });
                if (!validatedData) {
                    return;
                }

                ri.recipe = recipe;
                let existingIngredient = await em.getRepository(Ingredient).findOne({
                    name: ri.ingredient.name,
                });
                if (!existingIngredient) {
                    const CreateIngredient: CreateIngredient = {
                        name: ri.ingredient.name,
                        description: "Not available",
                        link: "Not avaiable",
                    };
                    existingIngredient = new Ingredient(CreateIngredient);
                }

                ri.ingredient = existingIngredient;
                recipe.recipeIngredients.add(new RecipeIngredient(ri));
            }
        } else {
            return res.status(400).send({errors: ['Missing Recipe Ingredients']});
        }

        if (CreateRecipe.recipeSteps) {
            for (const rs of CreateRecipe.recipeSteps) {
                const validatedData = await CreateRecipeStepSchema.validate(rs).catch((e) => {
                    res.status(400).json({errors: e.errors});
                });
                if (!validatedData) {
                    return;
                }

                rs.recipe = recipe;
                recipe.recipeSteps.add(new RecipeStep(rs));
            }
        } else {
            return res.status(400).send({errors: ['Missing Recipe Steps']});
        }

        if (CreateRecipe.recipeTags) {
            for (const rt of CreateRecipe.recipeTags) {
                const validatedData = await CreateRecipeTagSchema.validate(rt).catch((e) => {
                    res.status(400).json({errors: e.errors});
                });
                if (!validatedData) {
                    return;
                }

                rt.recipe = recipe;
                let existingCategory = await em.getRepository(Category).findOne({
                    name: rt.category.name,
                });
                if (!existingCategory) {
                    const CreateCategory: CreateCategory = {
                        name: rt.category.name,
                    };
                    existingCategory = new Category(CreateCategory);
                }

                rt.category = existingCategory;
                recipe.recipeTags.add(new RecipeTag(rt));
            }
        } else {
            return res.status(400).send({errors: ['Missing Recipe Tags']});
        }

        await em.persistAndFlush(recipe);

        res.status(201).send(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.put('/:name', async (req, res) => {
    const {name} = req.params;

    try {
        const em = DI.orm.em.fork();
        const recipe = await em.getRepository(Recipe).findOne(
            {name},
            {populate: ['recipeIngredients', 'recipeTags', 'recipeSteps']},
        );

        if (!recipe) {
            return res.status(404).send({error: 'Recipe not found'});
        }

        const validatedData = await CreateRecipeSchema.validate(req.body,
            {stripUnknown: true,}
        ).catch((e) => {
            res.status(400).json({errors: e.errors});
        });
        if (!validatedData) {
            return;
        }
        ;

        Object.assign(recipe, validatedData);
        await em.flush();

        if (req.body.recipeIngredients) {
            for (const recipeingredientData of req.body.recipeIngredients) {
                const validatedData = await CreateRecipeIngredientSchema.validate(recipeingredientData).catch((e) => {
                    res.status(400).json({errors: e.errors});
                });
                if (!validatedData) {
                    return;
                }

                let IsNew = true;
                for (const recipeingredient of recipe.recipeIngredients.getItems()) {
                    if(recipeingredientData.ingredient.name == recipeingredient.ingredient.name){
                        Object.assign(recipeingredient, recipeingredientData);
                        IsNew = false;
                    }
                }

                if(IsNew){
                    recipeingredientData.recipe = recipe;
                    let existingIngredient = await em.getRepository(Ingredient).findOne({
                        name: recipeingredientData.ingredient.name,
                    });
                    if (!existingIngredient) {
                        const CreateIngredient: CreateIngredient = {
                            name: recipeingredientData.ingredient.name,
                            description: "",
                            link: "",
                        };
                        existingIngredient = new Ingredient(CreateIngredient);
                    }

                    recipeingredientData.ingredient = existingIngredient;
                    recipe.recipeIngredients.add(new RecipeIngredient(recipeingredientData));
                }
            }
        }

        if (req.body.recipeSteps) {
            for (const recipestep of recipe.recipeSteps.getItems()) {
                em.remove(recipestep);
            }
            recipe.recipeSteps.removeAll();


            for (const recipeStepData of req.body.recipeSteps) {
                const validatedData = await CreateRecipeStepSchema.validate(recipeStepData).catch((e) => {
                    res.status(400).json({errors: e.errors});
                });
                if (!validatedData) {
                    return;
                }

                recipeStepData.recipe = recipe;
                recipe.recipeSteps.add(new RecipeStep(recipeStepData));
            }
        }

        if (req.body.recipeTags) {
            for (const recipetag of recipe.recipeTags.getItems()) {
                em.remove(recipetag);
            }
            recipe.recipeTags.removeAll();


            for (const recipetagData of req.body.recipeTags) {
                const validatedData = await CreateRecipeTagSchema.validate(recipetagData).catch((e) => {
                    res.status(400).json({errors: e.errors});
                });
                if (!validatedData) {
                    return;
                }

                recipetagData.recipe = recipe;
                let existingCategory = await em.getRepository(Category).findOne({
                    name: recipetagData.category.name,
                });
                if (!existingCategory) {
                    const CreateCategory: CreateCategory = {
                        name: recipetagData.category.name,
                    };
                    existingCategory = new Category(CreateCategory);
                }

                recipetagData.category = existingCategory;
                recipe.recipeTags.add(new RecipeTag(recipetagData));
            }
        }

        await em.persistAndFlush(recipe);

        res.status(200).send(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.delete('/:name', async (req, res) => {
    try {
        const em = DI.orm.em.fork();

        const existingRecipe = await em.getRepository(Recipe).find({
            name: req.params.name
        });
        if (!existingRecipe) {
            return res.status(403).json({errors: [`You can't delete this recipe`]});
        }

        const recipesWithIngredient = await em.getRepository(RecipeIngredient).find({
            recipe: {name: req.params.name},
        });
        for (const recipeingredient of recipesWithIngredient) {
            em.remove(recipeingredient);
        }

        const recipesWithStep = await em.getRepository(RecipeStep).find({
            recipe: {name: req.params.name},
        });
        for (const recipestep of recipesWithStep) {
            em.remove(recipestep);
        }
        const recipesWithTag = await em.getRepository(RecipeTag).find({
            recipe: {name: req.params.name},
        });
        for (const recipetag of recipesWithTag) {
            em.remove(recipetag);
        }

        await em.remove(existingRecipe).flush();
        res.status(200).send({message: `Recipe ${req.params.name} deleted successfully`});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.delete('/:name/recipesteps', async (req, res) => {
    const { name } = req.params;

    try {
        const em = DI.orm.em.fork();
        const recipe = await em.getRepository(Recipe).findOne(
            {name: name},
            {populate: ['recipeSteps']}
        );

        if (!recipe) {
            return res.status(404).send({error: `Recipe ${name} not found`});
        }

        if (!req.body.stepNumbers || !Array.isArray(req.body.stepNumbers)) {
            return res.status(400).send({error: 'Invalid or missing stepNumbers in the request body'});
        }

        // Find and remove the RecipeIngredients by name
        for (const stepNumber of req.body.stepNumbers) {
            const recipeStep = recipe.recipeSteps.getItems().find(
                (rs) => rs.number === stepNumber
            );

            if (recipeStep) {
                em.remove(recipeStep);
            } else {
                return res.status(404).send({error: `Recipe with recipe step number ${stepNumber} not found`});
            }
        }

        await em.persistAndFlush(recipe);

        res.status(200).send({message: `Steps from Recipe ${name} deleted successfully`});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.delete('/:name/ingredients', async (req, res) => {
    const { name } = req.params;

    try {
        const em = DI.orm.em.fork();
        const recipe = await em.getRepository(Recipe).findOne(
            {name: name},
            {populate: ['recipeIngredients']}
        );

        if (!recipe) {
            return res.status(404).send({error: `Recipe ${name} not found`});
        }

        if (!req.body.ingredientNames || !Array.isArray(req.body.ingredientNames)) {
            return res.status(400).send({error: 'Invalid or missing ingredientNames in the request body'});
        }

        // Find and remove the RecipeIngredients by name
        for (const ingredientName of req.body.ingredientNames) {
            const recipeIngredient = recipe.recipeIngredients.getItems().find(
                (ri) => ri.ingredient.name === ingredientName
            );

            if (recipeIngredient) {
                em.remove(recipeIngredient);
            } else {
                return res.status(404).send({error: `Recipe with ingredient name ${ingredientName} not found`});
            }
        }

        await em.persistAndFlush(recipe);

        res.status(200).send({message: `Ingredients from Recipe ${name} deleted successfully`});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

router.delete('/:name/categories', async (req, res) => {
    try {
        const {name} = req.params;

        const em = DI.orm.em.fork();
        const recipe = await em.getRepository(Recipe).findOne(
            {name: name},
            {populate: ['recipeTags']}
        );

        if (!recipe) {
            return res.status(404).send({error: `Recipe ${name} not found`});
        }

        if (!req.body.categories || !Array.isArray(req.body.categories)) {
            return res.status(400).send({error: 'Invalid or missing categories in the request body'});
        }

        for (const tag of req.body.categories) {
            const recipeTag = recipe.recipeTags.getItems().find(
                (ri) => ri.category.name === tag
            );

            if (recipeTag) {
                em.remove(recipeTag);
            } else {
                return res.status(404).send({error: `Recipe with tag ${tag} not found`});
            }
        }

        await em.persistAndFlush(recipe);

        res.status(200).send({message: `Tags from Recipe ${name} deleted successfully`});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});
export const RecipeController = router;
