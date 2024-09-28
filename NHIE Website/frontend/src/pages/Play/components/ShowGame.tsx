// ShowGame.tsx
//in this file we are going to show the stats of the game
//we are going to show the players and the votes

/*
  1. Fetch players from backend
  2. Display them 
  3. implement socket on player joined
*/

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../../../providers/SocketProvider";
import { useAuth } from "../../../providers/AuthProvider";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
  Button,
} from "@chakra-ui/react";

interface RoomPlayer {
  playerId: {
    email: string;
    id: string;
    firstName: string;
    lastName: string;
  };
  voted: boolean;
  vote: boolean;
  voteKick: number;
  haveCounter: number;
  haveNotCounter: number;
}

type QuestionResponse = {
  question: string;
};

const ShowGame = () => {
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const { id } = useParams();
  const socket = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [totalPlayers, setTotalPlayers] = useState(1);
  const [kickVotedPlayers, setKickVotedPlayers] = useState<string[]>([]);

  const { isOpen, onOpen, onClose } = useDisclosure(); //Disclosure for modal element

  async function fetchPlayers() {
    try {
      if (id) {
        const response = await axios.get<RoomPlayer[]>(
          "http://localhost:3000/room/player/" + id
        );

        const players: RoomPlayer[] = response.data;

        setPlayers(players);
        setTotalPlayers(players.length);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
      //toast.error("Error fetching players");
    }
  }

  useEffect(() => {
    socket?.on("fetch-player", () => {
      fetchPlayers();
    });

    socket?.on("kick-player", (data) => {
      const { playerToKick } = data;

      if (playerToKick == user?.id) {
        socket?.emit("leave-room", { roomId: id });
        navigate("/home");
      }
    });

    socket?.on("next-question", (data: QuestionResponse) => {
      //open finish game modal
      if (data.question == "no more questions") onOpen();
    });
  }, [socket]);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const hanldeOnKick = (playerId: string) => {
    setKickVotedPlayers((prevState) => [...prevState, playerId]);
    socket?.emit("vote-kick", {
      playerId: playerId,
      roomId: id,
      playersLength: totalPlayers,
    });
  };

  const handleOnModalClose = () => {
    socket?.emit("destroy-game", { roomId: id });
    onClose();
    navigate("/home");
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow-md">
      <h1 className="text-3xl font-bold mb-4">Connected Players</h1>
      <ul>
        {players.map((player) => (
            <li
                key={player.playerId.id}
                className="bg-gray-100 p-4 rounded-md mb-4 flex items-center justify-between hover:bg-gray-200 transition-colors"
            >
              <div>
                <h3 className="text-lg font-semibold">
                  {player.playerId.firstName}
                </h3>
                {player.voted && (
                    <p
                        className={`text-sm font-medium ${
                            player.vote ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {player.vote ? "I have" : "I have not"}
                    </p>
                )}
              </div>
              <div
                  className={`w-6 h-6 rounded-full ${
                      player.voted
                          ? player.vote
                              ? "bg-green-500"
                              : "bg-red-500"
                          : "bg-gray-300"
                  }`}
                  aria-label={player.voted ? (player.vote ? "Voted yes" : "Voted no") : "Has not voted"}
              ></div>
              <div className="flex items-center gap-2">
                {kickVotedPlayers.includes(player.playerId.id) ? (
                    <p className="text-xs text-gray-500">Vote pending...</p>
                ) : (
                    <button
                        className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-colors"
                        onClick={() => hanldeOnKick(player.playerId.id)}
                        aria-label={`Kick ${player.playerId.firstName}`}
                    >
                      Kick
                    </button>
                )}
                {player.voteKick > 0 && (
                    <p className="text-xs font-medium">
                      {player.voteKick}/{totalPlayers}
                    </p>
                )}
              </div>
            </li>
        ))}
      </ul>


      <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
        <ModalOverlay/>
        <ModalContent>
          <ModalHeader>Game statistics</ModalHeader>
          <ModalBody>
            <table style={{width: "100%", tableLayout: "fixed"}}>
              <thead>
              <tr>
                <th style={{width: "33.33%"}}>Player name</th>
                <th style={{width: "33.33%"}}>I have</th>
                <th style={{width: "33.33%"}}>I have not</th>
              </tr>
              </thead>
              <tbody>
              {players.map((player) => (
                  <tr>
                    <td style={{width: "33.33%", textAlign: "center"}}>
                      {player.playerId.firstName +
                          " " +
                          player.playerId.lastName}
                    </td>
                    <td style={{width: "33.33%", textAlign: "center"}}>
                      {player.haveCounter}
                    </td>
                    <td style={{width: "33.33%", textAlign: "center"}}>
                      {player.haveNotCounter}
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleOnModalClose}>
              Leave game
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ShowGame;
