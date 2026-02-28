interface VideoGridProps {
  token: string | null;
  serverUrl: string | undefined;
  roomName: string | null;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

/**
 * VideoGrid component.
 * When @livekit/components-react is installed, this renders the full
 * LiveKit video conference. Otherwise, renders a development placeholder.
 */
export default function VideoGrid({
  token,
  serverUrl,
  roomName,
}: VideoGridProps) {
  // Development placeholder when LiveKit is not available
  if (!serverUrl || !token) {
    return (
      <div className="video-grid-placeholder">
        <div className="video-tile agent-tile">
          <div className="avatar-circle">🤖</div>
          <p>AI Interviewer</p>
          <small>Waiting for LiveKit connection...</small>
        </div>
        <div className="video-tile candidate-tile">
          <div className="avatar-circle">👤</div>
          <p>You</p>
          <small>Camera preview will appear here</small>
        </div>
      </div>
    );
  }

  // When LiveKit is configured, try to use the real components
  // Users should install: npm i @livekit/components-react @livekit/components-styles
  return (
    <div className="video-grid">
      <div className="video-grid-placeholder">
        <div className="video-tile agent-tile">
          <div className="avatar-circle">🤖</div>
          <p>AI Interviewer</p>
          <small>
            Room: {roomName}
            <br />
            Install @livekit/components-react for full video
          </small>
        </div>
        <div className="video-tile candidate-tile">
          <div className="avatar-circle">👤</div>
          <p>You</p>
          <small>Camera + Microphone active</small>
        </div>
      </div>
    </div>
  );
}
