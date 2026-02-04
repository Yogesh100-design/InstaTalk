import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import API from "../../services/api";

const ENDPOINT = "http://localhost:5000";

export default function ChatBox({ chatId, user }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // 🔹 init socket ONCE
  useEffect(() => {
    socketRef.current = io(ENDPOINT);

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // 🔹 handle chat join + messages
  useEffect(() => {
    if (!chatId || !socketRef.current) return;

    const socket = socketRef.current;

    socket.emit("join_chat", chatId);

    const loadMessages = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/message/${chatId}`);
        setMessages(data);
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages(); // ✅ async-safe

    const handleReceiveMessage = (message) => {
      // Check both 'chat' (mongoose ref) and 'chatId' (fallback) properties
      const msgChatId = message.chat || message.chatId;
      if (msgChatId === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.emit("leave_chat", chatId);
    };
  }, [chatId]);

  // 🔹 auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    if ((e.type === "click" || e.key === "Enter") && newMsg.trim()) {
      try {
        const msg = newMsg;
        setNewMsg("");

        const { data } = await API.post("/message", {
          chatId,
          content: msg
        });

        socketRef.current.emit("send_message", {
          chatId,
          message: data
        });

        setMessages((prev) => [...prev, data]);
      } catch (err) {
        console.error("Failed to send message", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
        {messages.map((m, i) => {
          // Robust ID check handling populated/unpopulated sender and user.id/_id mismatch
          const msgSenderId = typeof m.sender === "object" ? (m.sender._id || m.sender.id) : m.sender;
          const currentUserId = user._id || user.id;
          const isMe = String(msgSenderId) === String(currentUserId);
          
          return (
            <div key={i} className={`flex w-full ${isMe ? "justify-end" : "justify-start items-end gap-2"}`}>
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                  {m.sender?.avatar ? (
                     <img src={m.sender.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                     <span>{m.sender?.username?.[0]?.toUpperCase() || "?"}</span>
                  )}
                </div>
              )}
              
              <div
                className={`max-w-[70%] px-4 py-2 text-sm shadow-md transition-all duration-200 ${
                  isMe
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-3xl rounded-br-sm"
                    : "bg-gray-800 text-gray-100 border border-gray-700 rounded-3xl rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-gray-800 flex gap-2">
        <input
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(e)}
          className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-full"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="p-3 bg-blue-600 rounded-full"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
