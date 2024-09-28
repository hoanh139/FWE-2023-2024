import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { object } from "yup";
import { Room } from "./Room";
import { User } from "./User";

@Entity()
export class RoomPlayer {
  @ManyToOne(() => User, { nullable: true, primary: true })
  playerId: User;

  @ManyToOne(() => Room, { nullable: true, primary: true })
  roomId: Room;

  @Property()
  voted: boolean = false;

  @Property()
  vote: boolean = false;

  @Property()
  voteKick: number = 0;

  // counter for i have
  @Property()
  haveCounter: number = 0;

  // counter for i have not
  @Property()
  haveNotCounter: number = 0;

  constructor({ playerId, roomId }: CreateRoomPlayer) {
    this.playerId = playerId;
    this.roomId = roomId;
  }
}

export const CreateRoomPlayerSchema = object({
  playerId: object().required(),
  roomId: object().required(),
});

export type CreateRoomPlayer = {
  playerId: User;
  roomId: Room;
};
