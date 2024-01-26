import { Router } from 'express';

import { DI } from '../server';
import { RecipeStep } from '../entities';

const router = Router({ mergeParams: true });

router.get('/:recipe', async (req, res) => {
    const { recipe } = req.params;

    try {
        const em = DI.em.fork();
        const recipesteps = await em.getRepository(RecipeStep).find({
            recipe: {name: recipe},
        });
        if (recipesteps.length == 0) {
            return res.status(404).send({errors: ['No Recipe not found']});
        }

        res.status(200).send(recipesteps);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

export const RecipeStepController = router;
