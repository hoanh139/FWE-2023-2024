import { object, string, number } from 'yup';
import {v4} from "uuid";

import {Entity, ManyToOne, PrimaryKey, Property} from '@mikro-orm/core';

import { Ingredient } from './Ingredient';
import { Recipe } from './Recipe';

@Entity()
export class RecipeIngredient{
    @Property()
    unit: string;

    @Property()
    amount: number;

    @ManyToOne(() => Ingredient, { nullable: true, primary: true })
    ingredient: Ingredient;

    @ManyToOne(() => Recipe, { nullable: true, primary: true })
    recipe?: Recipe;
    constructor( {unit, amount, ingredient, recipe}: CreateRecipeIngredient ) {
        this.unit = unit;
        this.amount = amount;
        this.ingredient = ingredient;
        this.recipe = recipe;
    }
}
export const CreateRecipeIngredientSchema = object({
    unit: string().required(),
    amount: number().required(),
    ingredient: object().required()
});

export type CreateRecipeIngredient = {
    unit: string;
    amount: number;
    ingredient: Ingredient;
    recipe?: Recipe;
};
