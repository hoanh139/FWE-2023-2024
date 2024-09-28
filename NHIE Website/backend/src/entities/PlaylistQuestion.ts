import {Entity, ManyToOne, PrimaryKey, Property} from "@mikro-orm/core";
import {object} from "yup";
import {Playlist} from "./Playlist";
import {Question} from "./Question";

@Entity()
export class PlaylistQuestion{
    @ManyToOne(() => Playlist, { nullable: true, primary: true })
    playlist?: Playlist;

    @ManyToOne(() => Question, { nullable: true, primary: true })
    question: Question;
    constructor( {question, playlist}: CreatePlaylistQuestion ) {
        this.playlist = playlist;
        this.question = question;
    }
}
export const CreatePlaylistQuestionSchema = object({
    question: object().required()
});

export type CreatePlaylistQuestion = {
    question: Question;
    playlist?: Playlist;
};
