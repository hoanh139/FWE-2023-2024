import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import request from "supertest"

import { DI, initializeServer } from '../src/server';
import { TestSeeder } from '../src/seeders/TestSeeder';
import {getTestPlaylists, getTestQuestions, loginUser} from './helper';
import {runScript} from "../src/middleware/readFile.middleware";

describe('AuthController', () => {
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
        const response = await request(DI.server).get('/auth/');
        expect(response.status).toBe(200);
        expect(response.body.length).toEqual(1);
    });

    it('can get an entry', async () => {
        const { token, user } = await loginUser();
        const id = user.id
        const response = await request(DI.server).get('/auth/' + id).set('Authorization', token);
        expect(response.status).toBe(200);
        expect(response.body.firstName).toEqual('Max');
        expect(response.body.lastName).toEqual('Mustermann');
        expect(response.body.email).toEqual('max@stud.h-da.de');
    });

    it('can create a new entry', async () => {
        const user = {
            email: 'frau@gmail.com',
            password: '456',
            firstName: 'Frau',
            lastName: 'Musterfrau'
        }
        const response = await request(DI.server)
            .post('/auth/register')
            .send(user);

        expect(response.status).toBe(201);
        expect(response.body.id).toBeDefined();
        expect(response.body.email).toEqual('frau@gmail.com');
        expect(response.body.firstName).toEqual('Frau');
        expect(response.body.lastName).toEqual('Musterfrau');
    });

    it('can login an entry', async () => {
        const user = {
            email: 'frau@gmail.com',
            password: '456'
        }
        const response = await request(DI.server)
            .post('/auth/login')
            .send(user);

        expect(response.status).toBe(200);
    });

    it('can change an exist entry', async () => {
        const { token, user } = await loginUser();
        const {questions} = await getTestQuestions();
        const {playlists} = await getTestPlaylists();
        const id = user.id
        const changeUser = {
            email: 'max@stud.h-da.de',
            password: '777',
            firstName: 'David',
            lastName: 'Muster',
            userPlaylists:[{
                playlist: {
                    id: playlists[3].id,
                    name: 'Playlist David',
                    playlistQuestions:[{
                        question:{
                            id: questions[0].id
                        }
                    },{
                        question:{
                            id: questions[1].id
                        }
                    },{
                        question:{
                            id: questions[2].id
                        }
                    }]
                }
            }]
        }

        const response = await request(DI.server)
            .put('/auth/' + id)
            .set('Authorization', token)
            .send(changeUser);

        expect(response.body.id).toBeDefined();
        expect(response.body.firstName).toEqual('David');
        expect(response.body.lastName).toEqual('Muster');
        expect(response.body.userPlaylists.length).toEqual(1);
        expect(response.status).toBe(200);
    });

    it('can get all playlists of an entry', async () => {
        const { token, user } = await loginUser();
        const id = user.id
        const response = await request(DI.server).get('/auth/userplaylist/' + id).set('Authorization', token);
        expect(response.status).toBe(200);
        expect(response.body.length).toEqual(1);
    });

    // it('can delete playlists of an entry', async () => {
    //     const { token, user } = await loginUser();
    //     const id = user.id
    //     const {playlists} = await getTestPlaylists();
    //     const deletePlaylists = {
    //         "playListIds": [playlists[3].id]
    //     }
    //     const response = await request(DI.server)
    //         .get('/auth/' + id + '/playlists')
    //         .set('Authorization', token)
    //         .send(deletePlaylists);
    //     expect(response.status).toBe(200);
    // });

    it('can delete an exist entry', async () => {
        const { token, user } = await loginUser();
        const id = user.id
        const response = await request(DI.server)
            .delete('/auth/' + id)
            .set('Authorization', token)

        expect(response.status).toBe(200);
    });
});