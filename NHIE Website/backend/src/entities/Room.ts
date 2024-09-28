import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { v4 } from "uuid";
import { Playlist } from "./Playlist";
import { object } from "yup";
import { RoomPlayer } from "./RoomPlayer";

@Entity()
export class Room {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => Playlist, { nullable: true, primary: true })
  playlist: Playlist;

  @OneToMany(() => RoomPlayer, (e) => e.roomId)
  roomPlayers = new Collection<RoomPlayer>(this);

  @Property()
  votesCounter: number = 0;

  @Property()
  questionIndex: number = 0;

  constructor({ playlist }: CreateRoom) {
    this.playlist = playlist;
  }
}

export const CreateRoomSchema = object({
  playlist: object().required(),
});

export type CreateRoom = {
  playlist: Playlist;
  roomPlayers?: RoomPlayer[];
};
