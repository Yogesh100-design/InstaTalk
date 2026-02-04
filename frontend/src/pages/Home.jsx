import { useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import ChatBox from "../components/Chat/ChatBox";

export default function Home() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get(`/user?search=${searchTerm}`);
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const createChat = async (userId) => {
    try {
      const { data } = await API.post("/chat", { userId });
      setSelectedChat(data);
    } catch (error) {
      console.error("Error accessing chat:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-1/3 max-w-sm border-r border-gray-700 flex flex-col bg-gray-800">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-bold text-lg">
                {user?.username?.[0]?.toUpperCase()}
             </div>
             <h1 className="text-xl font-bold tracking-tight">{user?.username}</h1>
          </div>
          <button
            onClick={logout}
            className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
          >
            Logout
          </button>
        </div>
        
        <div className="p-4">
           <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 p-2 scrollbar-thin scrollbar-thumb-gray-600">
          {users.map((u) => (
            <div
              key={u._id}
              onClick={() => createChat(u._id)}
              className={`p-3 flex items-center gap-3 cursor-pointer rounded-lg transition-all ${
                selectedChat?.participants?.some(p => p._id === u._id) || selectedChat?.participants?.some(p => p === u._id)
                  ? "bg-blue-600 shadow-lg"
                  : "hover:bg-gray-700"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center font-medium">
                {u.username[0].toUpperCase()}
              </div>
              <div>
                 <p className="font-medium text-sm">{u.username}</p>
                 <p className="text-xs text-gray-400 truncate">{u.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-900 relative">
        {selectedChat ? (
          <ChatBox chatId={selectedChat._id} user={user} key={selectedChat._id} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-60">
             <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
             </div>
             <p className="text-lg font-medium">Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
