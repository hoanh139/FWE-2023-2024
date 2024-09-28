import {Entity, ManyToOne, PrimaryKey, Property} from "@mikro-orm/core";
import {object} from "yup";
import {User} from "./User";
import {Playlist} from "./Playlist";

@Entity()
export class UserPlaylist{
    @ManyToOne(() => User, { nullable: true, primary: true })
    player: User;

    @ManyToOne(() => Playlist, { nullable: true, primary: true })
    playlist: Playlist;

    constructor( {player, playlist}: CreateUserPlaylist ) {
        this.player = player;
        this.playlist = playlist;
    }
}

export const CreateUserPlaylistSchema = object({
    player: object().required(),
    playlist: object().required()
});

export type CreateUserPlaylist = {
    player: User;
    playlist: Playlist;
};
