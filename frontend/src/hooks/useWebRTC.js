import { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";

const useWebRTC = (currentUser) => {
  const { socket } = useSocket();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callStatus, setCallStatus] = useState(null); // "incoming" | "outgoing" | "connected" | "ended"
  const [callType, setCallType] = useState("video"); // "audio" | "video"
  const [remoteUser, setRemoteUser] = useState(null);
  const [incomingCallData, setIncomingCallData] = useState(null);

  const pcRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("call_user", ({ signal, from }) => {
      // console.log("Incoming call from", from);
      setCallStatus("incoming");
      setIncomingCallData({ signal, from });
      // In a real app, you'd fetch user details for 'from' here or pass them
      // For now, we might receive just the ID or basic info
      // setRemoteUser({ ... }); 
    });

    socket.on("call_accepted", (signal) => {
      setCallStatus("connected");
      pcRef.current.setRemoteDescription(new RTCSessionDescription(signal));
    });

    socket.on("ice-candidate", (candidate) => {
        if (pcRef.current) {
            pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
    });

    socket.on("call_ended", () => {
      endCall();
    });

    return () => {
      socket.off("call_user");
      socket.off("call_accepted");
      socket.off("ice-candidate");
      socket.off("call_ended");
    };
  }, [socket]);

  const startCall = async (userToCall, type) => {
    setCallType(type);
    setCallStatus("outgoing");
    setRemoteUser(userToCall);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: type === "video", 
        audio: true 
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = createPeerConnection(userToCall._id); // Pass target ID for candidates
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call_user", {
        userToCall: userToCall._id,
        signalData: offer,
        from: currentUser._id,
      });

    } catch (err) {
      console.error("Error starting call:", err);
      endCall();
    }
  };

  const answerCall = async () => {
    setCallStatus("connected");
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: callType === "video", 
        audio: true 
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = createPeerConnection(incomingCallData.from);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCallData.signal));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer_call", { 
        signal: answer, 
        to: incomingCallData.from 
      });

    } catch (err) {
        console.error("Error answering call", err);
        endCall();
    }
  };

  const createPeerConnection = (targetId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { 
          candidate: event.candidate, 
          to: targetId 
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pcRef.current = pc;
    return pc;
  };

  const endCall = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    setCallStatus(null);
    setIncomingCallData(null);
    if (remoteUser && socket) {
         // Notify other party
         socket.emit("end_call", { to: remoteUser._id || incomingCallData?.from });
    }
    setRemoteUser(null);
  };
  
  const rejectCall = () => {
      if (incomingCallData?.from && socket) {
          socket.emit("end_call", { to: incomingCallData.from });
      }
      setCallStatus(null);
      setIncomingCallData(null);
  };

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);



  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return {
    localStream,
    remoteStream,
    callStatus,
    callType,
    remoteUser,
    incomingCallData,
    startCall,
    answerCall,
    endCall,
    rejectCall,
    localVideoRef,
    remoteVideoRef,
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo
  };
};

export default useWebRTC;
