import { useEffect, useRef, useCallback } from "react";

interface UseViewPollingOptions {
  enabled: boolean;
  interval?: number;
  onPoll: () => Promise<void>;
  dependencies?: unknown[];
}

export function useViewPolling({
  enabled,
  interval = 5000,
  onPoll,
  dependencies = [],
}: UseViewPollingOptions) {
  const intervalRef = useRef<number | null>(null);
  const isPollingRef = useRef(false);
  const onPollRef = useRef(onPoll);

  useEffect(() => {
    onPollRef.current = onPoll;
  }, [onPoll]);

  const clearPollingInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refresh = useCallback(() => {
    return onPollRef.current();
  }, []);

  const startPolling = useCallback(() => {
    clearPollingInterval();

    if (!enabled) return;

    intervalRef.current = window.setInterval(() => {
      if (!isPollingRef.current && !document.hidden) {
        isPollingRef.current = true;
        onPollRef.current()
          .catch((error) => {
            console.error("Polling error:", error);
          })
          .finally(() => {
            isPollingRef.current = false;
          });
      }
    }, interval);
  }, [enabled, interval, clearPollingInterval]);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      clearPollingInterval();
    } else if (enabled) {
      startPolling();
    }
  }, [enabled, startPolling, clearPollingInterval]);

  useEffect(() => {
    if (!enabled) {
      clearPollingInterval();
      return;
    }

    onPollRef.current()
      .catch((error) => {
        console.error("Initial poll error:", error);
      })
      .finally(() => {
        startPolling();
      });

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearPollingInterval();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, clearPollingInterval, handleVisibilityChange, startPolling, ...dependencies]);

  return {
    refresh,
    clearPolling: clearPollingInterval,
  };
}
