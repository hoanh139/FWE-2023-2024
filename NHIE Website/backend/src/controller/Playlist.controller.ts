import { Router } from "express";

import { DI } from '../server';
import {
    PlaylistQuestion,
    Playlist,
    CreatePlaylist,
    CreatePlaylistQuestionSchema,
    Question,
    CreateQuestionSchema,
    CreatePlaylistSchema,
    User,
    UserPlaylist
} from '../entities';

const router = Router({ mergeParams: true });

/**
 * Get All Playlists
 */
router.get('/', async (req, res) => {
    try {
        const em = DI.em.fork();
        const playlists = await em.getRepository(Playlist).findAll(
            {populate: ['playlistQuestions', 'playlistQuestions.question']},
        );

        if (playlists.length == 0) {
            return res.status(404).send({errors: ['No Playlist found']});
        }
        res.status(200).send(playlists);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

/**
 * Get Playlist by id
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const em = DI.em.fork();
        const playlist = await em.getRepository(Playlist).findOne(
            {id: id,},
            {populate: ['playlistQuestions.question']}
        );
        if (!playlist) {
            return res.status(404).send({errors: [`Playlist with ${id} not found`]});
        }

        res.status(200).send(playlist);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

/**
 * Add new Playlist
 */
router.post('/', async (req, res) => {
    try {
        const validatedData = await CreatePlaylistSchema.validate(req.body).catch((e) => {
            console.log(req.body);
            res.status(400).json({errors: e.errors});
        });
        if (!validatedData) {
            return;
        }
        const CreatePlaylist: CreatePlaylist = {
            ...validatedData,
        };

        const em = DI.em.fork();

        const playlist = new Playlist(CreatePlaylist);

        if (CreatePlaylist.playlistQuestions) {
            for (const pq of CreatePlaylist.playlistQuestions) {
                const validatedData = await CreatePlaylistQuestionSchema.validate(pq).catch((e) => {
                    res.status(400).json({errors: e.errors});
                });
                if (!validatedData) {
                    return;
                }

                pq.playlist = playlist;
                let existingQuestion = await em.getRepository(Question).findOne({
                    id: pq.question.id,
                });

                if (!existingQuestion) {
                    return res.status(404).send({errors: [`Question with ${pq.question.id} not found`]});
                }

                pq.question = existingQuestion;
                playlist.playlistQuestions.add(new PlaylistQuestion(pq));
            }
        } else {
            return res.status(400).send({errors: ['Missing Questions']});
        }

        if(CreatePlaylist.creator) {
            let existingUser = await em.getRepository(User).findOne({
                id: CreatePlaylist.creator.id,
            });

            if (!existingUser) {
                return res.status(404).send({errors: [`User with ${CreatePlaylist.creator.id} not found`]});
            }
            console.log("Founded user");
            playlist.creator = existingUser;
            existingUser.createdPlaylists.add(playlist);
        } else {
            return res.status(400).send({errors: ['Missing User']});
        }
        console.log("Add to DB");
        await em.persistAndFlush(playlist);

        res.status(201).send(playlist);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }

});

/**
 * Update Playlist by id
 */
router.put('/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const validatedData = await CreatePlaylistSchema.validate(req.body, {stripUnknown: true,}).catch((e) => {
            res.status(400).json({errors: e.errors});
        });
        if (!validatedData) {
            return;
        }
        const CreatePlaylist: CreatePlaylist = {
            ...validatedData,
        };

        const em = DI.orm.em.fork();

        const playlist = await em.getRepository(Playlist).findOne(
            {id: id},
            {populate: ['playlistQuestions.question']}
        );

        if (!playlist) {
            return res.status(404).send({error: 'Playlist not found'});
        }

        Object.assign(playlist, validatedData);
        await em.flush();


        if (req.body.creator) {
            if (playlist.creator == undefined || playlist.creator.id != req.body.creator.id) {
                return res.status(404).send({errors: [`This is not your Playlist. Wrong User ID`]});
            }
        } else{
            return res.status(400).send({errors: ['No User provided']});
        }

        if (req.body.playlistQuestions) {
            for (const playlistQuestion of req.body.playlistQuestions) {
                const validatedData = await CreatePlaylistQuestionSchema.validate(playlistQuestion).catch((e) => {
                    res.status(400).json({errors: e.errors});
                });
                if (!validatedData) {
                    return;
                }

                playlistQuestion.playlist = playlist;
                let existingQuestion = await em.getRepository(Question).findOne({
                    id: playlistQuestion.question.id,
                });
                if (!existingQuestion) {
                    return res.status(404).send({errors: [`Question with ${playlistQuestion.question.id} not found`]});
                }

                let existingQuestioninPlaylist = await em.getRepository(PlaylistQuestion).findOne({
                    question: {id: playlistQuestion.question.id},
                    playlist: {id: id}
                });

                if (existingQuestioninPlaylist) {
                    continue
                }

                playlistQuestion.question = existingQuestion;
                playlist.playlistQuestions.add(new PlaylistQuestion(playlistQuestion));
            }
        }

        await em.persistAndFlush(playlist);

        res.status(200).send(playlist);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

/**
 * Delete Playlist by id
 */
router.delete('/:id', async (req, res) => {
    const em = DI.orm.em.fork();

    try {
        const existingPlaylist = await em.getRepository(Playlist).findOne(
            {id: req.params.id},
            {populate: ['creator', 'creator.id']},
        );
        if (!existingPlaylist || existingPlaylist.creator === undefined) {
            return res.status(403).json({errors: [`You can't delete this playlist`]});
        }

        if (req.body.creator) {
            if (existingPlaylist.creator.id != req.body.creator.id) {
                return res.status(404).send({errors: [`This is not your Playlist. Wrong User ID`]});
            }
        } else{
            return res.status(400).send({errors: ['No User provided']});
        }

        // Delete all UserPlaylists
        const userPlaylists = await em.getRepository(UserPlaylist).find({
            playlist: {id: req.params.id},
        });
        for (const userPlaylist of userPlaylists) {
            em.remove(userPlaylist);
        }

        // delete all Questions from Playlist
        const playlistQuestions = await em.getRepository(PlaylistQuestion).find({
            playlist: {id: req.params.id},
        });
        for (const playlistQuestion of playlistQuestions) {
            em.remove(playlistQuestion);
        }

        await em.remove(existingPlaylist).flush();
        return res.status(200).send({message: `Playlist ${req.params.id} deleted successfully`});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

/**
 * Delete Questions from a Playlist that was search by id
 */
router.delete('/:id/questions', async (req, res) => {
    try {
        const {id} = req.params;

        const em = DI.orm.em.fork();

        const playlist = await em.getRepository(Playlist).findOne(
            {id: id,},
            {populate: ['creator', 'creator.id', 'playlistQuestions.question']}
        );

        if (!playlist || playlist.creator === undefined) {
            return res.status(404).send({error: `Playlist ${id} not found`});
        }

        if (req.body.creator) {
            if (playlist.creator.id != req.body.creator.id) {
                return res.status(404).send({errors: [`This is not your Playlist. Wrong User ID`]});
            }
        } else{
            return res.status(400).send({errors: ['No User provided']});
        }

        if (!req.body.questions || !Array.isArray(req.body.questions)) {
            return res.status(400).send({error: 'Invalid or missing list of questions in the request body'});
        }

        for (const questionId of req.body.questions) {
            const question = playlist.playlistQuestions.getItems().find(
                (pq) => pq.question.id === questionId
            );

            if (question) {
                em.remove(question);
            } else {
                return res.status(404).send({error: `Question with id ${questionId} not found`});
            }
        }

        await em.persistAndFlush(playlist);

        res.status(200).send({message: `Question from Playlist ${id} deleted successfully`});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

export const PlaylistController = router;
