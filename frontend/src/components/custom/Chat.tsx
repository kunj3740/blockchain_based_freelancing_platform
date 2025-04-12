import React, {
  useState,
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
} from "react";
import axios from "axios";
import { useSocket } from "../../context/SocketContext";
import { BACKEND_URL } from "../../config";
import { useParams } from "react-router-dom";

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  createdAt: string;
  metadata?: {
    type: "text";
  };
}

interface MessagePayload {
  sender: string;
  receiver: string;
}

const ChatComponent: React.FC = () => {
  const { id: receiverId } = useParams<{ id: string }>();
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { socket, user } = useSocket();
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  console.log(user);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔁 Fetch chat history
  const fetchMessages = async () => {
    if (!user?.id || !receiverId) return;

    try {
      const payload: MessagePayload = {
        sender: user.id,
        receiver: receiverId,
      };
      const res = await axios.post(`${BACKEND_URL}/api/messages/get`, payload);
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  };

  // ▶️ Send new message
  const sendMessage = async () => {
    if (!message.trim() || !receiverId?.trim() || !user?.id) return;

    const payload = {
      sender: user.id,
      receiver: receiverId,
      content: message,
      metadata: { type: "text" },
    };

    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_URL}/api/messages/send`, payload);
      const sentMsg: Message = res.data;
      setMessages((prev) => [...prev, sentMsg]);
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
    if (e.key === "Enter") sendMessage();
  };

  useEffect(() => {
    if (receiverId && user?.id) {
      fetchMessages();
    }
  }, [receiverId, user?.id]);

  useEffect(() => {
    if (!socket || !user?.id || !receiverId) return;

    function handleMessage(data: Message) {
      if (
        (data.sender === receiverId && data.receiver === user.id) ||
        (data.sender === user.id && data.receiver === receiverId)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    }

    socket.on("newMessage", handleMessage);
    return () => {
      socket.off("newMessage", handleMessage);
    };
  }, [socket, receiverId, user?.id]);

  if (!user?.id) {
    return <div>Loading chat...</div>;
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "auto",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        height: "80vh",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
        Chat with {receiverId}
      </h2>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg._id}
            style={{
              textAlign: msg.sender === user.id ? "right" : "left",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                display: "inline-block",
                backgroundColor: msg.sender === user.id ? "#dcf8c6" : "#fff",
                padding: "8px 12px",
                borderRadius: "16px",
                maxWidth: "75%",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
        <input
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          style={{ flex: 1, padding: "8px", borderRadius: "4px" }}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
