import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import request from "supertest"

import { DI, initializeServer } from '../src/server';
import { TestSeeder } from '../src/seeders/TestSeeder';
import { getTestQuestions, loginUser} from './helper';
import {runScript} from "../src/middleware/readFile.middleware";

describe('QuestionController', () => {
    beforeAll(async () => {
        await initializeServer();
        const seeder = DI.orm.getSeeder();
        DI.orm.config.set('dbName', 'express-test-db');
        DI.orm.config.getLogger().setDebugMode(false);
        DI.orm.config.set('allowGlobalContext', true);
        await DI.orm.config.getDriver().reconnect();
        await DI.orm.getSchemaGenerator().refreshDatabase();
        await runScript();
        await seeder.seed(TestSeeder);
    });

    afterAll(async () => {
        await DI.orm.close(true);
        DI.server.close();
    });

    it('gets an empty array if no entries exist', async () => {
        const { token } = await loginUser();
        const response = await request(DI.server).get('/question/').set('Authorization', token);
        expect(response.status).toBe(200);
        expect(response.body.length).toEqual(72);
    });

    it('can get an entry', async () => {
        const { token } = await loginUser();
        const {questions} = await getTestQuestions();
        const id = questions[0].id
        const response = await request(DI.server).get('/question/' + id).set('Authorization', token);
        expect(response.status).toBe(200);
        expect(response.body.content).toEqual('Never have I ever gone skinny dipping.');
    });

    it('can create a new entry', async () => {
        const { token, user } = await loginUser();
        const question = {
            content: 'How are you ?',
            creator:{
                id: user.id
            }

        }
        const response = await request(DI.server)
            .post('/question/')
            .set('Authorization', token)
            .send(question);

        expect(response.status).toBe(201);
        expect(response.body.id).toBeDefined();
        expect(response.body.content).toBe('How are you ?');
    });

    it('can change an exist entry', async () => {
        const { token, user } = await loginUser();
        const {questions} = await getTestQuestions();
        const id = questions[72].id
        const changeQuestion = {
            content: 'What do you do ?',
            creator:{
                id: user.id
            }
        }
        const response = await request(DI.server)
            .put('/question/' + id)
            .set('Authorization', token)
            .send(changeQuestion);

        expect(response.status).toBe(200);
        expect(response.body.id).toBeDefined();
        expect(response.body.content).toBe('What do you do ?');
    });

    it('can delete an exist entry', async () => {
        const { token, user } = await loginUser();
        const {questions} = await getTestQuestions();
        const id = questions[72].id
        const body = {
            creator:{
                id: user.id
            }
        }
        const response = await request(DI.server)
            .delete('/question/' + id)
            .set('Authorization', token)
            .send(body)
        expect(response.status).toBe(200);
    });
});