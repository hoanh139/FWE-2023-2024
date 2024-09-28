import express from "express";
import http from "http";

import {
  EntityManager,
  EntityRepository,
  MikroORM,
  RequestContext,
} from "@mikro-orm/core";

import {
  Playlist,
  PlaylistQuestion,
  Question,
  Room,
  RoomPlayer,
  User,
  UserPlaylist,
} from "./entities";
import { PlaylistController } from "./controller/Playlist.controller";
import { QuestionController } from "./controller/Question.controller";
import { AuthController } from "./controller/auth.controller";
import { Auth } from "./middleware/auth.middleware";
import { Server } from "socket.io";
import cors from "cors";
import setupSocketServer from "./controller/Socket.controller";
import { runScript } from "./middleware/readFile.middleware";
import { RoomController } from "./controller/Room.controller";

const app = express();
const PORT = 3000;

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

export const DI = {} as {
  server: http.Server;
  orm: MikroORM;
  em: EntityManager;
  playlistRepository: EntityRepository<Playlist>;
  questionRepository: EntityRepository<Question>;
  roomRepository: EntityRepository<Room>;
  userRepository: EntityRepository<User>;
  roomPlayerRepository: EntityRepository<RoomPlayer>;
  playlistQuestionRepository: EntityRepository<PlaylistQuestion>;
  userPlaylistRepository: EntityRepository<UserPlaylist>;
};

export const initializeServer = async () => {
  // dependency injection setup
  DI.orm = await MikroORM.init();
  DI.em = DI.orm.em;
  DI.playlistRepository = DI.orm.em.getRepository(Playlist);
  DI.questionRepository = DI.orm.em.getRepository(Question);
  DI.roomRepository = DI.orm.em.getRepository(Room);
  DI.userRepository = DI.orm.em.getRepository(User);
  DI.roomPlayerRepository = DI.orm.em.getRepository(RoomPlayer);
  DI.playlistQuestionRepository = DI.orm.em.getRepository(PlaylistQuestion);
  DI.userPlaylistRepository = DI.orm.em.getRepository(UserPlaylist);

  await runScript();

  app.use((req, res, next) => {
    console.info(`New request to ${req.path}`);
    next();
  });

  // global middleware
  app.use(express.json());
  app.use((req, res, next) => RequestContext.create(DI.orm.em, next));
  app.use(Auth.prepareAuthentication);

  // routes
  app.use("/auth", AuthController);
  app.use("/question", QuestionController);
  app.use("/playlist", PlaylistController);
  app.use("/room", RoomController);

  setupSocketServer(io);

  app.use(express.json());

  app.get("/", (req, res) => {
    res.send("Hello World");
  });

  DI.server = server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
};

if (process.env.environment !== "test") {
  initializeServer();
}
