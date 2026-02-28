interface StatusIndicatorProps {
  connected: boolean;
}

export default function StatusIndicator({ connected }: StatusIndicatorProps) {
  return (
    <div className="status-indicator">
      <div className={`status-dot ${connected ? "connected" : "connecting"}`} />
      <span>{connected ? "Connected — AI is listening" : "Connecting..."}</span>
    </div>
  );
}
