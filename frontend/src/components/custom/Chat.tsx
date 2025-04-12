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
import { Send, Search, Smile } from "lucide-react";

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

    const token = localStorage.getItem("token");
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

    const token = localStorage.getItem("token");
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
      setReceiverDetails(res.data);
    } catch (err) {
      console.error("Error fetching receiver details", err);
    } finally {
      setIsFetchingUser(false);
    }
  };

  // Fetch chat history
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

  // Send new message
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

  const filtered = filteredConversations.filter(
    (convo) => convo.user._id.toString() !== user.id.toString()
  );

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
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, receiverId, user?.id]);

  if (!user?.id) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <div className="mb-4 text-xl font-medium text-gray-700">
            Loading chat...
          </div>
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600"></div>
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
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Left sidebar with conversations list */}
      <div className="flex w-80 flex-col border-r border-gray-200 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-medium text-emerald-700">
            {user.firstName?.charAt(0)}
            {user.lastName?.charAt(0)}
          </div>
        </div>

        {/* Search */}
        <div className="border-b border-gray-200 p-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full rounded-md border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading conversations...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              {searchQuery
                ? "No conversations match your search"
                : "No conversations yet"}
            </div>
          ) : (
            filtered.map((conv) => (
              <div
                key={conv.user?._id}
                onClick={() => handleSelectConversation(conv.user._id)}
                className={`cursor-pointer border-b border-gray-100 p-4 transition hover:bg-gray-50 ${
                  receiverId === conv.user?._id ? "bg-gray-50" : ""
                }`}
              >
                <div className="flex items-start">
                  {/* Avatar */}
                  <div
                    className={`mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                      receiverId === conv.user?._id
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {getUserInitials(conv.user?.firstName, conv.user?.lastName)}
                  </div>

                  {/* Conversation details */}
                  <div className="flex-1 overflow-hidden">
                    <div className="mb-1 flex items-center justify-between">
                      <span
                        className={`text-sm ${
                          conv.unreadCount > 0
                            ? "font-semibold text-gray-900"
                            : "font-medium text-gray-700"
                        }`}
                      >
                        {conv.user?.firstName} {conv.user?.lastName}
                      </span>
                      {conv.latestMessage && (
                        <span
                          className={`text-xs ${
                            conv.unreadCount > 0
                              ? "text-emerald-600"
                              : "text-gray-500"
                          }`}
                        >
                          {formatDate(conv.latestMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`truncate text-xs ${
                          conv.unreadCount > 0
                            ? "font-medium text-gray-800"
                            : "text-gray-500"
                        }`}
                      >
                        {conv.latestMessage
                          ? truncateText(conv.latestMessage.content, 30)
                          : "Start a conversation"}
                      </span>

                      {conv.unreadCount > 0 && (
                        <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-xs font-medium text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right side chat area */}
      {receiverId ? (
        <div className="flex flex-1 flex-col bg-white">
          {/* Chat header */}
          <div className="flex items-center border-b border-gray-200 px-6 py-3">
            {isFetchingUser ? (
              <div className="text-sm text-gray-500">Loading user...</div>
            ) : receiverDetails ? (
              <div className="flex items-center">
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-medium text-emerald-700">
                  {getUserInitials(
                    receiverDetails?.firstName,
                    receiverDetails?.lastName
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {receiverDetails?.firstName} {receiverDetails?.lastName}
                  </h3>
                  {receiverDetails?.status && (
                    <p className="text-xs text-gray-500">
                      {receiverDetails.status}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Select a conversation</div>
            )}
          </div>

          {/* Messages container */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-400">
                  💬
                </div>
                <h3 className="mb-2 text-base font-medium text-gray-800">
                  No messages yet
                </h3>
                <p className="text-sm text-gray-500">
                  Start the conversation by sending a message below.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => {
                  const isCurrentUser = msg.sender === user.id;
                  const showDateHeader =
                    index === 0 ||
                    new Date(msg.createdAt).toDateString() !==
                      new Date(messages[index - 1].createdAt).toDateString();

                  return (
                    <React.Fragment key={msg._id}>
                      {showDateHeader && (
                        <div className="my-4 flex justify-center">
                          <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                            {new Date(msg.createdAt).toLocaleDateString([], {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      )}

                      <div
                        className={`flex ${
                          isCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isCurrentUser
                              ? "bg-emerald-50 text-gray-800"
                              : "bg-white text-gray-800"
                          } shadow-sm`}
                        >
                          <div className="text-sm">{msg.content}</div>
                          <div
                            className={`mt-1 text-right text-xs text-gray-500`}
                          >
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Message input */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex items-center rounded-lg border border-gray-300 bg-white">
              <button className="flex h-10 w-10 items-center justify-center text-gray-500 hover:text-emerald-500">
                <Smile className="h-5 w-5" />
              </button>

              <input
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
              />

              <button
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                className={`mr-1 flex h-8 w-8 items-center justify-center rounded-full ${
                  message.trim()
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center bg-white text-center">
          <div className="mb-6 text-5xl text-gray-300">💬</div>
          <h2 className="mb-3 text-xl font-medium text-gray-800">
            Select a conversation
          </h2>
          <p className="max-w-md text-sm text-gray-500">
            Choose a conversation from the sidebar or start a new chat to begin
            messaging
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
