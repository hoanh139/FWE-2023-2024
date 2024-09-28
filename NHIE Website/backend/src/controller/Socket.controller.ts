import { Server } from "socket.io";
import { DI } from "../server";
import {
  CreateRoom,
  CreateRoomPlayer,
  Playlist,
  PlaylistQuestion,
  Question,
  Room,
  RoomPlayer,
  User,
} from "../entities";
import { EntityManager } from "@mikro-orm/postgresql";

export type createRoomData = {
  userId: string;
  playlistId: string;
};

export type joinRoomData = {
  userId: string;
  roomId: string;
};

export type voteData = {
  userId: string;
  roomId: string;
  vote: boolean;
};

export type nextData = {
  roomId: string;
};

export type VoteKickData = {
  playerId: string;
  roomId: string;
  playersLength: number;
};

const setupSocketServer = (io: Server) => {
  //registering the connection with the client
  io.on("connection", (socket) => {
    console.log("connected: ", socket.id);

    //handling the disconnect event
    socket.on("disconnect", (reason) => {
      console.log("disconected:", reason);
    });

    //handling the request for a new room event
    socket.on("create-room", async (data: createRoomData) => {
      //Getting the user and playlist from the DB. IDs come from the message
      const { userId, playlistId, ...rest } = data;
      try {
        const em = DI.em.fork();
        const user = await em.getRepository(User).findOne({
          id: userId,
        });
        const playlist = await em.getRepository(Playlist).findOne({
          id: playlistId,
        });

        //Creating the room and the room player
        if (playlist && user) {
          const createRoom: CreateRoom = {
            playlist: playlist,
          };
          const room = new Room(createRoom);

          const createRoomPlayer: CreateRoomPlayer = {
            playerId: user,
            roomId: room,
          };

          //creating the room player and adding him to the room
          const roomPlayer: RoomPlayer = new RoomPlayer(createRoomPlayer);
          room.roomPlayers.add(roomPlayer);

          //does this also persist the created room as cascade?
          await em.persistAndFlush(roomPlayer);

          //registering the socket to the room
          socket.join(room.id);

          //Getting the next question
          const question: string = await getCurrentQuestion(room);

          socket.emit("create-room-confirmation", {
            roomId: room.id,
            question: question,
          });
        }
      } catch (error) {
        console.log(error);
        socket.emit("error", { code: "error on create room" });
      }
    });

    //handling the request to join an existing room event
    socket.on("join-room", async (data: joinRoomData) => {
      try {
        //getting the room and the user from the DB. The IDs come from the message payload
        const { roomId, userId, ...rest } = data;
        const em = DI.em.fork();

        const room = await em.getRepository(Room).findOne({
          id: roomId,
        });

        const user = await em.getRepository(User).findOne({
          id: userId,
        });

        //creating the room player and adding him to the room
        if (room && user) {
          const createRoomPlayer: CreateRoomPlayer = {
            playerId: user,
            roomId: room,
          };
          const roomPlayer: RoomPlayer = new RoomPlayer(createRoomPlayer);

          socket.join(room.id);

          //adding new player to the room
          room.roomPlayers.add(roomPlayer);
          em.persistAndFlush(room);

          //getting the current question
          const question: string = await getCurrentQuestion(room);

          socket.emit("create-room-confirmation", {
            roomId: roomId,
            question: question,
          });

          io.to(room.id).emit("fetch-player"); //when client recives this message, he should send an API request to get the list of players of the room
        }
      } catch (error) {
        console.log("error on join room: ", error);
        socket.emit("error", { code: "error on join room" });
      }
    });

    //Event to handle when a client refreshes the page
    socket.on("reconnect-room", async (data: { roomId: string }) => {
      try {
        const { roomId } = data;
        const em = DI.em.fork();

        const room = await em.getRepository(Room).findOne({
          id: roomId,
        });
        if (room) {
          socket.join(room.id);
        }
      } catch (error) {
        console.log("error on join room: ", error);
        socket.emit("error", { code: "error on reconnecting room" });
      }
    });

    //for when a player is kicked from the game, it is also kicked from the io room
    socket.on("leave-room", (data: { roomId: string }) => {
      const { roomId } = data;
      socket.leave(roomId);
    });

    //Event for registering the votes from the players
    socket.on("vote", async (data: voteData) => {
      const { roomId, vote, userId } = data;
      const em = DI.em.fork();

      try {
        //getting the room

        const room = await em.getRepository(Room).findOne({ id: roomId });

        if (room) {
          const ioRoom = io.sockets.adapter.rooms.get(room.id);
          const playlistId = room?.playlist.id;

          //getting the player
          const roomPlayer = await em.getRepository(RoomPlayer).findOne({
            playerId: { id: userId },
            roomId: { id: roomId, playlist: playlistId },
          });

          //Registering the vote and increment the counters for statistik
          if (roomPlayer) {
            roomPlayer.voted = true;
            roomPlayer.vote = vote;
            roomPlayer.vote
              ? roomPlayer.haveCounter++
              : roomPlayer.haveNotCounter++;

            await em.persistAndFlush(roomPlayer);
          }

          //registering the users vote in the votes list from the room
          room.votesCounter += 1;

          //if all the votes have been submited
          if (room.votesCounter == ioRoom?.size) {
            //when client recieves this event he should request the roomPlayers
            //and start the routine for the guessing of who voted what
            io.to(room.id).emit("voting-finished");

            room.votesCounter = 0; //setting the counter to 0 for next question
          }
          await em.persistAndFlush(room);
          io.to(room.id).emit("fetch-player");
        }
      } catch (error) {
        console.log(error);
        socket.emit("error", { code: "error on voting" });
      }
    });

    //Event to fetch the next question
    socket.on("next-question", async (data: nextData) => {
      const { roomId } = data;
      const em = DI.em.fork();

      try {
        const room = await em.getRepository(Room).findOne({
          id: roomId,
        });

        const playlistId = room?.playlist.id;

        const players = await em.getRepository(RoomPlayer).find({
          roomId: { id: roomId, playlist: playlistId },
        });

        if (players && room) {
          for (let player of players) {
            player.voted = false;
            em.persist(player);
          }
          em.flush();

          const question = await getNextQuestion(room);
          io.to(room.id).emit("next-question", { question: question });
          io.to(room.id).emit("fetch-player", { question: question });
        }
      } catch (error) {
        console.log(error);
        socket.emit("error", { code: "error on next question event" });
      }
    });

    //Event for getting the current question
    socket.on("get-question", async (data: nextData, callback) => {
      const { roomId } = data;
      const em = DI.em.fork();

      try {
        const room = await em.getRepository(Room).findOne({
          id: roomId,
        });

        if (room) {
          const question = await getCurrentQuestion(room);
          callback({
            question: question,
          });
        }
      } catch (error) {
        console.log(error);
        socket.emit("error", { code: "error getting the question" });
      }
    });

    //Event for registering the vote kick and handle if a player has to be kicked
    socket.on("vote-kick", async (data: VoteKickData) => {
      try {
        const { playerId, roomId, playersLength } = data;
        const em = DI.em.fork();

        //get the entities
        const room = await em.getRepository(Room).findOne({
          id: roomId,
        });

        const playlistId = room?.playlist.id;

        const roomPlayer = await em.getRepository(RoomPlayer).findOne({
          playerId: { id: playerId },
          roomId: { id: roomId, playlist: playlistId },
        });

        if (roomPlayer && room) {
          //increment the vote kick count and persisting
          roomPlayer.voteKick++;
          await em.persistAndFlush(roomPlayer);

          //if the mayority of the player want to kick the player, eliminate from room
          if (roomPlayer.voteKick > Math.ceil(playersLength / 2)) {
            await em.remove(roomPlayer).flush();

            io.to(roomId).emit("kick-player", { playerToKick: playerId });
          }
          io.to(roomId).emit("fetch-player");
        }
      } catch (error) {
        console.log(error);
        socket.emit("error", { code: "error registering kick vote" });
      }
    });

    //Event to destroy the game at the end of the game
    socket.on("destroy-game", async (data) => {
      const em = DI.orm.em.fork();
      const { roomId } = data;

      try {
        const existingRoom = await em.getRepository(Room).findOne({
          id: roomId,
        });

        const roomPlayers = await em.getRepository(RoomPlayer).find({
          roomId: { id: roomId },
        });

        if (roomPlayers && existingRoom) {
          for (const roomPlayer of roomPlayers) {
            em.remove(roomPlayer);
          }

          await em.remove(existingRoom).flush();
        } else socket.emit("error", { code: "error getting the entities" });
      } catch (error) {
        console.error(error);
        socket.emit("error", { code: "error registering kick vote" });
      }
    });

    //Event to handle the chat functionality
    socket.on("chat message", async ({ userId, message }) => {
      const em = DI.em.fork();
      try {
        const user = await em.getRepository(User).findOne({ id: userId });
        const userName = user ? user.firstName : "Anonym"; // if user is not found, the message will be sent as "Anonym"
        const fullMessage = `${userName}: ${message}`;
        io.emit("chat message", fullMessage);
      } catch (error) {
        console.error(" Error ", error);
        socket.emit("error", { code: "error handeling chat messages" });
      }
    });
  });

  //Helper functions to retrive the next question from database
  async function getNextQuestion(room: Room): Promise<string> {
    //getting the information
    const em = DI.em.fork();
    const playlistId = room.playlist.id;

    //updating the index from the room
    room.questionIndex += 1;

    //getting the playlistQuestions from a playlist
    const playlistQuestions = await em.getRepository(PlaylistQuestion).find({
      playlist: playlistId,
    });

    if (room.questionIndex >= playlistQuestions.length) {
      return "no more questions";
    }

    //getting the question from the turn
    const question = await em.getRepository(Question).findOne({
      id: playlistQuestions[room.questionIndex].question.id,
    });

    await em.persistAndFlush(room);

    if (question) {
      return question?.content;
    } else {
      return "no question found";
    }
  }

  //Helper functions to retrive the current question from database
  async function getCurrentQuestion(room: Room): Promise<string> {
    //getting the information
    const em = DI.em.fork();
    const playlistId = room.playlist.id;
    const index = room.questionIndex;

    //getting the playlistQuestions from a playlist
    const playlistQuestions = await em.getRepository(PlaylistQuestion).find({
      playlist: playlistId,
    });

    if (room.questionIndex >= playlistQuestions.length) {
      return "no more questions";
    }

    //getting the question from the turn
    const question = await em.getRepository(Question).findOne({
      id: playlistQuestions[index].question.id,
    });

    if (question) {
      return question?.content;
    } else {
      return "no question found";
    }
  }
};

export default setupSocketServer;
