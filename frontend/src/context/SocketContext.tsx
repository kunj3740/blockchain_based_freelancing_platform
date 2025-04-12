import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";

// Define the shape of the context value
interface SocketContextType {
  socket: Socket | null;
}

// Create context with default value
const SocketContext = createContext<SocketContextType | null>(null);

// Define props for the provider component
interface SocketContextProviderProps {
  children: ReactNode;
}

const SocketContextProvider: React.FC<SocketContextProviderProps> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    console.log("Attempting to connect to socket server...");

    const id = localStorage.getItem("id");

    console.log(id);

    const newSocket = io("http://localhost:8000", {
      query: { userId: id },
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket server with ID:", newSocket.id);
      setSocket(newSocket);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection failed:", err);
    });

    return () => {
      if (newSocket) {
        console.log("Disconnecting socket...");
        newSocket.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContextProvider;

// Custom hook to use the socket context
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    return { socket: null };
  }
  return context;
};
