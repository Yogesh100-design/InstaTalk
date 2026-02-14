import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { user } = useAuth();

    const ENDPOINT = "https://instatalk-tyq7.onrender.com";
    // const ENDPOINT = "http://localhost:5000";

    useEffect(() => {
        if (user) {
            console.log("Connecting socket to:", ENDPOINT);
            const socketIo = io(ENDPOINT, {
                reconnection: true,
                timeout: 10000,
                transports: ["websocket"],
            });
            setSocket(socketIo);

            const handleConnect = () => {
                console.log("Socket connected, emitting setup for user:", user?._id || user?.id);
                socketIo.emit("setup", user);
            };

            socketIo.on("connect", handleConnect);
            
            // If already connected by the time we add listener
            if (socketIo.connected) {
                handleConnect(); 
            }

            socketIo.on("connect_error", (err) => {
                console.error("Socket Connection Error:", err.message);
            });

            socketIo.on("online_users", (users) => {
                // console.log("Online users received:", users);
                setOnlineUsers(users);
            });

            return () => {
                socketIo.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
