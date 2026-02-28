import { useParams, useNavigate } from "react-router-dom";
import { useLiveKitToken } from "../hooks/useLiveKitToken";
import VideoGrid from "../components/VideoGrid";
import ControlBar from "../components/ControlBar";
import StatusIndicator from "../components/StatusIndicator";
import { useState } from "react";

export default function InterviewRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { token, roomName, loading, error } = useLiveKitToken(roomId || null);
  const [isConnected, setIsConnected] = useState(false);

  const livekitUrl = import.meta.env.VITE_LIVEKIT_URL;

  const handleDisconnected = () => {
    navigate("/candidate/dashboard?status=complete");
  };

  if (loading) {
    return (
      <div className="interview-loading">
        <div className="spinner" />
        <h2>Preparing your interview room...</h2>
        <p>Please ensure your camera and microphone are enabled</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="interview-error">
        <h2>Unable to join interview</h2>
        <p>{error}</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/candidate/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // If LiveKit SDK is available, render the full room
  // Otherwise render a placeholder for development
  return (
    <div className="interview-room">
      <StatusIndicator connected={isConnected} />

      <div className="interview-main">
        <VideoGrid
          token={token}
          serverUrl={livekitUrl}
          roomName={roomName}
          onConnected={() => setIsConnected(true)}
          onDisconnected={handleDisconnected}
        />
      </div>

      <ControlBar onLeave={handleDisconnected} />
    </div>
  );
}
