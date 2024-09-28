import fs from 'fs';
import {CreateQuestionSchema, Question, CreateQuestion, Playlist, PlaylistQuestion} from '../entities';
import {DI} from "../server";
import * as path from "path";

const filePath = path.join(__dirname, '../../NHIE_Questions.txt');

const readQuestionsFromFile = async () => {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split('\n');

        const questions = lines.map((line) => {
            const match = line.match(/^(\d+)\.\s+(.+)$/);
            if (match) {
                const [, order, content] = match;
                return { order: parseInt(order), content: content };
            } else {
                return null;
            }
        });

        const validQuestions = questions.filter((q) => q !== null);

        return validQuestions;
    } catch (error: any) {
        console.error('Error reading the file:', error.message);
        return [];
    }
};

const persistQuestionsToDatabase = async () => {
    const questionsData = await readQuestionsFromFile();

    if (questionsData.length === 0) {
        console.error('No valid questions to create.');
        return [];
    }

    const em = DI.em.fork();

    try {
        for (const questionData of questionsData) {
            if(questionData === null){
                return;
            }

            const CreateQuestion: CreateQuestion = {
                content: questionData.content,
            };
            const validatedData = await CreateQuestionSchema.validate(CreateQuestion).catch((e) => {
                console.log(e.errors);
            });
            if (!validatedData) {
                return;
            }

            const existingQuestion = await em.getRepository(Question).findOne({
                content: validatedData.content,
            });
            if (existingQuestion) {
                console.log(`Question with this content already exists`);
                continue;
            }

            const question = new Question(validatedData);
            await em.persistAndFlush(question);
        }
        console.log(`Default Questions persisted to the database.`);
    } catch (error: any) {
        console.error('Error persisting questions to the database:', error.message);
        return;
    }
};

const createPlaylists = async () => {
    const em = DI.em.fork();

    const questions = await em.getRepository(Question).find(
        {creator: undefined}
    );

    if (questions.length === 0) {
        console.error('No questions available to create playlists.');
        return;
    }

    // Shuffle the questions
    const shuffledQuestions = shuffleArray(questions);

    const NoPlaylist = 7;
    // Create 10 playlists with 10 questions each
    for (let i = 0; i < NoPlaylist; i++) {
        const playlistName = "Playlist " + i;

        let playlist = await em.getRepository(Playlist).findOne(
            {name: playlistName,}
        );
        if (playlist) {
            console.log(`Default Playlists already created`);
            return;
        }

        playlist = new Playlist({
            name: playlistName,
        });

        for (let j = 0; j < 10; j++) {
            const question = shuffledQuestions[i * 10 + j];
            const playlistQuestion = new PlaylistQuestion({
                playlist: playlist,
                question: question
            });
            playlist.playlistQuestions.add(playlistQuestion);
        }

        await em.persistAndFlush(playlist);
        console.log(`Playlist ${i + 1} created.`);
    }
    console.log('Playlists created successfully.');
};

const shuffleArray = <T>(array: T[]): T[] => {
    const shuffledArray = array.slice();
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
};

export const runScript = async () => {
    await persistQuestionsToDatabase();
    await createPlaylists();
};
