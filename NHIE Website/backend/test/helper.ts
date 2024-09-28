import { DI } from '../src/server';
import { Auth } from '../src/middleware/auth.middleware';
import {User} from "../src/entities";

export const loginUser = async () => {
    // const em = DI.em.fork();
    const user = await DI.userRepository.findOne({
        email: 'max@stud.h-da.de',
    });
    return {
        token: Auth.generateToken({
            email: user!.email,
            firstName: user!.firstName,
            id: user!.id,
            lastName: user!.lastName,
        }),
        user: user!,
    };
};

export const getTestQuestions = async () => {
    // const em = DI.em.fork();
    const questions = await DI.questionRepository.findAll();
    return {
        questions: questions!,
    };
};

export const getTestPlaylists = async () => {
    // const em = DI.em.fork();
    const playlists = await DI.playlistRepository.findAll();
    return {
        playlists: playlists!,
    };
};