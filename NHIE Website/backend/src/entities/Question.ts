import {Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property} from "@mikro-orm/core";
import {object, string} from "yup";
import {v4} from "uuid";
import {PlaylistQuestion} from "./PlaylistQuestion";
import {User} from "./User";

@Entity()
export class Question{
    @PrimaryKey()
    id: string = v4();

    @Property()
    content: string;

    @OneToMany(() => PlaylistQuestion, (e) => e.question)
    playlistQuestions = new Collection<PlaylistQuestion>(this);

    @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE'})
    creator?: User;

    constructor({ content }: CreateQuestion) {
        this.content = content;
    }
}

export const CreateQuestionSchema = object({
    content: string().required()
});

export type CreateQuestion = {
    content: string;
    creator?: User;
};