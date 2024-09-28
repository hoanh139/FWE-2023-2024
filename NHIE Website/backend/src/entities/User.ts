import { object, string } from 'yup';

import {Collection, Entity, OneToMany, PrimaryKey, Property} from "@mikro-orm/core";
import {v4} from "uuid";
import {RoomPlayer} from "./RoomPlayer";
import {Playlist} from "./Playlist";
import {UserPlaylist} from "./UserPlaylist";
import {Question} from "./Question";

@Entity()
export class User{
    @PrimaryKey()
    id: string = v4();

    @Property()
    email: string;

    @Property({ hidden: true })
    password: string;

    @Property()
    firstName: string;

    @Property()
    lastName: string;

    @OneToMany(() => RoomPlayer, (e) => e.playerId)
    roomPlayers = new Collection<RoomPlayer>(this);

    // Collection of favorite Playlist
    @OneToMany(() => UserPlaylist, (e) => e.player)
    userPlaylists = new Collection<UserPlaylist>(this);

    // Collection of user created Playlist
    @OneToMany(() => Playlist, (e) => e.creator)
    createdPlaylists = new Collection<Playlist>(this);

    // Collection of user created Question
    @OneToMany(() => Question, (e) => e.creator)
    createdQuestions = new Collection<Question>(this);

    constructor({ lastName, firstName, email, password }: CreateUser) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
    }
}

export const RegisterUserSchema = object({
    email: string().required(),
    password: string().required(),
    firstName: string().required(),
    lastName: string().required(),
});

export type CreateUser = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roomPlayers?: RoomPlayer[];
    userPlaylists?: UserPlaylist[];
};

export const LoginSchema = object({
    email: string().required(),
    password: string().required(),
});
