import React, { useState, ChangeEvent, KeyboardEvent, useEffect } from "react";
import axios from "axios";
import { useSocket } from "../../context/SocketContext";
import { BACKEND_URL } from "../../config";
import { useParams } from "react-router-dom";

interface MessagePayload {
  sender: string;
  receiver: string;
  content: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  metadata?: {
    type?: "text" | "offer" | "order" | "delivery";
    relatedId?: string;
    additionalData?: Record<string, any>;
  };
}

const ChatComponet: React.FC = () => {
  const { id: receiverId } = useParams();
  console.log(receiverId);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { socket, user } = useSocket();

  const sendMessage = async () => {
    if ((!message.trim() || !receiverId) && receiverId!.trim()) return;

    const payload: MessagePayload = {
      sender: user.id,
      receiver: receiverId!,
      content: message,
      metadata: { type: "text" },
    };

    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_URL}/api/messages/send`, payload);
      console.log("Sent message:", res.data);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  useEffect(() => {
    function handleMessage(data: any) {
      console.log(data);
    }
    socket?.on("newMessage", handleMessage);
  }, []);

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "1rem" }}>
      <h2>Send Message</h2>

      <input
        placeholder="Receiver ID"
        value={receiverId}
        style={{ marginBottom: "10px", width: "100%", padding: "8px" }}
      />

      <div style={{ display: "flex", gap: "8px" }}>
        <input
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          style={{ flex: 1, padding: "8px" }}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatComponet;
