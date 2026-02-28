import { useState } from "react";

interface ControlBarProps {
  onLeave: () => void;
}

export default function ControlBar({ onLeave }: ControlBarProps) {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  return (
    <div className="control-bar">
      <button
        className={`control-btn ${micOn ? "" : "off"}`}
        onClick={() => setMicOn(!micOn)}
        title={micOn ? "Mute Microphone" : "Unmute Microphone"}
      >
        {micOn ? "🎤" : "🔇"}
        <span>{micOn ? "Mic On" : "Mic Off"}</span>
      </button>

      <button
        className={`control-btn ${camOn ? "" : "off"}`}
        onClick={() => setCamOn(!camOn)}
        title={camOn ? "Turn Off Camera" : "Turn On Camera"}
      >
        {camOn ? "📷" : "📷‍🚫"}
        <span>{camOn ? "Cam On" : "Cam Off"}</span>
      </button>

      <button
        className="control-btn leave"
        onClick={onLeave}
        title="Leave Interview"
      >
        📞
        <span>Leave</span>
      </button>
    </div>
  );
}
