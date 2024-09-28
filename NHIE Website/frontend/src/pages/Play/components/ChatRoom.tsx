import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { useSocket } from "../../../providers/SocketProvider";
import { useAuth } from "../../../providers/AuthProvider";

const ChatRoom = () => {
  const { id } = useParams<{id: string}>();
  const socket = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleNewMessage = (message: string) => {
      setMessages((msgs) => [...msgs, message]);
    };

    socket?.on("chat message", handleNewMessage);
  
    // Cleanup on component unmount
    return () => {
      socket?.off("chat message", handleNewMessage);
    };
  }, [socket]);

  const sendMessage = () => {
    const message = inputRef.current?.value.trim();
    if (message) {
      socket?.emit("chat message", { userId: user?.id, roomId: id, message });
      if (inputRef.current) inputRef.current.value = ''; // Clear input field after sending
    }
  };
  

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };
  

  return (
    <div className="mt-8 p-4 bg-gray-100 rounded shadow-md">
      <h2 className="text-2xl font-semibold mb-2">Chat Room</h2>
      <ul className="mb-4 max-h-60 overflow-auto">
        {messages.map((msg, index) => (
          <li key={index} className="p-2 border-b border-gray-200">{msg}</li>
        ))}
      </ul>
      <div className="flex">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-l"
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-r shadow-md hover:bg-blue-600 transition duration-300"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
