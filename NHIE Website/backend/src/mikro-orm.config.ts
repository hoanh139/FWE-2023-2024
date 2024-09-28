import { Options } from '@mikro-orm/core';
import {Playlist, PlaylistQuestion, Question, Room, RoomPlayer, User, UserPlaylist} from "./entities";

const options: Options = {
    type: 'postgresql',
    entities: [Playlist, Question, Room, User, RoomPlayer, PlaylistQuestion, UserPlaylist],
    dbName: 'nhieDB',
    user: 'nhieDBUser',
    password: 'WS23',
    debug: true,
};

export default options;
