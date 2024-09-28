import {Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property} from "@mikro-orm/core";
import {v4} from "uuid";
import {array, object, string} from "yup";
import {UserPlaylist} from "./UserPlaylist";
import {CreatePlaylistQuestion, PlaylistQuestion} from "./PlaylistQuestion";
import {RoomPlayer} from "./RoomPlayer";
import {Room} from "./Room";
import {CreateQuestion} from "./Question";
import {User} from "./User";

@Entity()
export class Playlist{
    @PrimaryKey()
    id: string = v4();

    @Property()
    name: string;

    @OneToMany(() => Room, (e) => e.playlist)
    rooms = new Collection<Room>(this);

    @OneToMany(() => UserPlaylist, (e) => e.playlist)
    userPlaylists = new Collection<UserPlaylist>(this);

    @OneToMany(() => PlaylistQuestion, (e) => e.playlist)
    playlistQuestions = new Collection<PlaylistQuestion>(this);

    @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE'})
    creator?: User;

    constructor({ name, creator }: CreatePlaylist) {
        this.name = name;
        this.creator = creator;
    }
}

export const CreatePlaylistSchema = object({
    name: string().required()
});

export type CreatePlaylist = {
    name: string;
    playlistQuestions?: CreatePlaylistQuestion[];
    creator?: User;
};