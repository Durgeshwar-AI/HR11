import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useAuth } from "./useAuth";

interface TokenResult {
  token: string | null;
  roomName: string | null;
  interviewId: string | null;
  loading: boolean;
  error: string | null;
}

export function useLiveKitToken(jobId: string | null): TokenResult {
  const { token: authToken } = useAuth();
  const [state, setState] = useState<TokenResult>({
    token: null,
    roomName: null,
    interviewId: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!jobId || !authToken) return;

    const fetchToken = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const data = await api<{ token: string; roomName: string; interviewId: string }>(
          "/interview/token",
          {
            method: "POST",
            body: { jobId },
            token: authToken,
          }
        );
        setState({
          token: data.token,
          roomName: data.roomName,
          interviewId: data.interviewId,
          loading: false,
          error: null,
        });
      } catch (err: unknown) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Unknown error",
        }));
      }
    };

    fetchToken();
  }, [jobId, authToken]);

  return state;
}
