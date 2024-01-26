import { v4 } from 'uuid';

import {Entity, ManyToOne, PrimaryKey} from '@mikro-orm/core';

import { Category } from './Category';
import { Recipe } from "./Recipe";
import { object } from "yup";

@Entity()
export class RecipeTag{
    @ManyToOne(() => Category, { nullable: true, primary: true })
    category: Category;

    @ManyToOne(() => Recipe, { nullable: true, primary: true })
    recipe?: Recipe;

    constructor( {category, recipe}: CreateRecipeTag ) {
        this.category = category;
        this.recipe = recipe;
    }
}

export const CreateRecipeTagSchema = object({
    category: object().required()
});

export type CreateRecipeTag = {
    category: Category;
    recipe?: Recipe;
};

