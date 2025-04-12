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
import { useParams, useNavigate } from "react-router-dom";

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  createdAt: string;
  metadata?: {
    type: string;
  };
}

interface MessagePayload {
  sender: string;
  receiver: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  status?: string;
}

interface Conversation {
  user: User;
  latestMessage: Message;
  unreadCount: number;
}

const ChatComponent: React.FC = () => {
  const { id: receiverId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [receiverDetails, setReceiverDetails] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const { socket, user } = useSocket();
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [isFetchingUser, setIsFetchingUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch conversations list
  const fetchConversations = async () => {
    if (!user?.id) return;

    const token = localStorage.getItem("token"); // make sure the token is stored with this key
    if (!token) {
      console.error("No token found in localStorage");
      return;
    }

    try {
      setIsLoadingConversations(true);
      const res = await axios.get(
        `${BACKEND_URL}/api/messages/conversations/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res);
      setConversations(res.data);
    } catch (err) {
      console.error("Error fetching conversations", err);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Fetch receiver details
  const fetchReceiverDetails = async () => {
    if (!receiverId) return;

    // if (!user?.id) return;

    console.log("hgello");

    const token = localStorage.getItem("token"); // make sure the token is stored with this key
    if (!token) {
      console.error("No token found in localStorage");
      return;
    }

    try {
      setIsFetchingUser(true);
      const res = await axios.get(
        `${BACKEND_URL}/api/messages/receiver/${receiverId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res, "Receiver Id");
      setReceiverDetails(res.data);
    } catch (err) {
      console.error("Error fetching receiver details", err);
    } finally {
      setIsFetchingUser(false);
    }
  };

  // 🔁 Fetch chat history
  const fetchMessages = async () => {
    if (!user?.id || !receiverId) return;

    try {
      setLoading(true);
      const payload: MessagePayload = {
        sender: user.id,
        receiver: receiverId,
      };
      const res = await axios.post(`${BACKEND_URL}/api/messages/get`, payload);
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages", err);
    } finally {
      setLoading(false);
    }
  };

  // ▶️ Send new message
  // After sending a message, append it to the state instead of refetching all messages
  const sendMessage = async () => {
    if (!message.trim() || !receiverId?.trim() || !user?.id) return;

    const payload = {
      sender: user.id,
      receiver: receiverId,
      content: message,
      metadata: { type: "text" },
    };

    try {
      const res = await axios.post(`${BACKEND_URL}/api/messages/send`, payload);
      const sentMsg = res.data.data;

      // Update the messages state directly instead of refetching
      setMessages((prevMessages) => [...prevMessages, sentMsg]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  let filteredConversations = conversations.filter((conv) =>
    `${conv.user?.firstName} ${conv.user?.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // filteredConversations;

  const filtered = filteredConversations.filter(
    (convo) => convo.user._id.toString() !== user.id.toString()
  );
  console.log(user);
  console.log(filtered);

  const handleSelectConversation = (userId: string) => {
    navigate(`/chat/${userId}`);
  };

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    }
  }, [user?.id]);

  useEffect(() => {
    if (receiverId && user?.id) {
      fetchMessages();
      fetchReceiverDetails();
    }
  }, [receiverId, user?.id]);

  useEffect(() => {
    if (!socket || !user?.id) return;

    // Message received handler
    const handleNewMessage = (data: any) => {
      // Only update if message is relevant to current conversation
      if (
        receiverId &&
        ((data.sender === receiverId && data.receiver === user.id) ||
          (data.sender === user.id && data.receiver === receiverId))
      ) {
        // Check if message is already in state to avoid duplicates
        setMessages((prevMessages) => {
          const messageExists = prevMessages.some(
            (msg) => msg._id === data._id
          );
          if (messageExists) return prevMessages;
          return [...prevMessages, data];
        });
      }

      // No need to refresh entire conversation list here
      // Just update the relevant conversation
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, receiverId, user?.id]);
  if (!user?.id) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div
            style={{ fontSize: "24px", marginBottom: "15px", color: "#075e54" }}
          >
            Loading chat...
          </div>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "3px solid #128C7E",
              borderTopColor: "transparent",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          ></div>
        </div>
      </div>
    );
  }

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format date for conversation list
  const formatDate = (timestamp: string) => {
    const now = new Date();
    const messageDate = new Date(timestamp);

    // Today
    if (messageDate.toDateString() === now.toDateString()) {
      return formatTime(timestamp);
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    // This week
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    if (messageDate > oneWeekAgo) {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days[messageDate.getDay()];
    }

    // Older
    return messageDate.toLocaleDateString([], {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  // Get user initials for avatar
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0)}${lastName?.charAt(0)}`.toUpperCase();
  };

  // Truncate text for preview
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        backgroundColor: "#f5f5f5",
        overflow: "hidden",
      }}
    >
      {/* Left sidebar with conversations list */}
      <div
        style={{
          width: "350px",
          borderRight: "1px solid #e0e0e0",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#075e54",
            color: "white",
            padding: "15px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px" }}>Messages</h2>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#128C7E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "white",
              fontWeight: "bold",
            }}
          >
            {user.firstName?.charAt(0)}
            {user.lastName?.charAt(0)}
          </div>
        </div>

        {/* Search */}
        <div
          style={{ padding: "10px 15px", borderBottom: "1px solid #e0e0e0" }}
        >
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              width: "100%",
              padding: "10px 15px",
              borderRadius: "20px",
              border: "1px solid #e0e0e0",
              outline: "none",
              backgroundColor: "#f0f0f0",
            }}
          />
        </div>

        {/* Conversations list */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {isLoadingConversations ? (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#666" }}
            >
              Loading conversations...
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#666" }}
            >
              {searchQuery
                ? "No conversations match your search"
                : "No conversations yet"}
            </div>
          ) : (
            filtered.map((conv) => (
              <div
                key={conv.user?._id}
                onClick={() => handleSelectConversation(conv.user._id)}
                style={{
                  padding: "15px",
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex",
                  cursor: "pointer",
                  backgroundColor:
                    receiverId === conv.user?._id ? "#f0f0f0" : "white",
                  transition: "background-color 0.2s",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor:
                      receiverId === conv.user?._id ? "#128C7E" : "#e0e0e0",
                    color: receiverId === conv.user?._id ? "white" : "#666",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "15px",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  {getUserInitials(conv.user?.firstName, conv.user?.lastName)}
                </div>

                {/* Conversation details */}
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "5px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: conv.unreadCount > 0 ? "bold" : "normal",
                        fontSize: "16px",
                        color: "#333",
                      }}
                    >
                      {conv.user?.firstName} {conv.user?.lastName}
                    </div>
                    {conv.latestMessage && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: conv.unreadCount > 0 ? "#128C7E" : "#999",
                        }}
                      >
                        {formatDate(conv.latestMessage.createdAt)}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        color: conv.unreadCount > 0 ? "#333" : "#666",
                        fontWeight: conv.unreadCount > 0 ? "bold" : "normal",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        maxWidth: "210px",
                      }}
                    >
                      {conv.latestMessage
                        ? truncateText(conv.latestMessage.content, 30)
                        : "Start a conversation"}
                    </div>

                    {conv.unreadCount > 0 && (
                      <div
                        style={{
                          backgroundColor: "#25D366",
                          color: "white",
                          borderRadius: "50%",
                          minWidth: "20px",
                          height: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          padding: "0 5px",
                        }}
                      >
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right side chat area */}
      {receiverId ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#e5ddd5", // WhatsApp background color
            position: "relative",
            backgroundImage:
              "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZGRkNSIvPjxwYXRoIGQ9Ik0wIDEwMGgxMDBtMTAwIDBoLTEwMG0wLTEwMHYxMDBtMCAxMDB2LTEwMCIgc3Ryb2tlPSIjZDFjN2JkIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==')",
            backgroundRepeat: "repeat",
            backgroundSize: "100px 100px",
          }}
        >
          {/* Chat header */}
          <div
            style={{
              padding: "10px 16px",
              backgroundColor: "#f0f0f0",
              color: "#333",
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid #e0e0e0",
              height: "65px",
            }}
          >
            {isFetchingUser ? (
              <div>Loading user...</div>
            ) : receiverDetails ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "50%",
                    backgroundColor: "#128C7E",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "15px",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  {getUserInitials(
                    receiverDetails?.firstName,
                    receiverDetails?.lastName
                  )}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px" }}>
                    {receiverDetails?.firstName} {receiverDetails?.lastName}
                  </h3>
                </div>
              </div>
            ) : (
              <div>Select a conversation</div>
            )}
          </div>

          {/* Messages container */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {loading ? (
              <div
                style={{ textAlign: "center", padding: "20px", color: "#666" }}
              >
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#666",
                  textAlign: "center",
                  padding: "0 20px",
                }}
              >
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                    fontSize: "40px",
                    color: "#999",
                  }}
                >
                  💬
                </div>
                <h3 style={{ margin: "0 0 10px", color: "#333" }}>
                  No messages yet
                </h3>
                <p>Start the conversation by sending a message below.</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isCurrentUser = msg.sender === user.id;
                const showDateHeader =
                  index === 0 ||
                  new Date(msg.createdAt).toDateString() !==
                    new Date(messages[index - 1].createdAt).toDateString();

                return (
                  <React.Fragment key={msg._id}>
                    {showDateHeader && (
                      <div
                        style={{
                          textAlign: "center",
                          margin: "10px 0",
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: "rgba(225, 245, 254, 0.92)",
                            borderRadius: "8px",
                            padding: "5px 12px",
                            fontSize: "12px",
                            boxShadow: "0 1px 0.5px rgba(0, 0, 0, 0.13)",
                            color: "#263238",
                          }}
                        >
                          {new Date(msg.createdAt).toLocaleDateString([], {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}

                    <div
                      style={{
                        alignSelf: isCurrentUser ? "flex-end" : "flex-start",
                        maxWidth: "70%",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: isCurrentUser ? "#dcf8c6" : "white",
                          padding: "8px 12px",
                          borderRadius: "7.5px",
                          position: "relative",
                          boxShadow: "0 1px 0.5px rgba(0, 0, 0, 0.13)",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            marginRight: "35px",
                            wordBreak: "break-word",
                          }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Message input */}
          <div
            style={{
              padding: "10px 16px",
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              borderTop: "1px solid #e0e0e0",
            }}
          >
            <button
              style={{
                backgroundColor: "#f1f1f1",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#555",
                fontSize: "20px",
              }}
            >
              😊
            </button>

            <input
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "20px",
                border: "none",
                outline: "none",
                backgroundColor: "white",
                fontSize: "15px",
              }}
            />

            <button
              onClick={sendMessage}
              disabled={loading || !message.trim()}
              style={{
                backgroundColor: "#00a884",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: message.trim() ? "pointer" : "default",
                opacity: message.trim() ? 1 : 0.5,
                fontSize: "18px",
              }}
            >
              {loading ? "•••" : "➤"}
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f8f9fa",
            color: "#667781",
            textAlign: "center",
            padding: "0 50px",
          }}
        >
          <div style={{ fontSize: "70px", marginBottom: "20px" }}>💬</div>
          <h2
            style={{ marginBottom: "10px", color: "#41525d", fontSize: "32px" }}
          >
            Welcome to the Chat App
          </h2>
          <p style={{ fontSize: "16px", maxWidth: "560px", lineHeight: "1.5" }}>
            Select a conversation from the left or start a new chat to begin
            messaging
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
