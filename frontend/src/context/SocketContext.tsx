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
  user: any;
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
  const [user, setUser] = useState();

  useEffect(() => {
    console.log("Attempting to connect to socket server...");

    // Get user from localStorage safely
    const storedUser = localStorage.getItem("user");
    let userId: string | null = null;

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        userId = parsedUser?.id;
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
      }
    }

    if (!userId) {
      console.warn("No userId found in localStorage");
      return;
    }

    const newSocket = io("http://localhost:8000", {
      query: { userId },
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
    <SocketContext.Provider value={{ socket, user }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContextProvider;

// Custom hook to use the socket context
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    return { socket: null, user: null };
  }
  return context;
};
