import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextProps {
  children: ReactNode;
}

export const SocketContext = createContext<Socket | null>(null);

const SocketProvider: React.FC<SocketContextProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    // Clean up socket connection on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

const useSocket = (): Socket | null => {
  // React looks up the component tree to find the nearest SocketContext.Provider and uses the value prop provided by that provider.
  const context = useContext(SocketContext);
  if (!context) {
    console.log("socket not there yet");
    return null;
  }
  return context;
};

export { SocketProvider, useSocket };
