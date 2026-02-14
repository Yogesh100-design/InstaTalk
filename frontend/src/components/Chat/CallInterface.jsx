import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff, X } from "lucide-react";
import { useState, useEffect } from "react";

const CallInterface = ({ 
  callType = "video", // "audio" | "video"
  callStatus = "outgoing", // "incoming" | "outgoing" | "connected" | "ended"
  remoteUser = { username: "User", avatar: "" },
  onAccept,
  onReject,
  onEnd,
  isMuted = false,
  isVideoOff = false,
  onToggleMute,
  onToggleVideo,
  localVideoRef,
  remoteVideoRef
}) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let timer;
    if (callStatus === "connected") {
      timer = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (callStatus === "ended") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full h-full md:w-[90%] md:h-[90%] md:max-w-4xl md:max-h-[800px] bg-black md:rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header / Remote User Info */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-4 text-white">
             <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center font-bold text-xl border-2 border-white/20 overflow-hidden">
                {remoteUser.avatar ? (
                   <img src={remoteUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                   <span>{remoteUser.username?.[0]?.toUpperCase()}</span>
                )}
             </div>
             <div>
               <h3 className="text-lg font-bold shadow-sm">{remoteUser.username}</h3>
               <p className="text-sm text-gray-300 font-medium">
                 {callStatus === "connected" ? formatTime(duration) : 
                  callStatus === "incoming" ? "Incoming Call..." : "Calling..."}
               </p>
             </div>
          </div>
          {callStatus === "incoming" && (
             <div className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold ring-1 ring-blue-500/50">
               {callType === "video" ? "Video Call" : "Audio Call"}
             </div>
          )}
        </div>

        {/* Video Area */}
        <div className="flex-1 relative flex items-center justify-center bg-gray-800">
           {/* Remote Stream */}
           {callType === "video" && callStatus === "connected" ? (
             <div className="w-full h-full bg-gray-900 relative">
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover" 
                />
             </div>
           ) : (
             // Avatar Display for Audio Calls or Non-Video State
             <div className="flex flex-col items-center justify-center gap-6 animate-pulse">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-700 flex items-center justify-center font-bold text-6xl text-gray-400 border-4 border-gray-600">
                  {remoteUser.avatar ? (
                     <img src={remoteUser.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                     <span className="text-white">{remoteUser.username?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="text-gray-400 text-lg font-medium tracking-wide">
                   {callStatus === "connected" ? "Connected" : "Connecting..."}
                </div>
             </div>
           )}

           {/* Local Video Stream (Picture-in-Picture) */}
           {callType === "video" && (
             <div className={`absolute bottom-24 right-4 w-32 h-48 md:w-48 md:h-72 bg-gray-900 rounded-xl border-2 border-gray-700 shadow-xl overflow-hidden z-20 ${callStatus !== "connected" ? "hidden" : ""}`}>
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover scale-x-[-1]" 
                />
             </div>
           )}
        </div>

        {/* Controls */}
        <div className="p-8 bg-gray-900/80 backdrop-blur-md flex justify-center items-center gap-6 md:gap-10 pb-10 md:pb-8">
           
           {callStatus === "incoming" ? (
             <>
                <button 
                  onClick={onReject}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 group-hover:bg-red-500 group-hover:text-white flex items-center justify-center transition-all duration-300 ring-2 ring-red-500/50">
                     <PhoneOff size={32} />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Decline</span>
                </button>

                <button 
                  onClick={onAccept}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 group-hover:bg-green-500 group-hover:text-white flex items-center justify-center transition-all duration-300 ring-2 ring-green-500/50 animate-bounce">
                     <Phone size={32} />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Accept</span>
                </button>
             </>
           ) : (
             <>
               <button 
                  onClick={onToggleMute}
                  className={`p-4 rounded-full transition-all ${isMuted ? 'bg-white text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
               >
                 {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
               </button>

               {callType === "video" && (
                 <button 
                    onClick={onToggleVideo}
                    className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-white text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                 >
                   {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                 </button>
               )}

               <button 
                  onClick={onEnd}
                  className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/30 scale-110"
               >
                 <PhoneOff size={28} />
               </button>
             </>
           )}
        </div>
      </div>
    </div>
  );
};

export default CallInterface;
