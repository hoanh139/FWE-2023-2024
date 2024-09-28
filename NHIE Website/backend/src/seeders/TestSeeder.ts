import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import {Playlist, Question, User} from '../entities';
import { Auth } from '../middleware/auth.middleware';

export class TestSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        const hashedPassword = await Auth.hashPassword('1234');
        const testUser = em.create(User, {
            email: 'max@stud.h-da.de',
            password: hashedPassword,
            firstName: 'Max',
            lastName: 'Mustermann',
        });
    }
}