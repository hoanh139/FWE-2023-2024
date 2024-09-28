import { Router } from "express";
import { DI } from "../server";
import { Server } from "socket.io";
import {PlaylistQuestion, Question, Room, RoomPlayer} from "../entities";

const router = Router({ mergeParams: true });

router.get("/player/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const em = DI.em.fork();
    const roomplayers = await em.getRepository(RoomPlayer).find(
        {roomId: { id: id }},
        {populate: ['playerId', 'roomId']}
    );
    if (roomplayers.length == 0) {
      return res.status(404).send({ errors: ["Room not found"] });
    }

    res.status(200).send(roomplayers);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

/**
 * Delete a room by id
 */
router.delete('/:id', async (req, res) => {
  const em = DI.orm.em.fork();

  try {
    const existingRoom = await em.getRepository(Room).findOne({
      id: req.params.id
    });
    if (!existingRoom) {
      return res.status(403).json({errors: [`You can't delete this room`]});
    }

    const roomPlayers = await em.getRepository(RoomPlayer).find({
      roomId: {id: req.params.id},
    });
    for (const roomPlayer of roomPlayers) {
      em.remove(roomPlayer);
    }

    await em.remove(existingRoom).flush();
    return res.status(200).send({message: `Room ${req.params.id} deleted successfully`});
  } catch (error) {
    console.error(error);
    res.status(500).send({error: 'Internal Server Error'});
  }
});

/**
 * Delete players from room
 */
router.delete('/:id/player', async (req, res) => {
  const em = DI.orm.em.fork();
  const { id } = req.params;

  try {
    const existingRoom = await em.getRepository(Room).findOne(
        {id: id},
        {populate: ['roomPlayers']}
    );
    if (!existingRoom) {
      return res.status(403).json({errors: [`You can't delete this room`]});
    }

    if (!req.body.playerIds || !Array.isArray(req.body.playerIds)) {
      return res.status(400).send({error: 'Invalid or missing player ids in the request body'});
    }

    for (const playerid of req.body.playerIds) {
      const playerId = existingRoom.roomPlayers.getItems().find(
          (rp) => rp.playerId.id === playerid
      );

      if (playerId) {
        em.remove(playerId);
      } else {
        return res.status(404).send({error: `Player with id ${id} not found`});
      }
    }

    await em.persistAndFlush(existingRoom);

    res.status(200).send({message: `Players from Room ${id} deleted successfully`});
  } catch (error) {
    console.error(error);
    res.status(500).send({error: 'Internal Server Error'});
  }
});

export const RoomController = router;
