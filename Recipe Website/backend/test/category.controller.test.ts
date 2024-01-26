import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
const request = require('supertest');

import { DI, initializeServer } from '../src/server';

describe('DiaryEntryController', () => {
    beforeAll(async () => {
        await initializeServer();
        const seeder = DI.orm.getSeeder();
        DI.orm.config.set('dbName', 'express-test-db');
        DI.orm.config.getLogger().setDebugMode(false);
        DI.orm.config.set('allowGlobalContext', true);
        await DI.orm.config.getDriver().reconnect();
        await DI.orm.getSchemaGenerator().refreshDatabase();
    });

    afterAll(async () => {
        await DI.orm.close(true);
        DI.server.close();
    });

    it('gets an empty array if no entries exist', async () => {
        const response = await request(DI.server).get('/category');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('can create a new entry', async () => {
        const response = await request(DI.server)
            .post('/category')
            .send({ title: 'test', content: 'some content' });

        expect(response.status).toBe(201);
        expect(response.body.id).toBeDefined();
        expect(response.body.title).toBe('test');
        expect(response.body.content).toBe('some content');
        expect(response.body.creator).toBeDefined();
    });
});
