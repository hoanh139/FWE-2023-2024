import {object, string} from "yup";
import {Collection, Entity, OneToMany, PrimaryKey, Property} from '@mikro-orm/core';

import { RecipeTag } from './RecipeTag';


@Entity()
export class Category {
    @PrimaryKey()
    name: string;

    @OneToMany(() => RecipeTag, (e) => e.category)
    recipeTags = new Collection<RecipeTag>(this);

    constructor( {name}: CreateCategory ) {
        this.name = name;
    }
}
export const CreateCategorySchema = object({
    name: string().required(),
});

export type CreateCategory = {
    name: string;
};


