import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from "react";
import { useSocket } from "../../context/SocketContext";

interface Message {
  id: string;
  text: string;
  sender: string;
  time: string;
}

const Chat = () => {
  const { socket, onlineUsers } = useSocket();

  const [msg, setMsg] = useState<string>("");

  const sendMessage = () => {
    if (msg.trim() && socket) {
      socket.emit("message", msg);

      setMsg("");
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMsg(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "1rem" }}>
      <h2>Chat</h2>

      <div style={{ display: "flex", gap: "8px" }}>
        <input
          value={msg}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
