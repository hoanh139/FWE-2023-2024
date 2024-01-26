import { object, string, number } from 'yup';

import {Collection, Entity, OneToMany, PrimaryKey, Property} from '@mikro-orm/core';

import {CreateRecipeStep, RecipeStep} from './RecipeStep';
import {CreateRecipeTag, RecipeTag} from './RecipeTag';
import {CreateRecipeIngredient, RecipeIngredient} from './RecipeIngredient';

@Entity()
export class Recipe{
    @PrimaryKey()
    name: string;

    @Property()
    description: string;

    @Property()
    rating: number;

    @Property()
    picture: string;

    @OneToMany(() => RecipeStep, (e) => e.recipe)
    recipeSteps = new Collection<RecipeStep>(this);

    @OneToMany(() => RecipeTag, (e) => e.recipe)
    recipeTags = new Collection<RecipeTag>(this);

    @OneToMany(() => RecipeIngredient, (e) => e.recipe)
    recipeIngredients = new Collection<RecipeIngredient>(this);

    constructor( {name, description, rating, picture}: CreateRecipe ) {
        this.name = name;
        this.description = description;
        this.rating = rating;
        this.picture = picture;
    }
}

export const CreateRecipeSchema = object({
    name: string().required(),
    description: string().required(),
    rating: number().required(),
    picture: string().required(),
});


export type CreateRecipe = {
    name: string;
    description: string;
    rating: number;
    picture: string;
    recipeTags?: CreateRecipeTag[];
    recipeIngredients?: CreateRecipeIngredient[];
    recipeSteps?: CreateRecipeStep[];
};
