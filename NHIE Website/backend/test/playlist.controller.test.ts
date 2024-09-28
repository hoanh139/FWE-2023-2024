import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import request from "supertest"

import { DI, initializeServer } from '../src/server';
import { TestSeeder } from '../src/seeders/TestSeeder';
import {getTestPlaylists, getTestQuestions, loginUser} from './helper';
import {runScript} from "../src/middleware/readFile.middleware";

describe('PlaylistController', () => {
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
        const response = await request(DI.server).get('/playlist/').set('Authorization', token);
        expect(response.status).toBe(200);
        expect(response.body.length).toEqual(7);
    });

    it('can get an entry', async () => {
        const { token } = await loginUser();
        const {playlists} = await getTestPlaylists();
        const id = playlists[0].id
        const response = await request(DI.server).get('/playlist/' + id).set('Authorization', token);
        expect(response.status).toBe(200);
        expect(response.body.name).toEqual('Playlist 0');
    });

    it('can create a new entry', async () => {
        const { token, user } = await loginUser();
        const {questions} = await getTestQuestions();
        const playlist = {
            name: 'Playlist 10',
            playlistQuestions: [{
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
            }],
            creator: {
                id: user.id
            }
        }
        const response = await request(DI.server)
            .post('/playlist/')
            .set('Authorization', token)
            .send(playlist);

        expect(response.status).toBe(201);
        expect(response.body.id).toBeDefined();
        expect(response.body.name).toBe('Playlist 10');
        expect(response.body.creator.firstName).toBe('Max');
        expect(response.body.creator.lastName).toBe('Mustermann');
        expect(response.body.creator.email).toBe('max@stud.h-da.de')
        expect(response.body.playlistQuestions.length).toEqual(3)
    });

    it('can change an exist entry', async () => {
        const { token, user } = await loginUser();
        const {playlists} = await getTestPlaylists();
        const {questions} = await getTestQuestions();
        const id = playlists[7].id
        const changePlaylist = {
            name: 'Playlist NHIE',
            playlistQuestions: [{
                question:{
                    id: questions[5].id
                }
            }],
            creator: {
                id: user.id
            },
        }
        const response = await request(DI.server)
            .put('/playlist/' + id)
            .set('Authorization', token)
            .send(changePlaylist);

        expect(response.status).toBe(200);
        expect(response.body.id).toBeDefined();
        expect(response.body.name).toBe('Playlist NHIE');
        expect(response.body.playlistQuestions.length).toEqual(4)
    });

    it('can delete a defined property of an exist entry', async () => {
        const { token, user } = await loginUser();
        const {playlists} = await getTestPlaylists();
        const {questions} = await getTestQuestions();
        const p_id = playlists[7].id
        const deleteQuestions ={
            questions: [questions[0].id],
            creator:{
                id: user.id
            }
        }
        const response = await request(DI.server)
            .delete('/playlist/' + p_id + '/questions')
            .set('Authorization', token)
            .send(deleteQuestions);

        expect(response.status).toBe(200);
    });

    it('can delete an exist entry', async () => {
        const { token, user } = await loginUser();
        const {playlists} = await getTestPlaylists();
        const p_id = playlists[7].id

        const requestBody = {
            creator: {
                id: user.id
            }
        }
        const response = await request(DI.server)
            .delete('/playlist/' + p_id)
            .set('Authorization', token)
            .send(requestBody);

        expect(response.status).toBe(200);
    });
});