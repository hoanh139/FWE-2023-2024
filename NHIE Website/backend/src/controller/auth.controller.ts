import { Router } from 'express';

import { DI } from '../server';
import {
    LoginSchema,
    CreateUser,
    RegisterUserSchema,
    User,
    UserPlaylist,
    RoomPlayer,
    CreateUserPlaylistSchema,
    Playlist,
    CreatePlaylist,
    CreateRoomPlayerSchema,
    Room,
    CreateRoom,
    CreatePlaylistQuestionSchema, Question, PlaylistQuestion, CreatePlaylistSchema
} from '../entities';
import { Auth } from '../middleware/auth.middleware';

/**
 * Get user by id
 */
const router = Router({ mergeParams: true });
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const em = DI.em.fork();

        const user = await em.getRepository(User).findOne(
            {id: id,},
            {populate: ['roomPlayers', 'userPlaylists', 'createdPlaylists']},
        );

        if (!user) {
            return res.status(404).send({errors: ['User does not exist']});
        }

        res.status(200).send(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

/**
 * Get all users
 */
router.get('/', async (req, res) => {
    try {
        const em = DI.em.fork();

        const users = await em.getRepository(User).findAll({
            populate: ['roomPlayers', 'userPlaylists', 'userPlaylists.playlist.playlistQuestions'],
        });

        if (users.length === 0) {
            return res.status(404).send({errors: ['User does not exist']});
        }

        res.status(200).send(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

/**
 * Get all playlists of user
 */
router.get('/userplaylist/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const em = DI.em.fork();
        const userWithPlaylists = await em.getRepository(UserPlaylist).find(
            {player: {id: id}},
            {populate: ['playlist', 'playlist.playlistQuestions']},
        );
        if (userWithPlaylists.length == 0) {
            return res.status(404).send({errors: [`Playlist of user with id ${id} is not found`]});
        }

        res.status(200).send(userWithPlaylists);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

/**
 * Get all rooms of user
 */
router.get('/roomplayer/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const em = DI.em.fork();
        const userWithRooms = await em.getRepository(RoomPlayer).find(
            {playerId: {id: id}},
            {populate: ['roomId']},
        );
        if (userWithRooms.length == 0) {
            return res.status(404).send({errors: [`User with id ${id} is not found`]});
        }

        res.status(200).send(userWithRooms);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

/**
 * Register new user
 */
router.post('/register', async (req, res) => {
    try {
        const em = DI.em.fork();
        console.log("debug0")

        const validatedData = await RegisterUserSchema.validate(req.body).catch((e) => {
            res.status(400).send({errors: e.errors});
        });
        if (!validatedData) {
            return;
        }
        const registerUserDto: CreateUser = {
            ...validatedData,
            password: await Auth.hashPassword(validatedData.password),
        };
        const existingUser = await em.getRepository(User).findOne({
            email: validatedData.email,
        });
        if (existingUser) {
            return res.status(400).send({errors: ['User already exists']});
        }

        const newUser = new User(registerUserDto);
        await DI.em.persistAndFlush(newUser);

        return res.status(201).send(newUser);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

/**
 * Login
 */
router.post('/login', async (req, res) => {
    try {
        const em = DI.em.fork();

        const validatedData = await LoginSchema.validate(req.body).catch((e) => {
            res.status(400).send({errors: e.errors});
        });
        if (!validatedData) {
            return;
        }

        const user = await em.getRepository(User).findOne({
            email: validatedData.email,
        });
        if (!user) {
            return res.status(400).json({errors: ['User does not exist']});
        }
        const matchingPassword = await Auth.comparePasswordWithHash(validatedData.password, user.password);
        if (!matchingPassword) {
            return res.status(401).send({errors: ['Incorrect password']});
        }

        const jwt = Auth.generateToken({
            email: user.email,
            firstName: user.firstName,
            id: user.id,
            lastName: user.lastName,
        });

        res.status(200).send({accessToken: jwt});
    }
    catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

/**
 * Put user by id
 */
router.put('/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const em = DI.orm.em.fork();
        const user = await em.getRepository(User).findOne(
            {id},
            {populate: ['roomPlayers', 'userPlaylists.playlist.playlistQuestions.question']},
        );

        if (!user) {
            return res.status(404).send({error: 'User is not found'});
        }

        const validatedData = await RegisterUserSchema.validate(req.body).catch((e) => {
            res.status(400).send({errors: e.errors});
        });
        if (!validatedData) {
            return;
        }
        const registerUserDto: CreateUser = {
            ...validatedData,
            password: await Auth.hashPassword(validatedData.password),
        };

        // em.assign(user, registerUserDto);
        user.email = registerUserDto.email
        user.password = registerUserDto.password
        user.firstName = registerUserDto.firstName
        user.lastName = registerUserDto.lastName
        await em.flush();

        if (registerUserDto.userPlaylists) {
            for (const userPlaylistData of registerUserDto.userPlaylists) {
                userPlaylistData.player = user;
                let existingPlaylist = await em.getRepository(Playlist).findOne({
                    id: userPlaylistData.playlist.id,
                });
                if (!existingPlaylist) {
                    const CreatePlaylist: CreatePlaylist = {
                        name: userPlaylistData.playlist.name
                    };
                    const playlist = new Playlist(CreatePlaylist);

                    if (userPlaylistData.playlist.playlistQuestions) {
                        for (const pq of userPlaylistData.playlist.playlistQuestions) {

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

                    existingPlaylist = playlist;
                    userPlaylistData.playlist = existingPlaylist;
                    user.userPlaylists.add(new UserPlaylist(userPlaylistData));
                } else {
                    if (userPlaylistData.playlist.playlistQuestions) {
                        for (const playlistQuestion of userPlaylistData.playlist.playlistQuestions) {
                            const validatedData = await CreatePlaylistQuestionSchema.validate(playlistQuestion).catch((e) => {
                                res.status(400).json({errors: e.errors});
                            });
                            if (!validatedData) {
                                return;
                            }
                            playlistQuestion.playlist = existingPlaylist;
                            let existingQuestion = await em.getRepository(Question).findOne({
                                id: playlistQuestion.question.id,
                            });
                            if (!existingQuestion) {
                                return res.status(404).send({errors: [`Question with ${playlistQuestion.question.id} not found`]});
                            }
                            let existingQuestioninPlaylist = await em.getRepository(PlaylistQuestion).findOne({
                                question: {id: playlistQuestion.question.id},
                                playlist: {id: existingPlaylist.id}
                            });
                            if (existingQuestioninPlaylist) {
                                return res.status(400).send({errors: [`Question with ${playlistQuestion.question.id} already existed in playlist`]});
                            }
                            playlistQuestion.question = existingQuestion;
                            existingPlaylist.playlistQuestions.add(new PlaylistQuestion(playlistQuestion));
                        }
                    }
                    existingPlaylist.name = userPlaylistData.playlist.name
                    userPlaylistData.playlist = existingPlaylist;
                    for(const userPlaylist of user.userPlaylists){
                        if(userPlaylist.playlist.id === userPlaylistData.playlist.id){
                            const userWithPlaylists = await em.getRepository(UserPlaylist).find({
                                player: {id: user.id},
                            });
                            for (const userWithPlaylist of userWithPlaylists) {
                                em.remove(userWithPlaylist);
                            }
                            em.remove(userPlaylist)
                        }
                    }
                    user.userPlaylists.add(new UserPlaylist(userPlaylistData))
                }
            }
        }
        await em.persistAndFlush(user)
        res.status(200).send(user);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

/**
 * Delete user by id
 */
router.delete('/:id', async (req, res) => {
    try {
        const em = DI.orm.em.fork();

        const existingUser = await em.getRepository(User).find({
            id: req.params.id
        });
        if (!existingUser) {
            return res.status(403).json({errors: [`You can't delete this user`]});
        }

        const userWithPlaylists = await em.getRepository(UserPlaylist).find({
            player: {id: req.params.id},
        });
        for (const userWithPlaylist of userWithPlaylists) {
            em.remove(userWithPlaylist);
        }

        const userWithRooms = await em.getRepository(RoomPlayer).find({
            playerId: {id: req.params.id},
        });
        for (const userWithRoom of userWithRooms) {
            em.remove(userWithRooms);
        }

        await em.remove(existingUser).flush();
        res.status(200).send({message: `User ${req.params.id} deleted successfully`});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

/**
 * Delete playlists of user by user's id
 */
router.delete('/:id/playlists', async (req, res) => {
    const { id } = req.params;

    try {
        const em = DI.orm.em.fork();
        const user = await em.getRepository(User).findOne(
            {id: id},
            {populate: ['userPlaylists']}
        );

        if (!user) {
            return res.status(404).send({error: 'User is not found'});
        }

        if (!req.body.playListIds || !Array.isArray(req.body.playListIds)) {
            return res.status(400).send({error: 'Invalid or missing playlist ids in the request body'});
        }

        for (const playListid of req.body.playListIds) {
            const playListId = user.userPlaylists.getItems().find(
                (up) => up.playlist.id === playListid
            );

            if (playListId) {
                em.remove(playListId);
            } else {
                return res.status(404).send({error: `User with id ${id} not found`});
            }
        }

        await em.persistAndFlush(user);

        res.status(200).send({message: `Playlists from User ${id} deleted successfully`});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

/**
 * Delete rooms of user by user's id
 */
router.delete('/:id/rooms', async (req, res) => {
    const { id } = req.params;

    try {
        const em = DI.orm.em.fork();
        const user = await em.getRepository(User).findOne(
            {id: id},
            {populate: ['roomPlayers']}
        );

        if (!user) {
            return res.status(404).send({error: 'User is not found'});
        }

        if (!req.body.roomIds || !Array.isArray(req.body.roomIds)) {
            return res.status(400).send({error: 'Invalid or missing room ids in the request body'});
        }

        for (const roomId of req.body.roomIds) {
            const roomId = user.roomPlayers.getItems().find(
                (rp) => rp.roomId.id === id
            );

            if (roomId) {
                em.remove(roomId);
            } else {
                return res.status(404).send({error: `User with id ${id} not found`});
            }
        }

        await em.persistAndFlush(user);

        res.status(200).send({message: `Rooms from User ${id} deleted successfully`});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
    }
});

export const AuthController = router;