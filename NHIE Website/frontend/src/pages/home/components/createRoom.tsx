// CreateRoom.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useSocket } from "../../../providers/SocketProvider";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../providers/AuthProvider";
import { useNavigate } from "react-router-dom";

/*
  
  3. game logic in room

  //nice to have: kick player
*/

interface Playlist {
  id: string;
  name: string;
}

const CreateRoom = () => {
  const [roomId, setRoomId] = useState<string>("");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const socket = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    socket?.on("create-room-confirmation", (data) => {
      setRoomId(data.roomId);
      toast.success("Room created successfully");
      navigate(`/game/${data.roomId}`);
    });

    socket?.on("error", (data) => {
      toast.error("Could not create the room");
      console.log("error:", data.code);
    });
  }, [socket]);

  const fetchPlaylists = async () => {
    try {
      const response = await axios.get<Playlist[]>(
        "http://localhost:3000/playlist"
      );
      setPlaylists(response.data);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      toast.error("Error fetching playlists");
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleCreateRoom = async () => {
    if (!selectedPlaylist) {
      toast.error("Please select a playlist");
      return;
    }

    socket?.emit("create-room", {
      userId: user?.id,
      playlistId: selectedPlaylist,
    });
  };

  return (
    <div>
      <label className="block text-gray-700 text-sm font-bold mb-2">
        
        <select
          value={selectedPlaylist || ""}
          onChange={(e) => setSelectedPlaylist(e.target.value || null)}
          className="mt-1 p-2 border rounded-md w-full focus:outline-none focus:ring focus:border-blue-300 appearance-none"
        >
          <option value="" disabled>
            Select a Playlist
          </option>
          {playlists.map((playlist) => (
            <option key={playlist.id} value={playlist.id}>
              {playlist.name}
            </option>
          ))}
        </select>
      </label>
      <button
        onClick={handleCreateRoom}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-blue active:bg-blue-800"
      >
        Create Room
      </button>
      {roomId && <p>Room ID: {roomId}</p>}
      <ToastContainer />
    </div>
  );
};

export default CreateRoom;
