import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function ChatBox({ chatId, user }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    if (chatId) {
      socket.emit("join_chat", chatId);

      socket.on("receive_message", (message) => {
        setMessages((prev) => [...prev, message]);
      });
    }
  }, [chatId]);

  const sendMessage = () => {
    if (!newMsg) return;
    const message = { sender: user._id, content: newMsg, chatId };
    socket.emit("send_message", { chatId, message });
    setMessages((prev) => [...prev, message]);
    setNewMsg("");
  };

  return (
    <div>
      <div>
        {messages.map((m, i) => (
          <p key={i}><b>{m.sender.username || "Me"}:</b> {m.content}</p>
        ))}
      </div>
      <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
