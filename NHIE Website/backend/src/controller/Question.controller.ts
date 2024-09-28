import { Router } from 'express';

import { DI } from '../server';
import {CreateQuestionSchema, CreateQuestion, Question, PlaylistQuestion, User} from '../entities';

const router = Router({ mergeParams: true });

/**
 * Get all Questions
 */
router.get('/', async (req, res) => {

    try {
        const em = DI.em.fork();
        const questions = await em.getRepository(Question).findAll();

        if (questions.length == 0) {
            return res.status(404).send({errors: ['No Questions found']});
        }
        res.status(200).send(questions);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});


/**
 * Get Question by id
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const em = DI.em.fork();
        const question = await em.getRepository(Question).findOne({
            id: id,
        });
        if (!question) {
            return res.status(404).send({errors: [`Question with ${id} not found`]});
        }

        res.status(200).send(question);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

/**
 * Create a Question
 */
router.post('/', async (req, res) => {
    try {
        const validatedData = await CreateQuestionSchema.validate(req.body).catch((e) => {
            console.log(req.body);
            res.status(400).json({errors: e.errors});
        });
        if (!validatedData) {
            return;
        }
        const CreateQuestion: CreateQuestion = {
            ...validatedData,
        };

        const em = DI.em.fork();
        const existingQuestion = await em.getRepository(Question).findOne({
            content: validatedData.content,
        });
        if (existingQuestion) {
            return res.status(400).send({errors: [`Question with this content already exists`]});
        }

        const question = new Question(CreateQuestion);

        if(CreateQuestion.creator) {
            let existingUser = await em.getRepository(User).findOne({
                id: CreateQuestion.creator.id,
            });

            if (!existingUser) {
                return res.status(404).send({errors: [`User with ${CreateQuestion.creator.id} not found`]});
            }
            question.creator = existingUser;
            existingUser.createdQuestions.add(question);
        } else {
            return res.status(400).send({errors: ['Missing User']});
        }

        await em.persistAndFlush(question);

        res.status(201).send(question);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }

});

/**
 * Update a Question by id
 */
router.put('/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const validatedData = await CreateQuestionSchema.validate(req.body).catch((e) => {
            res.status(400).json({errors: e.errors});
        });
        if (!validatedData) {
            return;
        }

        const em = DI.orm.em.fork();
        const existingquestion = await em.getRepository(Question).findOne({
            id: id,
        });

        if (!existingquestion || existingquestion.creator === undefined) {
            return res.status(404).send({error: `Question ${id} not found`});
        }

        if (req.body.creator) {
            if (existingquestion.creator == undefined || existingquestion.creator.id != req.body.creator.id) {
                return res.status(404).send({errors: [`This is not your Question. Wrong User ID`]});
            }
        } else {
            return res.status(400).send({errors: ['No User provided']});
        }

        Object.assign(existingquestion, validatedData);

        await em.persistAndFlush(existingquestion);

        res.status(200).send(existingquestion);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

/**
 * Delete a Question by id
 */
router.delete('/:id', async (req, res) => {
    const em = DI.orm.em.fork();

    try {
        const existingQuestion = await em.getRepository(Question).findOne({
            id: req.params.id
        });
        if (!existingQuestion) {
            return res.status(403).json({errors: [`You can't delete this question`]});
        }

        if (!existingQuestion || existingQuestion.creator === undefined) {
            return res.status(404).send({error: `Question ${req.params.id} not found`});
        }

        if (req.body.creator) {
            if (existingQuestion.creator == undefined || existingQuestion.creator.id != req.body.creator.id) {
                return res.status(404).send({errors: [`This is not your Question. Wrong User ID`]});
            }
        } else {
            return res.status(400).send({errors: ['No User provided']});
        }

        const questioninPlaylists = await em.getRepository(PlaylistQuestion).find({
            question: {id: req.params.id},
        });
        for (const questioninPlaylist of questioninPlaylists) {
            em.remove(questioninPlaylist);
        }

        await em.remove(existingQuestion).flush();
        return res.status(200).send({message: `Question ${req.params.id} deleted successfully`});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

export const QuestionController = router;
