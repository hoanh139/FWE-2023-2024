// JoinRoom.tsx
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSocket } from "../../../providers/SocketProvider";
import { useAuth } from "../../../providers/AuthProvider";
import { useNavigate } from "react-router-dom";

const JoinRoom = () => {
  const [roomId, setRoomId] = useState("");
  const socket = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    socket?.on("create-room-confirmation", (data) => {
      setRoomId(data.roomId);
      toast.success("Room created successfully");
      navigate(`/game/${data.roomId}`);
    });
  }, [socket]);

  const handleJoinRoom = async () => {
    socket?.emit("join-room", { roomId: roomId, userId: user?.id });
  };

  return (
    <div>
       <input
        type="text"
        placeholder="Enter room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="mt-1 p-2 border rounded-md w-full focus:outline-none focus:ring focus:border-blue-300"
      />

      <button
        onClick={handleJoinRoom}
        className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-green active:bg-green-800"
      >
        Join room
      </button>

      <ToastContainer />
    </div>
  );
};

export default JoinRoom;
