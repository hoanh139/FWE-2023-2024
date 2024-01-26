import {object, string} from "yup";
import {Collection, Entity, OneToMany, PrimaryKey, Property} from '@mikro-orm/core';

import {RecipeIngredient} from './RecipeIngredient';

@Entity()
export class Ingredient{
    @PrimaryKey()
    name: string;

    @Property()
    description: string;

    @Property()
    link: string;

    @OneToMany(() => RecipeIngredient, (e) => e.ingredient)
    recipeIngredients = new Collection<RecipeIngredient>(this);

    constructor( {name, description, link}: CreateIngredient ) {
        this.name = name;
        this.description = description;
        this.link = link;
    }
}

export const CreateIngredientSchema = object({
    name: string().required(),
    description: string().required(),
    link: string().required(),
});

export type CreateIngredient = {
    name: string;
    description: string;
    link: string;
};