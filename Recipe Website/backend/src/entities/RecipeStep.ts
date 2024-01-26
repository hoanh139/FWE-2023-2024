import {number, object, string} from 'yup';

import {Entity, ManyToOne, PrimaryKey, Property} from '@mikro-orm/core';

import { Recipe } from './Recipe';

@Entity()
export class RecipeStep{
    @PrimaryKey()
    number: number;

    @Property()
    description: string;

    @ManyToOne(() => Recipe, { nullable: true, primary: true })
    recipe?: Recipe;
    constructor( {number, description, recipe}: CreateRecipeStep ) {
        this.number = number;
        this.description = description;
        this.recipe = recipe
    }
}

export const CreateRecipeStepSchema = object({
    number: number().required(),
    description: string().required(),
});

export type CreateRecipeStep = {
    number: number;
    description: string;
    recipe?: Recipe;
};
