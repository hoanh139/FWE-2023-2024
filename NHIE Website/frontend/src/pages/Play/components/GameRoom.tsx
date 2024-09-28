// GameRoom.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSocket } from "../../../providers/SocketProvider";
import { useAuth } from "../../../providers/AuthProvider";
import { MdContentCopy } from 'react-icons/md';

/* TODO:
    1. Unregister user from room.
    2. Implement players list
    3. Implement voting
*/

type QuestionResponse = {
  question: string;
};

const GameRoom = () => {
  const { id } = useParams();
  const socket = useSocket();
  const { user } = useAuth();

  const [question, setQuestion] = useState("");
  const [voted, setVoted] = useState(false);
  const [nextQuestionAvailable, setNextQuestionAvailable] = useState(false);
  const [socketAvailable, setSocketAvailable] = useState(false);

  const userId = user?.id;

  useEffect(() => {
    //emit the message and setting the question in the callback
    socket?.emit(
      "get-question",
      { roomId: id },
      (response: QuestionResponse) => {
        setQuestion(response.question);
      }
    );

    return () => {
      console.log("UNMOUNT");
    };
  }, []);

  useEffect(() => {
    socket?.on("next-question", (data: QuestionResponse) => {
      setVoted(false);
      setQuestion(data.question);
    });

    socket?.on("voting-finished", () => {
      setNextQuestionAvailable(true);
    });

    setSocketAvailable(true);
  }, [socket]);

  useEffect(() => {
    socket?.emit(
      "get-question",
      { roomId: id },
      (response: QuestionResponse) => {
        setQuestion(response.question);
      }
    );

    socket?.emit("reconnect-room", { roomId: id });
  }),
    [socketAvailable];

  const onNextQuestion = () => {
    if (nextQuestionAvailable) {
      socket?.emit("next-question", { roomId: id });
      setNextQuestionAvailable(false);
    } else {
      toast.info("Wait for all players to vote");
    }
  };

  const vote = (voteValue: boolean) => {
    if (!voted) {
      socket?.emit("vote", { userId: userId, roomId: id, vote: voteValue });
      setVoted(true);
    } else {
      toast.error("You have already voted for this question.");
    }
  };

  const copyRoomIdToClipboard = async () => {
    if (id === undefined) {
      // Handle the case where 'id' is undefined
      toast.error("Room ID is not available.");
      return;
    }

    try {
      await navigator.clipboard.writeText(id);
      toast.success("Room ID copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy Room ID.");
    }
  };


  return (
      <div className="max-w-md mx-auto p-4 bg-white rounded shadow-md">
        <h1 className="text-3xl font-bold mb-4">Game Room</h1>
        <div className="mb-4 flex justify-between items-center">
          <span className="font-medium">Room ID: {id}</span>
          <MdContentCopy className="cursor-pointer" size="1.5em" onClick={copyRoomIdToClipboard}/>
        </div>

        {/* Separate box for the question */}
        <div className="mb-4 p-4 bg-gray-100 rounded shadow-md">
          <p className="text-xl font-semibold">{question}</p>
        </div>

        {/* Separate box for voting options */}
          <div className="mt-8 p-4 bg-gray-100 rounded shadow-md">
            <div className="flex flex-col gap-4">
              <button
                  onClick={() => vote(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded shadow-md hover:bg-green-600 transition duration-300"
              >
                I Have
              </button>
              <button
                  onClick={() => vote(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 transition duration-300"
              >
                I Have Not
              </button>
            </div>
        </div>

        {/* Next Question button */}
        <div className="mt-4">
          <button
              onClick={onNextQuestion}
              className="bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition duration-300"
          >
            Next Question
          </button>
        </div>

        <ToastContainer/>
      </div>
  );
};

export default GameRoom;
